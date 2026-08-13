import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { orderId, saleAmount } = await request.json();

    if (!orderId || !saleAmount) {
      return NextResponse.json({ error: "Missing required fields: orderId, saleAmount" }, { status: 400 });
    }

    // Get the first-party tracking cookie
    const cookieStore = await cookies();
    const shortCode = cookieStore.get("adswish_ref")?.value;

    if (!shortCode) {
      return NextResponse.json({ message: "No tracking cookie found, skipping attribution" });
    }

    // Use admin client for conversions since this might be called server-to-server or anonymously
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find the associated link and campaign
    const { data: link, error: linkError } = await supabaseAdmin
      .from("campaign_links")
      .select("id, creator_id, campaign_id, campaigns(commission_percentage)")
      .eq("short_code", shortCode)
      .single();

    if (linkError || !link) {
      return NextResponse.json({ error: "Invalid tracking code" }, { status: 400 });
    }

    // Calculate commission
    const commissionPercentage = Array.isArray(link.campaigns) 
      ? link.campaigns[0]?.commission_percentage 
      : (link.campaigns as any)?.commission_percentage;
      
    if (!commissionPercentage) {
      return NextResponse.json({ error: "Campaign does not have a performance commission set" }, { status: 400 });
    }

    const commissionAmount = (Number(saleAmount) * (Number(commissionPercentage) / 100)).toFixed(2);

    // 1. Log the conversion
    const { data: conversion, error: conversionError } = await supabaseAdmin
      .from("conversions")
      .insert([{
        campaign_id: link.campaign_id,
        creator_id: link.creator_id,
        order_id: orderId,
        amount: Number(saleAmount),
        currency: 'gbp',
        status: 'pending'
      }])
      .select()
      .single();

    // If conversion error is a duplicate order_id, it means we already tracked it.
    if (conversionError) {
      console.error("Conversion tracking error:", conversionError);
      return NextResponse.json({ error: "Failed to log conversion or already logged" }, { status: 400 });
    }

    await supabaseAdmin
      .from("ledger_entries")
      .insert([{
        campaign_id: link.campaign_id,
        creator_id: link.creator_id,
        amount_total: Number(saleAmount),
        amount_creator: Number(commissionAmount),
        amount_platform: Number(commissionAmount) * 0.1, // Platform takes 10% of commission
        currency: 'gbp',
        status: 'pending' // Pending until business pays invoice
      }]);

    return NextResponse.json({ 
      success: true, 
      commissionAmount,
      message: "Conversion successfully attributed to creator" 
    });

  } catch (error: any) {
    console.error("Conversion Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
