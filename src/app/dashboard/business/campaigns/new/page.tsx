"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Rocket, Briefcase, Percent, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewCampaignPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    compensation_model: "performance",
    fixed_fee: "",
    commission_rate: "",
    deliverables: [] as string[],
    target_url: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (deliverable: string) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.includes(deliverable)
        ? prev.deliverables.filter(d => d !== deliverable)
        : [...prev.deliverables, deliverable]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to create a campaign.");
      }

      const { error: insertError } = await supabase.from("campaigns").insert({
        business_id: user.id,
        title: formData.title,
        description: formData.description,
        compensation_model: formData.compensation_model,
        fixed_fee: formData.fixed_fee ? parseFloat(formData.fixed_fee) : 0,
        commission_rate: formData.commission_rate ? parseFloat(formData.commission_rate) : 0,
        deliverables: formData.deliverables,
        target_url: formData.target_url,
        status: "active"
      });

      if (insertError) throw insertError;

      router.push("/dashboard/business/campaigns");
    } catch (err: any) {
      setError(err.message || "Failed to create campaign.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto fade-in-up">
      <Link href="/dashboard/business/campaigns" className="flex items-center gap-2 text-[var(--foreground)]/60 hover:text-[var(--foreground)] font-medium mb-8 transition-colors">
        <ArrowLeft size={18} />
        Back to Campaigns
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-[var(--foreground)] tracking-tight">
          Create New Campaign
        </h1>
        <p className="text-[var(--foreground)]/60 mt-2 font-medium">
          Define your campaign goals, deliverables, and choose how you want to compensate creators.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="pixis-card p-8 border border-[var(--border-subtle)] space-y-6">
          <h2 className="text-xl font-heading font-extrabold text-[var(--foreground)] tracking-tight">Campaign Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Campaign Title</label>
              <input
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Summer Fitness App Launch"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none transition-all font-medium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Description</label>
              <textarea
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe your brand, the product, and what you are looking for..."
                className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none transition-all font-medium resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--foreground)] mb-3">Required Deliverables</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {["Instagram Reel", "Instagram Story", "TikTok Video", "YouTube Short", "YouTube Integration", "UGC Video"].map(del => (
                  <label key={del} className={`cursor-pointer flex items-center gap-3 p-3 rounded-xl border transition-all ${formData.deliverables.includes(del) ? 'border-[#10B981] bg-[#10B981]/5' : 'border-[var(--border-subtle)] hover:border-[#10B981]/30'}`}>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-[#10B981] rounded border-gray-300 focus:ring-[#10B981]" 
                      checked={formData.deliverables.includes(del)}
                      onChange={() => handleCheckboxChange(del)}
                    />
                    <span className="font-medium text-sm text-[var(--foreground)]">{del}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-sm font-bold text-[var(--foreground)]">Target URL</label>
              <p className="text-xs text-[var(--foreground)]/60 mb-2">Where should creators send their traffic?</p>
              <input 
                type="url" 
                required
                name="target_url"
                placeholder="https://yourstore.com/product"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none transition-all font-medium"
                value={formData.target_url}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Compensation Model */}
        <div className="pixis-card p-8 border border-[var(--border-subtle)] space-y-6">
          <h2 className="text-xl font-heading font-extrabold text-[var(--foreground)] tracking-tight">Compensation Model</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Performance */}
            <label className={`cursor-pointer p-4 border rounded-xl flex flex-col gap-3 transition-all ${formData.compensation_model === 'performance' ? 'border-[#10B981] bg-[#10B981]/5 shadow-sm' : 'border-[var(--border-subtle)] hover:border-[#10B981]/50'}`}>
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                  <Percent size={20} />
                </div>
                <input type="radio" name="compensation_model" value="performance" checked={formData.compensation_model === 'performance'} onChange={handleChange} className="sr-only" />
                {formData.compensation_model === 'performance' && <CheckCircle size={20} className="text-[#10B981]" />}
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)]">Performance</h3>
                <p className="text-xs text-[var(--foreground)]/60 font-medium mt-1">Pay only for sales/conversions via affiliate links.</p>
              </div>
            </label>

            {/* Fixed */}
            <label className={`cursor-pointer p-4 border rounded-xl flex flex-col gap-3 transition-all ${formData.compensation_model === 'fixed' ? 'border-[#4A90E2] bg-[#4A90E2]/5 shadow-sm' : 'border-[var(--border-subtle)] hover:border-[#4A90E2]/50'}`}>
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-full bg-[#4A90E2]/10 text-[#4A90E2] flex items-center justify-center">
                  <Briefcase size={20} />
                </div>
                <input type="radio" name="compensation_model" value="fixed" checked={formData.compensation_model === 'fixed'} onChange={handleChange} className="sr-only" />
                {formData.compensation_model === 'fixed' && <CheckCircle size={20} className="text-[#4A90E2]" />}
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)]">Fixed-Rate</h3>
                <p className="text-xs text-[var(--foreground)]/60 font-medium mt-1">Pay a guaranteed flat fee for the deliverables.</p>
              </div>
            </label>

            {/* Hybrid */}
            <label className={`cursor-pointer p-4 border rounded-xl flex flex-col gap-3 transition-all ${formData.compensation_model === 'hybrid' ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 shadow-sm' : 'border-[var(--border-subtle)] hover:border-[#8B5CF6]/50'}`}>
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
                  <Rocket size={20} />
                </div>
                <input type="radio" name="compensation_model" value="hybrid" checked={formData.compensation_model === 'hybrid'} onChange={handleChange} className="sr-only" />
                {formData.compensation_model === 'hybrid' && <CheckCircle size={20} className="text-[#8B5CF6]" />}
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)]">Hybrid</h3>
                <p className="text-xs text-[var(--foreground)]/60 font-medium mt-1">Combine a base fixed fee with performance commission.</p>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[var(--border-subtle)]">
            {(formData.compensation_model === 'fixed' || formData.compensation_model === 'hybrid') && (
              <div className="fade-in-up">
                <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Fixed Fee (£)</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  name="fixed_fee"
                  value={formData.fixed_fee}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none transition-all font-medium"
                />
              </div>
            )}
            
            {(formData.compensation_model === 'performance' || formData.compensation_model === 'hybrid') && (
              <div className="fade-in-up">
                <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Commission Rate (%)</label>
                <input
                  required
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  name="commission_rate"
                  value={formData.commission_rate}
                  onChange={handleChange}
                  placeholder="e.g. 15"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none transition-all font-medium"
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full md:w-auto px-8 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : "Launch Campaign"}
          </button>
        </div>
      </form>
    </div>
  );
}
