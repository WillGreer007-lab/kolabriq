import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build_bypass', {
  apiVersion: "2023-10-16" as any,
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Need Admin client to bypass RLS for inserting stripe_accounts securely
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if account already exists
    const { data: existingAccount } = await supabaseAdmin
      .from("stripe_accounts")
      .select("stripe_account_id, onboarding_complete")
      .eq("user_id", user.id)
      .single();

    let accountId = existingAccount?.stripe_account_id;

    if (!accountId) {
      // Create a new Express account
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
        capabilities: {
          transfers: { requested: true },
        },
      });

      accountId = account.id;

      // Save to database
      await supabaseAdmin.from("stripe_accounts").insert({
        user_id: user.id,
        stripe_account_id: accountId,
        onboarding_complete: false,
      });
    }

    // Generate onboarding link
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002";
    
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/dashboard/creator/earnings?refresh=true`,
      return_url: `${origin}/dashboard/creator/earnings?success=true`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error("Stripe Connect Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
