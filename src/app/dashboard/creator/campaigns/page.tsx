"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Briefcase, Loader2, Megaphone, Plus, Link as LinkIcon, Copy, Sparkles, X, Upload, HardDrive, FileVideo } from "lucide-react";
import Link from "next/link";
import { CldUploadWidget } from 'next-cloudinary';

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

  const handleCloudinarySuccess = async (resultInfo: any, campaignId: string) => {
    setUploading(campaignId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // The secure_url points to the video on Cloudinary
      const videoUrl = resultInfo.secure_url;

      await supabase
        .from('campaign_applications')
        .update({ deliverable_url: videoUrl })
        .eq('campaign_id', campaignId)
        .eq('creator_id', user.id);

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
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--background)]">
                <th className="py-4 px-6 font-bold text-[var(--foreground)]/70 text-sm">Campaign</th>
                <th className="py-4 px-6 font-bold text-[var(--foreground)]/70 text-sm">Brand</th>
                <th className="py-4 px-6 font-bold text-[var(--foreground)]/70 text-sm">Application Status</th>
                <th className="py-4 px-6 font-bold text-[var(--foreground)]/70 text-sm">Model</th>
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
                    <tr key={app.id} className="border-b border-[var(--border-subtle)] hover:bg-[#F5F5F0]/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-[var(--foreground)]">{campaign.title}</div>
                      </td>
                      <td className="py-4 px-6 font-medium text-[var(--foreground)]/80">
                        {businessName}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                          app.status === 'accepted' ? 'bg-[#10B981]/10 text-[#10B981]' : 
                          app.status === 'pending' ? 'bg-[#FFB347]/10 text-[#FFB347]' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-[var(--foreground)]">
                        {campaign.compensation_model === 'performance' ? `${campaign.commission_rate}%` : 
                         campaign.compensation_model === 'fixed' ? `£${campaign.fixed_fee}` :
                         `£${campaign.fixed_fee} + ${campaign.commission_rate}%`}
                         
                        {app.status === 'accepted' && campaign.compensation_model !== 'fixed' && (
                          <div className="mt-3">
                            {generatedLinks[campaign.id] ? (
                              <div className="flex items-center gap-2 bg-[#F5F5F0] border border-[var(--border-subtle)] px-2 py-1.5 rounded-lg">
                                <input 
                                  readOnly 
                                  value={generatedLinks[campaign.id]} 
                                  className="bg-transparent border-none outline-none text-xs text-[var(--foreground)] w-full truncate"
                                />
                                <button onClick={() => copyToClipboard(generatedLinks[campaign.id])} className="text-[var(--foreground)]/60 hover:text-[#10B981]">
                                  <Copy size={14} />
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleGenerateLink(campaign.id)}
                                disabled={generatingFor === campaign.id}
                                className="btn-secondary py-1 px-3 text-xs flex items-center gap-1 w-full justify-center mb-2"
                              >
                                {generatingFor === campaign.id ? <Loader2 size={12} className="animate-spin" /> : <LinkIcon size={12} />}
                                Tracking Link
                              </button>
                            )}

                            <div className="relative w-full space-y-2">
                              {isElectron && (
                                <button
                                  onClick={() => handleNativeCompression(campaign.id)}
                                  disabled={compressing === campaign.id}
                                  className="btn-primary w-full py-2 px-3 text-xs flex flex-col items-center gap-1 justify-center relative overflow-hidden"
                                >
                                  {compressing === campaign.id ? (
                                    <>
                                      <div className="flex items-center gap-2 relative z-10">
                                        <Loader2 size={12} className="animate-spin" />
                                        Compressing ({compressionProgress}%)
                                      </div>
                                      <div 
                                        className="absolute top-0 left-0 bottom-0 bg-[#0E2F5A]/20 z-0 transition-all duration-300" 
                                        style={{ width: `${compressionProgress}%` }}
                                      />
                                    </>
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      <HardDrive size={12} />
                                      Mac Native Compression
                                    </div>
                                  )}
                                </button>
                              )}
                              {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? (
                                <CldUploadWidget 
                                  uploadPreset="ml_default"
                                onSuccess={(result: any) => handleCloudinarySuccess(result.info, campaign.id)}
                                options={{
                                  sources: ['local', 'google_drive', 'dropbox'],
                                  multiple: false,
                                  maxFiles: 1,
                                  clientAllowedFormats: ['video'],
                                  styles: {
                                      palette: {
                                          window: "#FFFFFF",
                                          windowBorder: "#10B981",
                                          tabIcon: "#10B981",
                                          menuIcons: "#10B981",
                                          textDark: "#000000",
                                          textLight: "#FFFFFF",
                                          link: "#10B981",
                                          action: "#10B981",
                                          inactiveTabIcon: "#0E2F5A",
                                          error: "#F44235",
                                          inProgress: "#10B981",
                                          complete: "#10B981",
                                          sourceBg: "#E4EBF1"
                                      }
                                  }
                                }}
                              >
                                {({ open }) => (
                                  <button 
                                    onClick={() => open()}
                                    disabled={uploading === campaign.id}
                                    className="btn-secondary w-full py-1 px-3 text-xs flex items-center gap-1 justify-center border-[var(--border-subtle)] hover:bg-[#10B981]/10 hover:text-[#10B981] hover:border-[#10B981]/30 transition-colors"
                                  >
                                    {uploading === campaign.id ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                                    {uploading === campaign.id ? "Processing..." : "Cloud Editor & Upload"}
                                  </button>
                                )}
                              </CldUploadWidget>
                              ) : (
                                <button 
                                  disabled
                                  className="btn-secondary w-full py-1 px-3 text-xs flex items-center gap-1 justify-center border-[var(--border-subtle)] opacity-50 cursor-not-allowed"
                                >
                                  <Upload size={12} />
                                  Cloudinary Not Configured
                                </button>
                              )}
                            </div>
                          </div>
                        )}
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