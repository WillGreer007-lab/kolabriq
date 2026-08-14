"use client";

import { useEffect, useState } from "react";
import { Users, Mail, Loader2, Briefcase, Sparkles, Activity, DollarSign, Lock, AlertTriangle, MessageSquare, X } from "lucide-react";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeDispute, setActiveDispute] = useState<any>(null);
  const [financials, setFinancials] = useState({ platformEscrowVolume: 0, revenueCut: 0, totalLocked: 0 });
  const [disputes, setDisputes] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/dashboard");
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);
        setUsers(data.users || []);
        setFinancials(data.financials || { platformEscrowVolume: 0, revenueCut: 0, totalLocked: 0 });
        setDisputes(data.disputes || []);
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
          <h1 className="text-4xl font-heading font-extrabold text-[var(--foreground)] tracking-tighter flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[var(--accent-primary)] animate-pulse shadow-[0_0_10px_rgba(74,144,226,0.5)]" />
            SUPERVISOR_TERMINAL
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 font-mono uppercase tracking-widest text-xs">
            System Overseer // Escrow Node: ACTIVE
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
          {/* Financial Chart Area */}
          <div className="glass-panel p-8 border border-[var(--accent-secondary)]/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[var(--accent-secondary)]/5 group-hover:bg-[var(--accent-secondary)]/10 transition-colors duration-1000"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={18} className="text-[var(--accent-secondary)] animate-pulse" />
                  <h3 className="text-xs font-bold font-mono text-[var(--text-secondary)] uppercase tracking-widest">Platform Escrow Volume</h3>
                </div>
                <p className="text-[4rem] leading-none font-heading font-extrabold text-[var(--foreground)] tracking-tighter drop-shadow-[0_0_15px_rgba(74,144,226,0.3)]">
                  £{financials.platformEscrowVolume.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </p>
              </div>
              <div className="flex gap-4 mt-4 md:mt-0">
                <div className="text-right">
                  <h3 className="text-[10px] font-bold font-mono text-[var(--text-secondary)] uppercase tracking-widest">Revenue Cut (10%)</h3>
                  <p className="text-xl font-mono font-bold text-[var(--accent-primary)]">£{financials.revenueCut.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                </div>
                <div className="text-right pl-4 border-l border-[var(--border)]">
                  <h3 className="text-[10px] font-bold font-mono text-[var(--text-secondary)] uppercase tracking-widest">Locked</h3>
                  <p className="text-xl font-mono font-bold text-[var(--accent-tertiary)]">£{financials.totalLocked.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                </div>
              </div>
            </div>

            {/* Simulated Sine Wave Chart */}
            <div className="relative h-48 w-full border-t border-[var(--accent-secondary)]/20 mt-4 overflow-hidden rounded-xl bg-[var(--background-subtle)]">
              {/* Grid Lines */}
              <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.2 }}></div>
              
              {/* Neon Line */}
              <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_8px_rgba(74,144,226,0.8)]" preserveAspectRatio="none" viewBox="0 0 1000 200">
                <path 
                  d="M0,100 C150,200 250,0 400,100 C550,200 650,0 800,100 C900,150 1000,100 1000,100" 
                  fill="none" 
                  stroke="var(--accent-secondary)" 
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
                <path 
                  d="M0,100 C150,200 250,0 400,100 C550,200 650,0 800,100 C900,150 1000,100 1000,100 L1000,200 L0,200 Z" 
                  fill="url(#gradient)" 
                  opacity="0.2"
                />
                <defs>
                  <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-secondary)" stopOpacity="1"/>
                    <stop offset="100%" stopColor="var(--accent-secondary)" stopOpacity="0"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* SLA Dispute Command Center */}
          <div className="glass-panel-danger border border-red-500/30 overflow-hidden shadow-neon-red">
            <div className="p-6 border-b border-red-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} strokeWidth={2} className="text-red-500 animate-pulse" />
                <h2 className="text-xl font-heading font-extrabold text-red-500 tracking-tighter uppercase">SLA Dispute Tribunal</h2>
              </div>
              <span className="px-3 py-1 bg-red-500 text-white rounded-full text-[10px] font-bold font-mono tracking-widest uppercase animate-pulse">{disputes.length} Active Cases</span>
            </div>
            <div className="p-6 bg-red-500/5 space-y-4">
              {disputes.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-red-500/70 font-mono text-sm uppercase tracking-widest">No Active Disputes</p>
                </div>
              ) : (
                disputes.map(dispute => (
                  <div key={dispute.id} className="border border-red-500/20 bg-[var(--background)] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-red-400 text-sm font-mono uppercase tracking-widest">Breach: {dispute.reason}</h4>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">
                        Initiator <strong className="text-[var(--foreground)]">@{dispute.initiator?.raw_user_meta_data?.full_name || 'Unknown'}</strong> vs Target <strong className="text-[var(--foreground)]">@{dispute.target?.raw_user_meta_data?.full_name || 'Unknown'}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-red-500/70 uppercase tracking-widest font-mono">SLA Countdown</span>
                        <span className="text-3xl font-mono font-bold text-red-500 tracking-tighter drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">14:22:05</span>
                      </div>
                      <button 
                        onClick={() => { setActiveDispute(dispute); setChatOpen(true); }}
                        className="btn-primary bg-red-500 hover:bg-red-600 shadow-neon-red"
                      >
                        Intervene
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Businesses List */}
          <div className="glass-panel overflow-hidden flex flex-col border-[var(--border)]">
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)] flex items-center justify-center shadow-neon">
                  <Briefcase size={20} strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-heading font-extrabold text-[var(--foreground)] tracking-tighter">Enterprise Nodes</h2>
              </div>
              <span className="text-[10px] font-bold font-mono text-[var(--accent-secondary)] bg-[var(--accent-secondary)]/10 px-2 py-1 rounded-md uppercase tracking-widest">{businesses.length} ONLINE</span>
            </div>
            
            <div className="divide-y divide-[var(--border)] flex-1 overflow-y-auto max-h-[600px] bg-[var(--background)]">
              {businesses.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-tertiary)] text-sm font-medium font-mono uppercase tracking-widest">No nodes registered</div>
              ) : (
                businesses.map((u) => (
                  <div key={u.id} className="p-4 hover:bg-[var(--foreground)]/5 transition-colors flex items-center justify-between group">
                    <div>
                      <div className="font-bold font-mono text-[var(--foreground)]">{u.full_name}</div>
                      <div className="text-xs text-[var(--text-secondary)] font-mono flex items-center gap-1.5 mt-1">
                        <Mail size={12} strokeWidth={1.5} />
                        {u.email}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Creators List */}
          <div className="glass-panel overflow-hidden flex flex-col border-[var(--border)]">
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <Sparkles size={20} strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-heading font-extrabold text-[var(--foreground)] tracking-tighter">Creator Nodes</h2>
              </div>
              <span className="text-[10px] font-bold font-mono text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2 py-1 rounded-md uppercase tracking-widest">{creators.length} ONLINE</span>
            </div>
            
            <div className="divide-y divide-[var(--border)] flex-1 overflow-y-auto max-h-[600px] bg-[var(--background)]">
              {creators.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-tertiary)] text-sm font-medium font-mono uppercase tracking-widest">No nodes registered</div>
              ) : (
                creators.map((u) => (
                  <div key={u.id} className="p-4 hover:bg-[var(--foreground)]/5 transition-colors flex items-center justify-between">
                    <div>
                      <div className="font-bold font-mono text-[var(--foreground)]">{u.full_name}</div>
                      <div className="text-xs text-[var(--text-secondary)] font-mono flex items-center gap-1.5 mt-1">
                        <Mail size={12} strokeWidth={1.5} />
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

      {/* Chat Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-opacity duration-500 ${chatOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setChatOpen(false)}
      />

      {/* Chat Drawer */}
      <div 
        className={`fixed top-0 right-0 h-screen w-full md:w-[500px] bg-[var(--surface)] border-l border-[var(--accent-secondary)]/30 z-50 transform transition-transform duration-500 shadow-[0_0_50px_rgba(0,0,0,0.8)] ${chatOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-[var(--accent-secondary)]/20 flex items-center justify-between bg-[var(--background-subtle)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-secondary)]/10 rounded-full blur-[40px]" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center animate-pulse shadow-neon-red">
                <AlertTriangle size={18} strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-[var(--foreground)] tracking-tighter">DISPUTE INTERVENTION</h3>
                <p className="text-[10px] font-mono text-[var(--accent-secondary)] uppercase tracking-widest mt-1">SLA Override Activated</p>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-[var(--text-secondary)] hover:text-white transition-colors relative z-10">
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[var(--background)]">
            {activeDispute && (
              <>
                <div className="flex flex-col gap-1 items-start">
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-widest ml-2">@{activeDispute.initiator?.raw_user_meta_data?.full_name} (Initiator)</span>
                  <div className="glass-panel p-4 border-[var(--border)] rounded-2xl rounded-tl-sm max-w-[85%]">
                    <p className="text-sm text-[var(--foreground)] font-mono">I've initiated this dispute because: {activeDispute.reason}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1 items-end">
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-widest mr-2">@{activeDispute.target?.raw_user_meta_data?.full_name} (Target)</span>
                  <div className="glass-panel p-4 border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/5 rounded-2xl rounded-tr-sm max-w-[85%] shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                    <p className="text-sm text-[var(--foreground)] font-mono">Pending response to tribunal.</p>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-center my-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]"></div>
              </div>
              <span className="relative z-10 bg-[var(--background)] px-4 text-[10px] font-mono text-[var(--accent-secondary)] uppercase tracking-widest">Supervisor Joined Log</span>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-[var(--border)] bg-[var(--background-subtle)]">
            <div className="relative">
              <textarea 
                placeholder="EXECUTE OVERRIDE COMMAND..."
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--foreground)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-secondary)] focus:ring-1 focus:ring-[var(--accent-secondary)] transition-all resize-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                rows={3}
              />
              <button className="absolute bottom-3 right-3 p-2 bg-[var(--accent-secondary)] hover:bg-[#3A80D2] text-white rounded-lg shadow-[0_0_15px_rgba(74,144,226,0.5)] transition-all">
                <MessageSquare size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg text-xs font-mono font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors">
                Release Escrow
              </button>
              <button className="flex-1 py-2 bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)] border border-[var(--accent-secondary)]/30 rounded-lg text-xs font-mono font-bold uppercase tracking-widest hover:bg-[var(--accent-secondary)] hover:text-white transition-colors">
                Extend SLA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
