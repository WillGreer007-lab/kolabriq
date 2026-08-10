import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build_bypass', {
  apiVersion: "2023-10-16" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed.", err.message);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Handle the event
    switch (event.type) {
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        // If requirements are disabled and details submitted, onboarding is complete
        const isComplete = account.details_submitted && account.charges_enabled;
        
        await supabaseAdmin
          .from("stripe_accounts")
          .update({ onboarding_complete: isComplete })
          .eq("stripe_account_id", account.id);
        break;
      }
      
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.payment_intent && session.metadata?.campaign_id) {
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
          
          const amountTotal = (session.amount_total || 0) / 100;
          const applicationFeeAmount = (paymentIntent.application_fee_amount || 0) / 100;
          const creatorAmount = amountTotal - applicationFeeAmount;

          await supabaseAdmin.from("ledger_entries").insert({
            business_id: session.metadata.business_id,
            campaign_id: session.metadata.campaign_id,
            creator_id: session.metadata.creator_id || null,
            stripe_payment_intent_id: paymentIntent.id,
            amount_total: amountTotal,
            amount_creator: creatorAmount,
            amount_platform: applicationFeeAmount,
            currency: session.currency || "gbp",
            status: "succeeded"
          });
        }
        break;
      }
      // Add other cases as needed
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
