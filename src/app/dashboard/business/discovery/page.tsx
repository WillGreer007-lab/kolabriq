import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Search, Filter, Star, CheckCircle, ExternalLink, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CreatorDiscoveryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Use service role key to fetch all users since we are bypassing the incomplete creator_profiles table
  // and reading directly from user_metadata. This is safe because it's a Server Component.
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: authUsers, error } = await supabaseAdmin.auth.admin.listUsers();
  
  if (error) {
    console.error("Error fetching creators:", error);
  }

  // Filter users who are creators and are NOT seeded (no fake data)
  const creators = authUsers?.users.filter(u => u.user_metadata?.role === 'creator' && !u.user_metadata?.is_seeded) || [];

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-[var(--foreground)] tracking-tight">
            Creator Discovery
          </h1>
          <p className="text-[var(--foreground)]/60 mt-1 font-medium">
            Find and hire the perfect creators for your next campaign.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, niche, or keyword..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-white focus:outline-none focus:border-[#10B981] transition-colors text-sm font-medium"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-white hover:bg-[#F5F5F0] transition-colors text-sm font-bold text-[var(--foreground)]">
            <Filter size={18} />
            Filters
          </button>
        </div>
      </div>

      {/* Categories Filter (Pixis Pill style) */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Fitness', 'Tech', 'Fashion', 'Beauty', 'Travel', 'Gaming'].map((category, i) => (
          <button 
            key={category}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${
              i === 0 
                ? "bg-[#10B981] text-white shadow-sm" 
                : "bg-white border border-[var(--border-subtle)] text-[var(--foreground)]/70 hover:border-[#10B981]/50 hover:text-[#10B981]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Creator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {creators.map((creator) => {
          const profile = creator.user_metadata;

          return (
            <div key={creator.id} className="pixis-card bg-white border border-[var(--border-subtle)] hover:border-[var(--foreground)]/20 transition-all flex flex-col group overflow-hidden">
              {/* Card Header (Avatar + Name) */}
              <div className="p-6 pb-4 border-b border-[var(--border-subtle)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/5 rounded-full blur-[40px] -z-10 group-hover:bg-[#10B981]/10 transition-colors duration-500" />
                
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <img 
                      src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=10B981&color=fff`} 
                      alt={profile.full_name} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#10B981] rounded-full border-2 border-white" title="Verified Creator" />
                  </div>
                  <div className="flex items-center gap-1 bg-[#F5F5F0] px-2 py-1 rounded-md text-xs font-bold text-[var(--foreground)]">
                    <Star size={12} className="text-[#FFB347] fill-[#FFB347]" />
                    4.9
                  </div>
                </div>

                <h3 className="font-heading font-extrabold text-xl text-[var(--foreground)] tracking-tight flex items-center gap-1">
                  {profile.full_name}
                  <CheckCircle size={16} className="text-[#4A90E2]" />
                </h3>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile.niche_categories?.slice(0, 3).map((niche: string) => (
                    <span key={niche} className="text-xs font-semibold px-2 py-1 bg-[var(--background)] rounded-md text-[var(--foreground)]/70">
                      {niche}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Body (Bio & Stats) */}
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-sm text-[var(--foreground)]/70 font-medium line-clamp-3 mb-6 flex-1">
                  {profile.bio || "No bio provided."}
                </p>

                {/* Social Links */}
                {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--border-subtle)]">
                    {Object.entries(profile.social_links).map(([platform, handle]) => {
                      const iconMap: Record<string, any> = {
                        // Fallback to ExternalLink for all platforms to avoid missing Lucide icon errors
                      };
                      return (
                        <a key={platform} href="#" title={handle as string} className="text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-colors">
                          {iconMap[platform.toLowerCase()] || <ExternalLink size={18} />}
                        </a>
                      );
                    })}
                  </div>
                )}

                <button className="w-full py-2.5 rounded-xl bg-[var(--foreground)] text-white font-bold hover:bg-[#10B981] transition-colors">
                  View Profile
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {creators?.length === 0 && (
        <div className="pixis-card p-12 flex flex-col items-center justify-center text-center bg-white border border-[var(--border-subtle)]">
          <Users size={48} className="text-[var(--foreground)]/20 mb-4" />
          <h2 className="text-2xl font-heading font-extrabold text-[var(--foreground)] tracking-tight mb-2">No Creators Found</h2>
          <p className="text-[var(--foreground)]/60 font-medium max-w-md mx-auto">
            We couldn't find any creators matching your search criteria. Try adjusting your filters.
          </p>
        </div>
      )}
    </div>
  );
}
