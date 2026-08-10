import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build_bypass', {
  apiVersion: "2023-10-16" as any,
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: stripeAccount } = await supabaseAdmin
      .from("stripe_accounts")
      .select("stripe_account_id, onboarding_complete")
      .eq("user_id", user.id)
      .single();

    if (!stripeAccount || !stripeAccount.stripe_account_id) {
      return NextResponse.json({ onboarding_complete: false });
    }

    // Always fetch latest status from Stripe to sync in case webhooks failed
    const account = await stripe.accounts.retrieve(stripeAccount.stripe_account_id);
    const isComplete = account.details_submitted && account.charges_enabled;

    if (isComplete !== stripeAccount.onboarding_complete) {
      await supabaseAdmin
        .from("stripe_accounts")
        .update({ onboarding_complete: isComplete })
        .eq("user_id", user.id);
    }

    return NextResponse.json({ onboarding_complete: isComplete });
  } catch (error: any) {
    console.error("Stripe Status Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
