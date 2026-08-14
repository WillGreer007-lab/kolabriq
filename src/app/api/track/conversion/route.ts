import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { jwtVerify } from "jose";

export async function POST(request: Request) {
  try {
    const { token, businessId, orderId, amount, currency } = await request.json();

    if (!token || !businessId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Verify JWT Signature
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_do_not_use");
    let payload;
    try {
      const { payload: jwtPayload } = await jwtVerify(token, secret);
      payload = jwtPayload;
    } catch (err) {
      console.error("JWT Verification failed:", err);
      return NextResponse.json({ error: "Invalid or expired tracking token" }, { status: 401 });
    }

    const { campaign_id, creator_id } = payload as any;

    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Prevent Duplicate Conversions
    const { data: existing } = await supabaseAdmin
      .from("conversions")
      .select("id")
      .eq("order_id", orderId)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, message: "Already tracked" });
    }

    // 3. Get Campaign Commission Rate
    const { data: campaign } = await supabaseAdmin
      .from("campaigns")
      .select("commission_rate, compensation_model")
      .eq("id", campaign_id)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // 4. Calculate Earnings (90% Creator, 10% Platform)
    let totalCommission = 0;
    if (campaign.compensation_model === 'performance' || campaign.compensation_model === 'hybrid') {
      const rate = campaign.commission_rate || 0;
      totalCommission = (amount * rate) / 100;
    }

    const platformFee = totalCommission * 0.10;
    const creatorEarning = totalCommission - platformFee;

    // 5. Insert Conversion Record
    const { data: conversion, error: conversionError } = await supabaseAdmin.from("conversions").insert([{
      campaign_id,
      creator_id,
      order_id: orderId,
      amount,
      commission_earned: creatorEarning,
      platform_fee: platformFee,
      currency
    }]).select("id").single();

    if (conversionError) throw conversionError;

    // 6. Create Escrow Hold (7-day holding period)
    if (creatorEarning > 0) {
      const releaseDate = new Date();
      releaseDate.setDate(releaseDate.getDate() + 7); // 7 day hold

      await supabaseAdmin.from("escrow_holds").insert([{
        campaign_id,
        creator_id,
        business_id: businessId,
        amount: creatorEarning,
        currency,
        hold_reason: 'affiliate_conversion',
        status: 'pending',
        release_date: releaseDate.toISOString()
      }]);
      
      // Update ledger
      await supabaseAdmin.from("ledger_entries").insert([{
        campaign_id,
        creator_id,
        amount_total: creatorEarning,
        amount_fee: platformFee,
        amount_net: creatorEarning,
        currency,
        status: 'pending_escrow',
        transaction_type: 'affiliate'
      }]);
    }

    return NextResponse.json({ success: true, escrowed: creatorEarning > 0 });
  } catch (err: any) {
    console.error("Conversion Track Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
