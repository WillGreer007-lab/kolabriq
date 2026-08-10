"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, CheckCircle, Loader2, CreditCard } from "lucide-react";

export default function ApplicationsModal({ campaign, onClose }: { campaign: any, onClose: () => void }) {
  const supabase = createClient();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fundingId, setFundingId] = useState<string | null>(null);

  useEffect(() => {
    fetchApps();
  }, [campaign.id]);

  const fetchApps = async () => {
    const { data, error } = await supabase
      .from("campaign_applications")
      .select("*")
      .eq("campaign_id", campaign.id);

    if (data) {
      // Fetch creator profiles
      const profilesMap: Record<string, any> = {};
      const creatorIds = [...new Set(data.map(app => app.creator_id))];
      if (creatorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("users")
          .select("id, raw_user_meta_data")
          .in("id", creatorIds);
        
        if (profiles) {
          profiles.forEach(p => { profilesMap[p.id] = p; });
        }
      }

      const appsWithProfiles = data.map(app => ({
        ...app,
        creator: { raw_user_meta_data: { full_name: profilesMap[app.creator_id]?.raw_user_meta_data?.full_name } }
      }));
      setApplications(appsWithProfiles);
    }
    setLoading(false);
  };

  const handleAcceptAndPay = async (app: any) => {
    setFundingId(app.id);
    try {
      // First update status to accepted
      await supabase
        .from("campaign_applications")
        .update({ status: 'accepted' })
        .eq("id", app.id);

      // Create chat conversation
      const { data: conv } = await supabase
        .from("conversations")
        .select("id")
        .eq("campaign_id", campaign.id)
        .eq("creator_id", app.creator_id)
        .single();

      if (!conv) {
        await supabase
          .from("conversations")
          .insert({
            campaign_id: campaign.id,
            business_id: campaign.business_id,
            creator_id: app.creator_id
          });
      }

      // Then trigger checkout
      const amount = campaign.compensation_model === 'fixed' || campaign.compensation_model === 'hybrid' 
        ? campaign.fixed_fee 
        : 100;

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaign.id,
          creatorId: app.creator_id,
          amount: amount
        })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error initiating payment");
    } finally {
      setFundingId(null);
    }
  };

  const handleReject = async (appId: string) => {
    try {
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: 'rejected' } : app));
      await supabase
        .from("campaign_applications")
        .update({ status: 'rejected' })
        .eq("id", appId);
    } catch (error) {
      console.error(error);
      alert("Error rejecting application");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-[var(--border-subtle)] w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-xl font-heading font-extrabold text-[var(--foreground)]">Applications</h2>
            <p className="text-sm font-medium text-[var(--foreground)]/60">{campaign.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--background)] rounded-full transition-colors text-[var(--foreground)]/60 hover:text-[var(--foreground)]">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-[#10B981]" size={32} />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 text-[var(--foreground)]/60 font-medium">
              No applications yet.
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map(app => (
                <div key={app.id} className="p-4 border border-[var(--border-subtle)] rounded-xl flex items-center justify-between bg-[var(--background)]">
                  <div>
                    <h3 className="font-bold text-[var(--foreground)]">
                      {app.creator?.raw_user_meta_data?.full_name || "Creator"}
                    </h3>
                    <p className="text-xs font-medium text-[var(--foreground)]/60">Applied on {new Date(app.created_at).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                      app.status === 'accepted' ? 'bg-[#10B981]/10 text-[#10B981]' : 
                      app.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                      'bg-[#FFB347]/10 text-[#FFB347]'
                    }`}>
                      {app.status.toUpperCase()}
                    </span>
                    
                    {app.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleReject(app.id)}
                          className="btn-secondary py-1.5 px-3 text-xs text-red-500 hover:bg-red-500/10 border-none bg-transparent"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleAcceptAndPay(app)}
                          disabled={fundingId === app.id}
                          className="btn-primary py-1.5 px-4 text-xs flex items-center gap-2"
                        >
                          {fundingId === app.id ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                          Accept & Pay
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
