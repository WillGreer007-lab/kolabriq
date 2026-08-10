import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    // 1. Verify caller is actually an admin
    const authClient = await createServerClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user || !user.user_metadata?.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Use service role to bypass RLS and fetch all auth.users
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { users }, error: authError } = await adminClient.auth.admin.listUsers();
    
    if (authError) {
      throw authError;
    }

    // 3. Fetch public.users to get roles
    const { data: profiles, error: profileError } = await adminClient
      .from('users')
      .select('id, full_name, role');
      
    if (profileError) {
      throw profileError;
    }

    // 4. Map them together
    const profileMap: Record<string, any> = {};
    profiles.forEach(p => { profileMap[p.id] = p; });

    const enrichedUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      role: profileMap[u.id]?.role || u.user_metadata?.role || "Unknown",
      full_name: profileMap[u.id]?.full_name || u.user_metadata?.full_name || "Unknown"
    }));

    return NextResponse.json({ users: enrichedUsers });
  } catch (error: any) {
    console.error("Admin API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
