"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserCircle, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
  });

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) {
          setProfile(data);
          setFormData({
            full_name: data.full_name || user.user_metadata?.full_name || "",
            bio: data.bio || "",
          });
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (user) {
        await supabase.from("profiles").update({
          full_name: formData.full_name,
          bio: formData.bio,
        }).eq("id", user.id);
        
        // Also update unified profiles in business/creator if needed, but profiles table is the source of truth for bio
        await supabase.from("creator_profiles").update({ bio: formData.bio }).eq("id", user.id).select().single().then(() => {}).catch(() => {});
        alert("Profile saved successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving profile.");
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#10B981]" size={32} /></div>;
  }

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

      <div className="pixis-card bg-white p-8 border border-[var(--border-subtle)] w-full max-w-2xl">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
            <UserCircle size={48} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{formData.full_name}</h2>
            <p className="text-[var(--foreground)]/60">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-[var(--foreground)] block mb-2">Display Name</label>
            <input 
              type="text" 
              required
              value={formData.full_name}
              onChange={(e) => setFormData(f => ({ ...f, full_name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] focus:border-[#10B981] outline-none transition-all font-medium" 
            />
          </div>
          <div>
            <label className="text-sm font-bold text-[var(--foreground)] block mb-2">Bio / Description</label>
            <textarea 
              value={formData.bio}
              onChange={(e) => setFormData(f => ({ ...f, bio: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] focus:border-[#10B981] outline-none transition-all font-medium h-32 resize-none" 
              placeholder="Tell brands about yourself..."
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary py-3 px-8 flex items-center gap-2">
            {saving ? <Loader2 className="animate-spin" size={18} /> : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}