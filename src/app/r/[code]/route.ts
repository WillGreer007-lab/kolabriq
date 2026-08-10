import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    if (!code) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Must use admin client to read links and write clicks, as anonymous user has no RLS access
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find the link
    const { data: link, error } = await supabaseAdmin
      .from("campaign_links")
      .select("id, campaign_id, campaigns(target_url)")
      .eq("short_code", code)
      .single();

    if (error || !link) {
      console.error("Invalid tracking link:", code);
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Log the click asynchronously (don't block redirect)
    const ipHash = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    supabaseAdmin.from("clicks").insert([
      {
        link_id: link.id,
        ip_hash: ipHash, // In production, hash this for GDPR compliance
        user_agent: userAgent
      }
    ]).then(({ error }) => {
      if (error) console.error("Error logging click:", error);
    });

    // Extract target url (fallback to home if missing)
    const targetUrl = Array.isArray(link.campaigns) 
        ? link.campaigns[0]?.target_url 
        : (link.campaigns as any)?.target_url;
        
    const finalDestination = targetUrl || request.url;

    // Create a response that redirects
    const response = NextResponse.redirect(finalDestination);

    // Set first-party cookie for 30 days
    const cookieStore = await cookies();
    response.cookies.set('kolabriq_ref', code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return response;
  } catch (error: any) {
    console.error("Redirect Error:", error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
