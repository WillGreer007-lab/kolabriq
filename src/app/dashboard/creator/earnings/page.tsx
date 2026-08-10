"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Wallet, Landmark, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

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
        <h1 className="text-3xl font-heading font-extrabold text-[var(--foreground)] tracking-tight">
          Earnings & Payouts
        </h1>
        <p className="text-[var(--foreground)]/60 mt-1 font-medium">
          Track your campaign revenue and manage your bank account.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#10B981]" size={32} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Earnings Card */}
            <div className="pixis-card p-8 bg-white border border-[var(--border-subtle)] flex flex-col justify-between overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/5 rounded-full blur-[40px] -z-10 group-hover:bg-[#10B981]/10 transition-colors duration-500" />
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                  <Wallet size={24} />
                </div>
                <h2 className="text-lg font-bold text-[var(--foreground)]/60 uppercase tracking-wider">Total Earned</h2>
              </div>
              <p className="text-5xl font-heading font-extrabold text-[var(--foreground)] tracking-tight">
                £{totalEarnings.toFixed(2)}
              </p>
            </div>

            {/* Stripe Connect Card */}
            <div className="pixis-card p-8 bg-white border border-[var(--border-subtle)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center">
                    <Landmark size={24} />
                  </div>
                  <h2 className="text-lg font-bold text-[var(--foreground)]/60 uppercase tracking-wider">Payout Account</h2>
                </div>
                
                {stripeStatus?.onboarding_complete ? (
                  <div>
                    <div className="flex items-center gap-2 text-[#10B981] font-bold mb-2">
                      <CheckCircle2 size={20} />
                      Connected & Ready
                    </div>
                    <p className="text-sm font-medium text-[var(--foreground)]/60">
                      Your bank account is securely connected via Stripe. Payouts will be routed automatically.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]/60 mb-4">
                      You must connect a bank account to receive campaign payouts. Setup takes 2 minutes via Stripe.
                    </p>
                    <button 
                      onClick={handleConnectStripe}
                      disabled={connecting}
                      className="w-full py-3 bg-[#635BFF] hover:bg-[#635BFF]/90 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      {connecting ? <Loader2 size={20} className="animate-spin" /> : (
                        <>Connect with Stripe <ArrowRight size={18} /></>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="pixis-card bg-white border border-[var(--border-subtle)] overflow-hidden mt-8">
            <div className="p-6 border-b border-[var(--border-subtle)]">
              <h2 className="font-heading font-extrabold text-xl text-[var(--foreground)] tracking-tight">
                Transaction History
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--background)]">
                    <th className="py-4 px-6 font-bold text-[var(--foreground)]/70 text-sm">Date</th>
                    <th className="py-4 px-6 font-bold text-[var(--foreground)]/70 text-sm">Campaign</th>
                    <th className="py-4 px-6 font-bold text-[var(--foreground)]/70 text-sm">Status</th>
                    <th className="py-4 px-6 font-bold text-[var(--foreground)]/70 text-sm text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[var(--foreground)]/60 font-medium">
                        No transactions yet. Complete campaigns to earn payouts!
                      </td>
                    </tr>
                  ) : (
                    ledgers.map((ledger) => (
                      <tr key={ledger.id} className="border-b border-[var(--border-subtle)] hover:bg-[#F5F5F0]/50 transition-colors">
                        <td className="py-4 px-6 text-sm font-medium">
                          {new Date(ledger.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 font-bold text-[var(--foreground)]">
                          {ledger.campaign?.title || "Direct Payout"}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#10B981]/10 text-[#10B981]">
                            {ledger.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm font-extrabold text-[#10B981] text-right">
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