import { createClient } from "@/lib/supabase/server";
import { Settings, Shield, Bell } from "lucide-react";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <div className="space-y-8 fade-in-up">
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-[var(--foreground)] tracking-tight">
          Settings
        </h1>
        <p className="text-[var(--foreground)]/60 mt-1 font-medium">
          Manage your account preferences and security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 space-y-2">
          <button className="w-full text-left px-4 py-3 bg-[#10B981]/10 text-[#10B981] font-bold rounded-xl flex items-center gap-3">
            <Settings size={20} /> General
          </button>
          <button className="w-full text-left px-4 py-3 text-[var(--foreground)]/70 hover:bg-[var(--surface-elevated)] font-medium rounded-xl flex items-center gap-3 transition-colors">
            <Shield size={20} /> Security
          </button>
          <button className="w-full text-left px-4 py-3 text-[var(--foreground)]/70 hover:bg-[var(--surface-elevated)] font-medium rounded-xl flex items-center gap-3 transition-colors">
            <Bell size={20} /> Notifications
          </button>
        </div>

        <div className="col-span-1 md:col-span-2">
          <div className="pixis-card bg-white p-8 border border-[var(--border-subtle)]">
            <h2 className="text-xl font-bold mb-6">General Preferences</h2>
            <form className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] block mb-2">Email Address</label>
                <input type="email" className="input-field w-full opacity-50 cursor-not-allowed" defaultValue={user.email} disabled />
                <p className="text-xs text-[var(--text-tertiary)] mt-1">To change your email, please contact support.</p>
              </div>
              <div className="pt-4 border-t border-[var(--border-subtle)]">
                <h3 className="text-red-500 font-bold mb-2">Danger Zone</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <button type="button" className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                  Delete Account
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}