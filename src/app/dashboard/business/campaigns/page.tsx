"use client";

import { createClient } from "@/lib/supabase/client";
import { Plus, Megaphone, Activity, Users, MoreHorizontal, CreditCard, Loader2, ListOrdered } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ApplicationsModal from "./ApplicationsModal";

export default function BusinessCampaignsPage() {
  const supabase = createClient();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fundingId, setFundingId] = useState<string | null>(null);
  const [viewingAppsFor, setViewingAppsFor] = useState<any>(null);

  const fetchCampaigns = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("business_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCampaigns(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleFundCampaign = async (campaign: any) => {
    setFundingId(campaign.id);
    try {
      const amount = campaign.compensation_model === 'fixed' || campaign.compensation_model === 'hybrid' 
        ? campaign.fixed_fee 
        : 100; // Default buffer amount for performance campaigns if needed

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaign.id,
          amount: amount
        })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error(error);
      alert("Error initiating payment");
    } finally {
      setFundingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-[var(--foreground)] tracking-tight">
            Campaigns
          </h1>
          <p className="text-[var(--foreground)]/60 mt-1 font-medium">
            Manage your active campaigns and track performance.
          </p>
        </div>
        <Link href="/dashboard/business/campaigns/new" className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2">
          <Plus size={18} />
          New Campaign
        </Link>
      </div>

      <div className="pixis-card bg-white border border-[var(--border-subtle)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--background)]">
                <th className="py-4 px-6 font-bold text-[var(--foreground)]/70 text-sm">Campaign Name</th>
                <th className="py-4 px-6 font-bold text-[var(--foreground)]/70 text-sm">Status</th>
                <th className="py-4 px-6 font-bold text-[var(--foreground)]/70 text-sm">Model</th>
                <th className="py-4 px-6 font-bold text-[var(--foreground)]/70 text-sm">Budget/Rate</th>
                <th className="py-4 px-6 font-bold text-[var(--foreground)]/70 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Loader2 className="animate-spin text-[#10B981] mx-auto" size={32} />
                  </td>
                </tr>
              ) : campaigns?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-[#10B981]/10 text-[#10B981] rounded-full flex items-center justify-center mb-4">
                        <Megaphone size={28} />
                      </div>
                      <h3 className="font-heading font-extrabold text-lg text-[var(--foreground)] mb-1">No campaigns yet</h3>
                      <p className="text-[var(--foreground)]/60 font-medium text-sm mb-6">Create your first campaign to start working with creators.</p>
                      <Link href="/dashboard/business/campaigns/new" className="btn-secondary py-2 px-6 text-sm">
                        Create Campaign
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                campaigns?.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-[var(--border-subtle)] hover:bg-[#F5F5F0]/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-[var(--foreground)]">{campaign.title}</div>
                      <div className="text-xs text-[var(--foreground)]/60 font-medium mt-1 truncate max-w-xs">{campaign.description}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                        campaign.status === 'active' ? 'bg-[#10B981]/10 text-[#10B981]' : 
                        campaign.status === 'draft' ? 'bg-[var(--foreground)]/10 text-[var(--foreground)]/70' :
                        'bg-[#FFB347]/10 text-[#FFB347]'
                      }`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                        campaign.compensation_model === 'performance' ? 'bg-[#10B981]/10 text-[#10B981]' : 
                        campaign.compensation_model === 'fixed' ? 'bg-[#4A90E2]/10 text-[#4A90E2]' :
                        'bg-[#8B5CF6]/10 text-[#8B5CF6]'
                      }`}>
                        {campaign.compensation_model.charAt(0).toUpperCase() + campaign.compensation_model.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-[var(--foreground)]">
                      {campaign.compensation_model === 'performance' ? `${campaign.commission_rate}%` : 
                       campaign.compensation_model === 'fixed' ? `£${campaign.fixed_fee}` :
                       `£${campaign.fixed_fee} + ${campaign.commission_rate}%`}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setViewingAppsFor(campaign)}
                          className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 border-none"
                          title="View Applications"
                        >
                          <ListOrdered size={14} />
                          Apps
                        </button>
                        <button className="p-2 text-[var(--foreground)]/40 hover:text-[#10B981] transition-colors rounded-lg hover:bg-[#10B981]/10">
                          <MoreHorizontal size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {viewingAppsFor && (
        <ApplicationsModal 
          campaign={viewingAppsFor} 
          onClose={() => setViewingAppsFor(null)} 
        />
      )}
    </div>
  );
}