import { createClient } from "@/lib/supabase/server";
import { UserCircle } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <div className="space-y-8 fade-in-up">
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-[var(--foreground)] tracking-tight">
          Profile
        </h1>
        <p className="text-[var(--foreground)]/60 mt-1 font-medium">
          Manage your public profile information.
        </p>
      </div>

      <div className="pixis-card bg-white p-8 border border-[var(--border-subtle)] max-w-2xl">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
            <UserCircle size={48} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user.user_metadata?.full_name || user.user_metadata?.company_name}</h2>
            <p className="text-[var(--text-secondary)]">{user.email}</p>
          </div>
        </div>

        <form className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-[var(--text-primary)] block mb-2">Display Name</label>
            <input type="text" className="input-field w-full" defaultValue={user.user_metadata?.full_name || ""} />
          </div>
          <div>
            <label className="text-sm font-semibold text-[var(--text-primary)] block mb-2">Bio / Description</label>
            <textarea className="input-field w-full h-32" placeholder="Tell us about yourself..."></textarea>
          </div>
          <button type="button" className="btn-primary py-3 px-6">Save Changes</button>
        </form>
      </div>
    </div>
  );
}