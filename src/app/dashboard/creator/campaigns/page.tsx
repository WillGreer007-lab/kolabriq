"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Briefcase, Loader2, Megaphone, Plus, Link as LinkIcon, Copy, Sparkles, X, Upload, HardDrive, FileVideo } from "lucide-react";
import Link from "next/link";
import { CldUploadWidget } from 'next-cloudinary';
import { Lock, Unlock } from 'lucide-react';

const CampaignTimeline = ({ campaign, generatedLink, handleGenerateLink, generatingFor, handleCloudinarySuccess, isElectron, handleNativeCompression, compressing, compressionProgress }: any) => {
  const supabase = createClient();
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeliverables = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("deliverables")
        .select("*")
        .eq("campaign_id", campaign.id)
        .eq("creator_id", user.id)
        .order("slot_number", { ascending: true });
      if (data) setDeliverables(data);
    };
    fetchDeliverables();
  }, [campaign.id]);

  // For this aesthetic demo, we assume the first deliverable dictates the timeline state.
  const del = deliverables[0];
  const isUploaded = !!del?.submitted_url;
  const isApproved = !!del?.business_approved;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Tracking link copied to clipboard!");
  };

  return (
    <div className="mt-6 flex flex-col md:flex-row gap-4 relative">
      {/* Box 1: Deliverable */}
      <div className={`flex-1 glass-panel p-6 border ${isUploaded ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5' : 'border-[var(--border)]'} relative overflow-hidden transition-all duration-500`}>
        {isUploaded ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <CheckCircle className="text-[var(--accent-primary)] mb-2" size={32} strokeWidth={1.5} />
            <h4 className="font-heading font-extrabold text-[var(--foreground)] tracking-tighter">Content Uploaded</h4>
            <p className="text-xs text-[var(--text-secondary)] font-mono mt-1">Awaiting verification</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-tertiary)]/10 text-[var(--accent-tertiary)] flex items-center justify-center mb-4 animate-pulse">
              <Upload size={20} strokeWidth={1.5} />
            </div>
            <h4 className="font-heading font-extrabold text-[var(--foreground)] tracking-tighter mb-2">Awaiting Deliverable</h4>
            
            {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? (
              <CldUploadWidget 
                uploadPreset="ml_default"
                onSuccess={(result: any) => handleCloudinarySuccess(result.info, campaign.id, del?.id, () => setDeliverables(prev => prev.map(d => d.id === del.id ? {...d, submitted_url: result.info.secure_url} : d)))}
              >
                {({ open }) => (
                  <button onClick={() => open()} className="btn-neon w-full text-xs py-2">
                    Upload Content
                  </button>
                )}
              </CldUploadWidget>
            ) : (
              <button disabled className="btn-secondary opacity-50 cursor-not-allowed text-xs w-full">Cloudinary Not Configured</button>
            )}
          </div>
        )}
      </div>

      {/* Box 2: Approval */}
      <div className="flex-1 glass-panel p-6 border border-[var(--border)] relative overflow-hidden flex flex-col items-center justify-center text-center">
        {!isApproved && (
          <div className="absolute inset-0 backdrop-blur-xl bg-[var(--background)]/80 z-10 flex items-center justify-center transition-all duration-700">
            <Lock className="text-[var(--text-secondary)]/50" size={32} strokeWidth={1} />
          </div>
        )}
        <CheckCircle className="text-[var(--accent-secondary)] mb-2 relative z-0" size={32} strokeWidth={1.5} />
        <h4 className="font-heading font-extrabold text-[var(--foreground)] tracking-tighter relative z-0">Brand Approved</h4>
        <p className="text-xs text-[var(--text-secondary)] font-mono mt-1 relative z-0">Network unlocked</p>
      </div>

      {/* Box 3: Tracking Link */}
      <div className="flex-1 glass-panel p-6 border border-[var(--border)] relative overflow-hidden flex flex-col items-center justify-center text-center">
        {!isApproved && (
          <div className="absolute inset-0 backdrop-blur-xl bg-[var(--background)]/80 z-10 flex items-center justify-center transition-all duration-700">
            <Lock className="text-[var(--text-secondary)]/50" size={32} strokeWidth={1} />
          </div>
        )}
        
        {isApproved && generatedLink ? (
          <div className="w-full relative z-0 animate-in fade-in zoom-in duration-700">
            <h4 className="font-heading font-extrabold text-[var(--foreground)] tracking-tighter mb-4">Traffic Hub</h4>
            <div className="flex items-center gap-2 bg-[var(--background-subtle)] border border-[var(--accent-secondary)]/30 px-3 py-2 rounded-xl shadow-[0_0_15px_rgba(74,144,226,0.1)]">
              <input 
                readOnly 
                value={generatedLink} 
                className="bg-transparent border-none outline-none text-xs text-[var(--accent-secondary)] w-full truncate font-mono"
              />
              <button onClick={() => copyToClipboard(generatedLink)} className="text-[var(--text-secondary)] hover:text-[var(--accent-secondary)] transition-colors">
                <Copy size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ) : isApproved && !generatedLink ? (
          <div className="relative z-0">
            <h4 className="font-heading font-extrabold text-[var(--foreground)] tracking-tighter mb-4">Traffic Hub</h4>
            <button 
              onClick={() => handleGenerateLink(campaign.id)}
              disabled={generatingFor === campaign.id}
              className="btn-neon w-full py-2 text-xs"
            >
              {generatingFor === campaign.id ? "Generating..." : "Materialize Link"}
            </button>
          </div>
        ) : (
          <div className="relative z-0 opacity-50">
            <h4 className="font-heading font-extrabold text-[var(--foreground)] tracking-tighter mb-4">Traffic Hub</h4>
            <div className="h-10 bg-[var(--border)] rounded-xl w-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function CreatorCampaignsPage() {
  const supabase = createClient();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [generatedLinks, setGeneratedLinks] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  
  // Electron State
  const [isElectron, setIsElectron] = useState(false);
  const [compressing, setCompressing] = useState<string | null>(null);
  const [compressionProgress, setCompressionProgress] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).electronAPI) {
      setIsElectron(true);
    }
  }, []);

  const handleNativeCompression = async (campaignId: string) => {
    if (!(window as any).electronAPI) return;
    
    setCompressing(campaignId);
    setCompressionProgress(0);

    (window as any).electronAPI.onCompressionProgress((progress: number) => {
      setCompressionProgress(progress);
    });

    try {
      const result = await (window as any).electronAPI.selectAndCompressVideo();
      if (result.error) {
        if (result.error !== 'No file selected') alert(result.error);
      } else {
        alert(`Video successfully compressed and saved to:\n${result.outputPath}\n\nYou can now upload this optimized file.`);
      }
    } catch (e) {
      console.error(e);
      alert("Compression failed");
    } finally {
      setCompressing(null);
      setCompressionProgress(0);
      if ((window as any).electronAPI.removeCompressionProgressListener) {
        (window as any).electronAPI.removeCompressionProgressListener();
      }
    }
  };

  const handleGenerateLink = async (campaignId: string) => {
    setGeneratingFor(campaignId);
    try {
      const res = await fetch("/api/links/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId })
      });
      const data = await res.json();
      if (data.short_code) {
        const link = `${window.location.origin}/r/${data.short_code}`;
        setGeneratedLinks(prev => ({ ...prev, [campaignId]: link }));
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate link");
    }
    setGeneratingFor(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Tracking link copied to clipboard!");
  };

  const handleCloudinarySuccess = async (resultInfo: any, campaignId: string, deliverableId?: string, onSuccessCallback?: () => void) => {
    setUploading(campaignId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // The secure_url points to the video on Cloudinary
      const videoUrl = resultInfo.secure_url;

      // Update campaign applications legacy URL
      await supabase
        .from('campaign_applications')
        .update({ deliverable_url: videoUrl })
        .eq('campaign_id', campaignId)
        .eq('creator_id', user.id);

      // Update specific deliverable if ID provided
      if (deliverableId) {
        await supabase
          .from('deliverables')
          .update({ submitted_url: videoUrl })
          .eq('id', deliverableId);
      }

      if (onSuccessCallback) onSuccessCallback();

      alert("Video processed and uploaded successfully via Cloudinary!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save video URL");
    } finally {
      setUploading(null);
    }
  };

  const fetchApplications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("campaign_applications")
      .select("*, campaign:campaign_id(*)")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Fetch business profiles to get company names
      const profilesMap: Record<string, any> = {};
      const businessIds = [...new Set(data.filter(app => app.campaign).map(app => app.campaign.business_id))];
      
      if (businessIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", businessIds);
          
        if (profiles) {
          profiles.forEach(p => { profilesMap[p.id] = p; });
        }
      }

      const appsWithProfiles = data.map(app => {
        if (!app.campaign) return app;
        return {
          ...app,
          campaign: {
            ...app.campaign,
            business: {
              raw_user_meta_data: { company_name: profilesMap[app.campaign.business_id]?.full_name }
            }
          }
        };
      });
      
      setApplications(appsWithProfiles);

    } else if (error) {
      console.error("Error fetching applications:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="space-y-8 fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-[var(--foreground)] tracking-tight">
            My Campaigns
          </h1>
          <p className="text-[var(--foreground)]/60 mt-1 font-medium">
            Manage your active campaigns and application statuses.
          </p>
        </div>
        <Link href="/dashboard/creator/campaigns/marketplace" className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2">
          <Plus size={18} />
          Find Campaigns
        </Link>
      </div>

      <div className="pixis-card bg-white border border-[var(--border-subtle)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background-subtle)]">
                <th className="py-4 px-6 font-bold text-[var(--text-secondary)] font-mono uppercase tracking-widest text-xs">Campaign</th>
                <th className="py-4 px-6 font-bold text-[var(--text-secondary)] font-mono uppercase tracking-widest text-xs">Brand</th>
                <th className="py-4 px-6 font-bold text-[var(--text-secondary)] font-mono uppercase tracking-widest text-xs">Network Status</th>
                <th className="py-4 px-6 font-bold text-[var(--text-secondary)] font-mono uppercase tracking-widest text-xs">Compensation</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <Loader2 className="animate-spin text-[#10B981] mx-auto" size={32} />
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-[#10B981]/10 text-[#10B981] rounded-full flex items-center justify-center mb-4">
                        <Megaphone size={28} />
                      </div>
                      <h3 className="font-heading font-extrabold text-lg text-[var(--foreground)] mb-1">No applications yet</h3>
                      <p className="text-[var(--foreground)]/60 font-medium text-sm mb-6">Explore the marketplace to find premium brand campaigns.</p>
                      <Link href="/dashboard/creator/campaigns/marketplace" className="btn-secondary py-2 px-6 text-sm">
                        Browse Marketplace
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                applications.map((app) => {
                  const campaign = app.campaign;
                  if (!campaign) return null;
                  const businessName = campaign.business?.raw_user_meta_data?.company_name || 
                                     campaign.business?.raw_user_meta_data?.full_name || "Premium Brand";
                  return (
                    <tr key={app.id} className="border-b border-[var(--border)] hover:bg-[var(--foreground)]/5 transition-colors">
                      <td colSpan={4} className="p-0">
                        <div className="w-full flex flex-col py-6 px-6">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex-1">
                              <div className="font-heading font-extrabold text-lg text-[var(--foreground)] tracking-tight">{campaign.title}</div>
                              <div className="font-mono text-xs text-[var(--text-secondary)] mt-1">{businessName}</div>
                            </div>
                            <div className="flex-1 text-center">
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold font-mono tracking-widest uppercase ${
                                app.status === 'accepted' ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 
                                app.status === 'pending' ? 'bg-[var(--accent-tertiary)]/10 text-[var(--accent-tertiary)]' :
                                'bg-red-500/10 text-red-500'
                              }`}>
                                {app.status === 'accepted' ? 'ACTIVE_NODE' : app.status}
                              </span>
                            </div>
                            <div className="flex-1 text-right text-sm font-extrabold text-[var(--foreground)] font-mono">
                              {campaign.compensation_model === 'performance' ? `${campaign.commission_rate}% RevShare` : 
                               campaign.compensation_model === 'fixed' ? `£${campaign.fixed_fee} Flat` :
                               `£${campaign.fixed_fee} + ${campaign.commission_rate}%`}
                            </div>
                          </div>
                         
                        {app.status === 'accepted' && campaign.compensation_model !== 'fixed' && (
                          <CampaignTimeline 
                            campaign={campaign}
                            generatedLink={generatedLinks[campaign.id]}
                            handleGenerateLink={handleGenerateLink}
                            generatingFor={generatingFor}
                            handleCloudinarySuccess={handleCloudinarySuccess}
                            isElectron={isElectron}
                            handleNativeCompression={handleNativeCompression}
                            compressing={compressing}
                            compressionProgress={compressionProgress}
                          />
                        )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}