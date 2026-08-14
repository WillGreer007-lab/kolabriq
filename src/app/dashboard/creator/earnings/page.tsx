"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Wallet, Landmark, Loader2, ArrowRight, CheckCircle2, TrendingUp, Zap } from "lucide-react";

// Slot Machine Counter Component
const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const increment = value / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span className="font-mono">{displayValue.toFixed(2)}</span>;
};

export default function CreatorEarningsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stripeStatus, setStripeStatus] = useState<any>(null);
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [connecting, setConnecting] = useState(false);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check Stripe onboarding status via API (syncs with Stripe live to bypass webhook requirement)
    try {
      const res = await fetch("/api/stripe/status");
      if (res.ok) {
        const stripeData = await res.json();
        setStripeStatus(stripeData);
      }
    } catch (e) {
      console.error("Failed to fetch stripe status", e);
    }

    // Fetch ledger entries (payouts/earnings)
    const { data: ledgerData } = await supabase
      .from("ledger_entries")
      .select("*, campaign:campaign_id(title)")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false });

    if (ledgerData) setLedgers(ledgerData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConnectStripe = async () => {
    setConnecting(true);
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to generate connect link");
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting to Stripe");
      setConnecting(false);
    }
  };

  const totalEarnings = ledgers.reduce((acc, curr) => acc + curr.amount_creator, 0);

  return (
    <div className="space-y-8 fade-in-up">
      <div>
        <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-[var(--foreground)] tracking-tighter">
          Earnings Engine
        </h1>
        <p className="text-[var(--text-secondary)] mt-2 text-lg">
          Track campaign revenue streams and automated payouts in real-time.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#10B981]" size={32} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Fixed Earnings Card */}
            <div className="glass-panel p-8 border border-[var(--border)] flex flex-col justify-between overflow-hidden relative group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center">
                  <Wallet size={20} strokeWidth={1.5} />
                </div>
                <h2 className="text-xs font-bold text-[var(--text-secondary)] font-mono uppercase tracking-widest">Fixed Revenue</h2>
              </div>
              <p className="text-[3.5rem] leading-none font-extrabold text-[var(--foreground)] tracking-tighter flex items-center">
                <span className="text-[var(--text-tertiary)] font-mono mr-2">£</span>
                <AnimatedNumber value={totalEarnings} /> {/* Stubbed to total for now */}
              </p>
            </div>

            {/* Affiliate Earnings Card */}
            <div className="glass-panel p-8 border border-[var(--border)] flex flex-col justify-between overflow-hidden relative group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)] flex items-center justify-center">
                  <TrendingUp size={20} strokeWidth={1.5} />
                </div>
                <h2 className="text-xs font-bold text-[var(--text-secondary)] font-mono uppercase tracking-widest">Affiliate Revenue</h2>
              </div>
              <p className="text-[3.5rem] leading-none font-extrabold text-[var(--foreground)] tracking-tighter flex items-center">
                <span className="text-[var(--text-tertiary)] font-mono mr-2">£</span>
                <AnimatedNumber value={0} /> {/* Stubbed to 0 for now */}
              </p>
            </div>

            {/* Hybrid Earnings Card */}
            <div className="glass-panel p-8 border border-[var(--border)] flex flex-col justify-between overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-tertiary)]/5 rounded-full blur-[40px] -z-10 group-hover:bg-[var(--accent-tertiary)]/10 transition-colors duration-500" />
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-tertiary)]/10 text-[var(--accent-tertiary)] flex items-center justify-center">
                  <Zap size={20} strokeWidth={1.5} />
                </div>
                <h2 className="text-xs font-bold text-[var(--text-secondary)] font-mono uppercase tracking-widest">Hybrid Total</h2>
              </div>
              <p className="text-[3.5rem] leading-none font-extrabold text-[var(--foreground)] tracking-tighter flex items-center">
                <span className="text-[var(--text-tertiary)] font-mono mr-2">£</span>
                <AnimatedNumber value={totalEarnings} />
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Stripe Connect Card */}
            <div className="glass-panel p-8 border border-[var(--border)] flex flex-col justify-between max-w-2xl">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center">
                    <Landmark size={20} strokeWidth={1.5} />
                  </div>
                  <h2 className="text-xs font-bold text-[var(--text-secondary)] font-mono uppercase tracking-widest">Financial Gateway</h2>
                </div>
                
                {stripeStatus?.onboarding_complete ? (
                  <div>
                    <div className="flex items-center gap-2 text-[#10B981] font-bold mb-2">
                      <CheckCircle2 size={20} />
                      Connection Secure
                    </div>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">
                      Your banking infrastructure is securely connected via Stripe. Payouts are routed automatically.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-[var(--text-secondary)] mb-6">
                      You must authenticate a receiving account to capture campaign payouts. Setup takes 2 minutes via Stripe Connect.
                    </p>
                    <button 
                      onClick={handleConnectStripe}
                      disabled={connecting}
                      className="w-full md:w-auto px-8 py-3 bg-[#635BFF] hover:bg-[#635BFF]/90 text-white rounded-full font-heading font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                    >
                      {connecting ? <Loader2 size={20} className="animate-spin" /> : (
                        <>Initialize Stripe Connect <ArrowRight size={18} /></>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="glass-panel overflow-hidden mt-8">
            <div className="p-6 border-b border-[var(--border)]">
              <h2 className="font-heading font-extrabold text-xl text-[var(--foreground)] tracking-tighter">
                Ledger Entries
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--background-subtle)]">
                    <th className="py-4 px-6 font-bold text-[var(--text-secondary)] font-mono uppercase tracking-widest text-xs">Timestamp</th>
                    <th className="py-4 px-6 font-bold text-[var(--text-secondary)] font-mono uppercase tracking-widest text-xs">Origin</th>
                    <th className="py-4 px-6 font-bold text-[var(--text-secondary)] font-mono uppercase tracking-widest text-xs">Status</th>
                    <th className="py-4 px-6 font-bold text-[var(--text-secondary)] font-mono uppercase tracking-widest text-xs text-right">Credit Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[var(--text-tertiary)] font-medium">
                        No transactions recorded.
                      </td>
                    </tr>
                  ) : (
                    ledgers.map((ledger) => (
                      <tr key={ledger.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--foreground)]/5 transition-colors">
                        <td className="py-4 px-6 text-sm font-medium font-mono">
                          {new Date(ledger.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 font-bold text-[var(--foreground)] font-mono">
                          {ledger.campaign?.title || "SYSTEM_PAYOUT"}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold font-mono tracking-widest bg-[var(--accent-tertiary)]/10 text-[var(--accent-tertiary)] uppercase">
                            {ledger.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm font-extrabold font-mono text-[var(--accent-tertiary)] text-right">
                          +£{ledger.amount_creator.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}