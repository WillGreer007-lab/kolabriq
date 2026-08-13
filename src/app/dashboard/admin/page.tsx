"use client";

import { useEffect, useState } from "react";
import { Users, Mail, Loader2, Briefcase, Sparkles, Activity, DollarSign, Lock, AlertTriangle } from "lucide-react";

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
        <div className="space-y-8">
          {/* Financial Ledger Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="pixis-card p-6 bg-white border border-[var(--border-subtle)]">
              <div className="flex items-center gap-3 mb-2 text-[var(--foreground)]/60">
                <Activity size={18} className="text-[#10B981]" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Gross Merchandise Value</h3>
              </div>
              <p className="text-3xl font-heading font-extrabold text-[var(--foreground)]">£12,450.00</p>
            </div>
            <div className="pixis-card p-6 bg-white border border-[var(--border-subtle)]">
              <div className="flex items-center gap-3 mb-2 text-[var(--foreground)]/60">
                <DollarSign size={18} className="text-[#4A90E2]" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Platform Revenue (10%)</h3>
              </div>
              <p className="text-3xl font-heading font-extrabold text-[var(--foreground)]">£1,245.00</p>
            </div>
            <div className="pixis-card p-6 bg-white border border-[var(--border-subtle)]">
              <div className="flex items-center gap-3 mb-2 text-[var(--foreground)]/60">
                <Lock size={18} className="text-[#8B5CF6]" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Escrow Locked</h3>
              </div>
              <p className="text-3xl font-heading font-extrabold text-[var(--foreground)]">£4,500.00</p>
            </div>
          </div>

          {/* SLA Dispute Command Center */}
          <div className="pixis-card bg-white border border-[var(--border-subtle)] overflow-hidden">
            <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <h2 className="text-xl font-heading font-extrabold text-[var(--foreground)]">SLA Dispute Tribunal</h2>
              <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded-md text-xs font-bold">1 Active</span>
            </div>
            <div className="p-6 bg-[#F5F5F0]/30">
              <div className="border border-red-200 bg-red-50 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-red-900 text-sm">Missing Conversion Tracking</h4>
                  <p className="text-sm text-red-700/80 mt-1">Creator <strong>@AlexRivera</strong> vs Brand <strong>TechGear</strong></p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end mr-4">
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Time Remaining</span>
                    <span className="font-mono text-sm font-bold text-red-600">14:22:05</span>
                  </div>
                  <button className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition-colors">
                    Review Case
                  </button>
                </div>
              </div>
            </div>
          </div>

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

        </div>
      )}
    </div>
  );
}
