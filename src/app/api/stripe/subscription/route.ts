import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build_bypass', {
  apiVersion: "2023-10-16" as any,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planName, amount } = body;

    if (!planName || amount === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For free plans, we can just update the DB directly without Stripe
    if (amount === 0) {
      return NextResponse.json({ url: `/dashboard?plan=${planName}` });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `${planName.charAt(0).toUpperCase() + planName.slice(1)} Plan (30 Days)`,
            },
            unit_amount: Math.round(amount * 100),
            recurring: {
              interval: "month",
            }
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        plan: planName,
      },
      success_url: `${request.headers.get("origin")}/dashboard?success=true`,
      cancel_url: `${request.headers.get("origin")}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Subscription Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
