"use client";

import { useEffect, useState } from "react";
import { Users, Mail, Loader2, Briefcase, Sparkles } from "lucide-react";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);
        setUsers(data.users || []);
      } catch (err: any) {
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  const creators = users.filter(u => u.role === 'creator');
  const businesses = users.filter(u => u.role === 'business');
  
  return (
    <div className="space-y-8 fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-[var(--foreground)] tracking-tight">
            Admin Command Center
          </h1>
          <p className="text-[var(--foreground)]/60 mt-1 font-medium">
            Master control panel for platform user management.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#10B981]" size={32} />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Businesses List */}
          <div className="pixis-card bg-white border border-[var(--border-subtle)] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#4A90E2]/10 text-[#4A90E2] flex items-center justify-center">
                  <Briefcase size={20} />
                </div>
                <h2 className="text-xl font-heading font-extrabold text-[var(--foreground)]">Business Accounts</h2>
              </div>
              <span className="text-sm font-bold text-[#4A90E2] bg-[#4A90E2]/10 px-2 py-1 rounded-md">{businesses.length} Total</span>
            </div>
            
            <div className="divide-y divide-[var(--border-subtle)] flex-1 overflow-y-auto max-h-[600px]">
              {businesses.length === 0 ? (
                <div className="p-8 text-center text-[var(--foreground)]/60 text-sm font-medium">No businesses registered yet.</div>
              ) : (
                businesses.map((u) => (
                  <div key={u.id} className="p-4 hover:bg-[#F5F5F0]/50 transition-colors flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[var(--foreground)]">{u.full_name}</div>
                      <div className="text-sm text-[var(--foreground)]/60 flex items-center gap-1.5 mt-0.5">
                        <Mail size={12} />
                        {u.email}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Creators List */}
          <div className="pixis-card bg-white border border-[var(--border-subtle)] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <h2 className="text-xl font-heading font-extrabold text-[var(--foreground)]">Creator Accounts</h2>
              </div>
              <span className="text-sm font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-md">{creators.length} Total</span>
            </div>
            
            <div className="divide-y divide-[var(--border-subtle)] flex-1 overflow-y-auto max-h-[600px]">
              {creators.length === 0 ? (
                <div className="p-8 text-center text-[var(--foreground)]/60 text-sm font-medium">No creators registered yet.</div>
              ) : (
                creators.map((u) => (
                  <div key={u.id} className="p-4 hover:bg-[#F5F5F0]/50 transition-colors flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[var(--foreground)]">{u.full_name}</div>
                      <div className="text-sm text-[var(--foreground)]/60 flex items-center gap-1.5 mt-0.5">
                        <Mail size={12} />
                        {u.email}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
