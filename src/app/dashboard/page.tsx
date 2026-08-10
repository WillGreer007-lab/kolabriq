import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardIndex() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Redirect based on role in user_metadata
  const isAdmin = user.user_metadata?.is_admin;
  if (isAdmin) {
    redirect("/dashboard/admin");
  }

  const role = user.user_metadata?.role;

  if (role === 'business') {
    redirect("/dashboard/business");
  } else if (role === 'creator') {
    redirect("/dashboard/creator");
  } else {
    // Fallback if role is not set, try to fetch from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'business') {
      redirect("/dashboard/business");
    } else {
      // Default to creator or prompt them
      redirect("/dashboard/creator");
    }
  }
}
