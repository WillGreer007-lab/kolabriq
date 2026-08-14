import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

// Simulated In-Memory Rate Limiter (Token Bucket)
// Note: In a serverless/edge environment like Vercel, memory is per-isolate.
// This is for demonstration as requested. In production, use Upstash Redis.
const rateLimitCache = new Map<string, { count: number, resetTime: number }>();

const MAX_REQUESTS = 50; // max 50 pings per IP
const WINDOW_MS = 60 * 1000; // per minute

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown-ip";
    const now = Date.now();

    // 1. Rate Limiting Check
    const rateData = rateLimitCache.get(ip) || { count: 0, resetTime: now + WINDOW_MS };
    if (now > rateData.resetTime) {
      rateData.count = 1;
      rateData.resetTime = now + WINDOW_MS;
    } else {
      rateData.count++;
      if (rateData.count > MAX_REQUESTS) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
      }
    }
    rateLimitCache.set(ip, rateData);

    // 2. Parse Request
    const { businessId } = await request.json();
    if (!businessId) {
      return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
    }

    // 3. Update Supabase
    // We must use the service role key to update bypassing RLS because this is a public ping
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update the campaign pixel ping time (making it "active")
    const { error } = await supabaseAdmin
      .from('campaigns')
      .update({ 
        last_pixel_ping_at: new Date().toISOString(),
        pixel_status: 'active'
      })
      .eq('business_id', businessId)
      .eq('status', 'active'); // only update active campaigns

    if (error) {
      console.error("Supabase Error updating pixel ping:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ success: true, timestamp: now });
  } catch (err) {
    console.error("Pixel Ping Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
