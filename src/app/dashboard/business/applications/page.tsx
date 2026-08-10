"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, X, Loader2, ListOrdered, UserCircle } from "lucide-react";

export default function BusinessApplicationsPage() {
  const supabase = createClient();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fundingId, setFundingId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // First get all campaigns for this business
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("id, title, compensation_model, fixed_fee, commission_rate")
      .eq("business_id", user.id);

    if (campaigns && campaigns.length > 0) {
      const campaignIds = campaigns.map(c => c.id);
      const campaignMap: Record<string, any> = {};
      campaigns.forEach(c => { campaignMap[c.id] = c; });

      // Get applications for these campaigns
      const { data: apps } = await supabase
        .from("campaign_applications")
        .select("*")
        .in("campaign_id", campaignIds)
        .order("created_at", { ascending: false });

      if (apps) {
        // Fetch creator profiles
        const creatorIds = [...new Set(apps.map(a => a.creator_id))];
        const profilesMap: Record<string, any> = {};
        
        if (creatorIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", creatorIds);
            
          if (profiles) {
            profiles.forEach(p => { profilesMap[p.id] = p; });
          }
        }

        const enrichedApps = apps.map(app => ({
          ...app,
          campaign: campaignMap[app.campaign_id],
          creator: { raw_user_meta_data: { full_name: profilesMap[app.creator_id]?.full_name || "Unknown Creator" } }
        }));
        setApplications(enrichedApps);
      }
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

      // Trigger checkout
      const amount = app.campaign.compensation_model === 'fixed' || app.campaign.campaign === 'hybrid' 
        ? app.campaign.fixed_fee 
        : 100;

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: app.campaign_id,
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
    <div className="space-y-8 fade-in-up">
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-[var(--foreground)] tracking-tight">
          Incoming Applications
        </h1>
        <p className="text-[var(--foreground)]/60 mt-1 font-medium">
          Review and accept creators who want to work with your brand.
        </p>
      </div>

      <div className="pixis-card bg-white border border-[var(--border-subtle)] overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="animate-spin text-[#10B981]" size={32} />
          </div>
        ) : applications.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-[var(--foreground)]/5 text-[var(--foreground)]/40 rounded-full flex items-center justify-center mb-4">
              <ListOrdered size={28} />
            </div>
            <h3 className="font-heading font-extrabold text-lg text-[var(--foreground)] mb-1">No applications yet</h3>
            <p className="text-[var(--foreground)]/60 font-medium text-sm">When creators apply to your campaigns, they will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {applications.map((app) => (
              <div key={app.id} className="p-6 hover:bg-[#F5F5F0]/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center shrink-0">
                    <UserCircle size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--foreground)]">{app.creator.raw_user_meta_data.full_name}</h4>
                    <p className="text-sm font-medium text-[var(--foreground)]/60 mt-0.5">Applied for: <span className="text-[var(--foreground)]">{app.campaign?.title}</span></p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                        app.status === 'accepted' ? 'bg-[#10B981]/10 text-[#10B981]' : 
                        app.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                        'bg-[#FFB347]/10 text-[#FFB347]'
                      }`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {app.status === 'pending' && (
                  <div className="flex items-center gap-3 shrink-0">
                    <button 
                      onClick={() => handleReject(app.id)}
                      className="btn-secondary py-2 px-4 text-sm flex items-center gap-2 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                    >
                      <X size={16} />
                      Decline
                    </button>
                    <button 
                      onClick={() => handleAcceptAndPay(app)}
                      disabled={fundingId === app.id}
                      className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                    >
                      {fundingId === app.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      {fundingId === app.id ? "Processing..." : "Accept & Fund"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
