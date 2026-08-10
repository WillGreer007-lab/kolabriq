"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Filter, Briefcase, Percent, Rocket, Building2, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CampaignMarketplace() {
  const supabase = createClient();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  const fetchCampaigns = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fetch active campaigns
    const { data: activeCampaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    // Fetch business profiles to get company names
    const profilesMap: Record<string, any> = {};
    if (activeCampaigns && activeCampaigns.length > 0) {
      const businessIds = [...new Set(activeCampaigns.map(c => c.business_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", businessIds);
        
      if (profiles) {
        profiles.forEach(p => { profilesMap[p.id] = p; });
      }
    }

    // Fetch user's existing applications
    if (user) {
      const { data: applications } = await supabase
        .from("campaign_applications")
        .select("campaign_id")
        .eq("creator_id", user.id);

      if (applications) {
        setAppliedIds(new Set(applications.map(app => app.campaign_id)));
      }
    }

    if (!error && activeCampaigns) {
      // Attach profile info manually to avoid PostgREST relationship errors
      const campaignsWithProfiles = activeCampaigns.map(c => ({
        ...c,
        business: {
          raw_user_meta_data: { company_name: profilesMap[c.business_id]?.full_name }
        }
      }));
      setCampaigns(campaignsWithProfiles);
    } else if (error) {
      console.error("Error fetching campaigns:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleApply = async (campaignId: string) => {
    setApplyingId(campaignId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("campaign_applications").insert({
        campaign_id: campaignId,
        creator_id: user.id,
        status: "pending"
      });

      if (!error) {
        setAppliedIds(prev => new Set([...prev, campaignId]));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="space-y-8 fade-in-up">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-[var(--foreground)] tracking-tight">
            Campaign Marketplace
          </h1>
          <p className="text-[var(--foreground)]/60 mt-1 font-medium">
            Browse and apply to premium brand campaigns.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={18} />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-white focus:outline-none focus:border-[#10B981] transition-colors text-sm font-medium"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-white hover:bg-[#F5F5F0] transition-colors text-sm font-bold text-[var(--foreground)]">
            <Filter size={18} />
            Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#10B981]" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => {
            const hasApplied = appliedIds.has(campaign.id);
            const isApplying = applyingId === campaign.id;
            const businessMeta = campaign.business?.raw_user_meta_data || {};
            const businessName = businessMeta.company_name || businessMeta.full_name || "Premium Brand";

            return (
              <div key={campaign.id} className="pixis-card bg-white border border-[var(--border-subtle)] hover:border-[var(--foreground)]/20 transition-all flex flex-col group overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-[var(--border-subtle)]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--background)] border border-[var(--border-subtle)] flex items-center justify-center">
                      <Building2 size={24} className="text-[var(--foreground)]/60" />
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                        campaign.compensation_model === 'performance' ? 'bg-[#10B981]/10 text-[#10B981]' : 
                        campaign.compensation_model === 'fixed' ? 'bg-[#4A90E2]/10 text-[#4A90E2]' :
                        'bg-[#8B5CF6]/10 text-[#8B5CF6]'
                      }`}>
                      {campaign.compensation_model === 'performance' && <Percent size={12} />}
                      {campaign.compensation_model === 'fixed' && <Briefcase size={12} />}
                      {campaign.compensation_model === 'hybrid' && <Rocket size={12} />}
                      {campaign.compensation_model.charAt(0).toUpperCase() + campaign.compensation_model.slice(1)}
                    </span>
                  </div>
                  
                  <h3 className="font-heading font-extrabold text-xl text-[var(--foreground)] tracking-tight line-clamp-1">
                    {campaign.title}
                  </h3>
                  <p className="text-sm font-bold text-[#10B981] mt-1">{businessName}</p>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-sm text-[var(--foreground)]/70 font-medium line-clamp-3 mb-6 flex-1">
                    {campaign.description}
                  </p>

                  <div className="space-y-3 mb-6 bg-[var(--background)] p-4 rounded-xl border border-[var(--border-subtle)]">
                    {campaign.compensation_model !== 'performance' && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[var(--foreground)]/60 uppercase">Fixed Payout</span>
                        <span className="text-sm font-extrabold text-[var(--foreground)]">£{campaign.fixed_fee}</span>
                      </div>
                    )}
                    {campaign.compensation_model !== 'fixed' && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[var(--foreground)]/60 uppercase">Commission</span>
                        <span className="text-sm font-extrabold text-[#10B981]">{campaign.commission_rate}% per sale</span>
                      </div>
                    )}
                    <div className="flex justify-between items-start pt-3 border-t border-[var(--border-subtle)]">
                      <span className="text-xs font-bold text-[var(--foreground)]/60 uppercase">Deliverables</span>
                      <div className="flex flex-col items-end gap-1">
                        {campaign.deliverables?.map((d: string, i: number) => (
                          <span key={i} className="text-xs font-medium text-[var(--foreground)] bg-white px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleApply(campaign.id)}
                    disabled={hasApplied || isApplying}
                    className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                      hasApplied 
                        ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' 
                        : 'bg-[var(--foreground)] text-white hover:bg-[#10B981]'
                    }`}
                  >
                    {isApplying ? <Loader2 size={18} className="animate-spin" /> : 
                     hasApplied ? <><CheckCircle size={18} /> Applied</> : 
                     "Apply Now"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && campaigns.length === 0 && (
        <div className="pixis-card p-12 flex flex-col items-center justify-center text-center bg-white border border-[var(--border-subtle)]">
          <Briefcase size={48} className="text-[var(--foreground)]/20 mb-4" />
          <h2 className="text-2xl font-heading font-extrabold text-[var(--foreground)] tracking-tight mb-2">No Active Campaigns</h2>
          <p className="text-[var(--foreground)]/60 font-medium max-w-md mx-auto">
            Check back later for new campaign opportunities from our premium brands.
          </p>
        </div>
      )}
    </div>
  );
}
