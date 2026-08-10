import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build_bypass', {
  apiVersion: "2023-10-16" as any,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { campaignId, creatorId, amount } = body;

    if (!campaignId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch the campaign to verify the business owns it
    const { data: campaign } = await supabaseAdmin
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (!campaign || campaign.business_id !== user.id) {
      return NextResponse.json({ error: "Campaign not found or unauthorized" }, { status: 404 });
    }

    // Determine connected account routing if paying a specific creator
    let transferData = undefined;
    if (creatorId) {
      const { data: creatorStripe } = await supabaseAdmin
        .from("stripe_accounts")
        .select("stripe_account_id, onboarding_complete")
        .eq("user_id", creatorId)
        .single();

      if (!creatorStripe || !creatorStripe.stripe_account_id || !creatorStripe.onboarding_complete) {
        return NextResponse.json({ 
          error: "Creator has not completed Stripe onboarding. They cannot receive payments yet." 
        }, { status: 400 });
      }

      const totalAmountCents = Math.round(amount * 100);
      const platformFeeCents = Math.round(totalAmountCents * 0.10); // 10% platform fee

      transferData = {
        destination: creatorStripe.stripe_account_id,
      };

      // Create checkout session with destination charges
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: `Campaign Payment: ${campaign.title}`,
              },
              unit_amount: totalAmountCents,
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          application_fee_amount: platformFeeCents,
          transfer_data: transferData,
        },
        metadata: {
          campaign_id: campaignId,
          business_id: user.id,
          creator_id: creatorId,
        },
        success_url: `${request.headers.get("origin")}/dashboard/business/campaigns?success=true`,
        cancel_url: `${request.headers.get("origin")}/dashboard/business/campaigns?canceled=true`,
      });

      return NextResponse.json({ url: session.url });
    } else {
      // Direct payment to platform without transfer data (e.g. Funding a campaign balance)
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: `Fund Campaign: ${campaign.title}`,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        metadata: {
          campaign_id: campaignId,
          business_id: user.id,
        },
        success_url: `${request.headers.get("origin")}/dashboard/business/campaigns?success=true`,
        cancel_url: `${request.headers.get("origin")}/dashboard/business/campaigns?canceled=true`,
      });

      return NextResponse.json({ url: session.url });
    }
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
