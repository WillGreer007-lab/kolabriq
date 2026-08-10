import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { campaignId } = await request.json();

    if (!campaignId) {
      return NextResponse.json({ error: "Campaign ID required" }, { status: 400 });
    }

    // Check if link already exists
    const { data: existingLink } = await supabase
      .from("campaign_links")
      .select("short_code")
      .eq("campaign_id", campaignId)
      .eq("creator_id", user.id)
      .single();

    if (existingLink) {
      return NextResponse.json({ short_code: existingLink.short_code });
    }

    // Generate a unique 6-character short code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortCode = '';
    for (let i = 0; i < 6; i++) {
      shortCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Insert new link
    const { data: newLink, error } = await supabase
      .from("campaign_links")
      .insert([
        {
          campaign_id: campaignId,
          creator_id: user.id,
          short_code: shortCode
        }
      ])
      .select("short_code")
      .single();

    if (error) {
      console.error("Insert link error:", error);
      return NextResponse.json({ error: "Failed to generate link" }, { status: 500 });
    }

    return NextResponse.json({ short_code: newLink.short_code });
  } catch (error: any) {
    console.error("Link Generator Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
