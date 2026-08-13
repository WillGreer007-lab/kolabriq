import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Star, ShieldCheck, TrendingUp, Link as LinkIcon, BadgeCheck, Play } from "lucide-react";
import Image from "next/image";

interface ProfilePageProps {
  params: { username: string };
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { username } = params;
  const supabase = await createClient();

  // Find user by ID or Username
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .or(`id.eq.${username}`)
    .single();

  if (!profile) {
    notFound();
  }

  // Fetch role-specific profile
  let details = null;
  if (profile.role === 'creator') {
    const { data } = await supabase.from('creator_profiles').select('*').eq('id', profile.id).single();
    details = data;
  } else if (profile.role === 'business') {
    const { data } = await supabase.from('business_profiles').select('*').eq('id', profile.id).single();
    details = data;
  }

  // Fetch recent reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, reviewer:profiles!reviewer_id(full_name, role)")
    .eq("reviewee_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const averageRating = details?.average_rating || 0;
  const strikes = details?.strikes || 0;
  
  // Dummy videos for creator portfolio
  const portfolioVideos = profile.role === 'creator' ? [1, 2, 3, 4] : [];

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 fade-in-up">
      {/* Profile Header */}
      <div className="pixis-card p-8 bg-white border border-[var(--border-subtle)] relative overflow-hidden mb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
          <div className="w-32 h-32 rounded-3xl bg-[var(--background)] border border-[var(--border-subtle)] overflow-hidden shadow-xl flex items-center justify-center relative">
             {details?.avatar_url || details?.logo_url ? (
               <Image src={details.avatar_url || details.logo_url} alt="Profile" fill className="object-cover" />
             ) : (
               <span className="text-4xl font-bold text-[var(--foreground)]/20 uppercase">{profile.full_name?.charAt(0) || "U"}</span>
             )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-heading font-extrabold text-[var(--foreground)] tracking-tight">
                {profile.role === 'business' ? details?.company_name || profile.full_name : profile.full_name}
              </h1>
              {profile.role === 'business' && strikes === 0 && (
                <div className="flex items-center gap-1 text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck size={14} /> Verified Entity
                </div>
              )}
              {profile.role === 'creator' && (
                <div className="flex items-center gap-1 text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                  <BadgeCheck size={14} /> Premium Creator
                </div>
              )}
            </div>
            
            <p className="text-[var(--text-secondary)] max-w-2xl text-lg font-medium leading-relaxed">
              {details?.bio || details?.industry || "This user hasn't added a bio yet."}
            </p>
          </div>

          {/* Reputation Badge */}
          <div className="flex flex-col items-center justify-center p-6 bg-[var(--background)] border border-[var(--border-subtle)] rounded-2xl min-w-[160px]">
            <div className="flex items-center gap-1 mb-2">
              <Star className="fill-[#F5A623] text-[#F5A623]" size={24} />
              <span className="text-3xl font-heading font-extrabold text-[var(--foreground)]">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest text-center">
              Aggregate Rating
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content (Portfolio or History) */}
        <div className="lg:col-span-2 space-y-12">
          {profile.role === 'creator' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-heading font-extrabold text-[var(--foreground)] tracking-tight">Dynamic Portfolio Grid</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {portfolioVideos.map((i) => (
                  <div key={i} className="aspect-[9/16] rounded-2xl bg-[#E4EBF1] overflow-hidden relative group cursor-pointer border border-[var(--border-subtle)]">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-white">
                        <p className="font-bold mb-1">Campaign Deliverable</p>
                        <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
                          <TrendingUp size={14} /> High Conversion Rate
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-[var(--accent-primary)] group-hover:scale-110 transition-transform">
                         <Play size={24} className="ml-1" />
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.role === 'business' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-heading font-extrabold text-[var(--foreground)] tracking-tight">Brand Campaign History</h2>
              <div className="pixis-card p-12 border border-[var(--border-subtle)] bg-white flex flex-col items-center text-center">
                 <LinkIcon size={48} className="text-[#10B981] mb-6" />
                 <p className="font-bold text-lg text-[var(--foreground)]">This brand has protected tracking enabled.</p>
                 <p className="text-[var(--text-secondary)] font-medium max-w-md mx-auto mt-2 leading-relaxed">Campaign history is available strictly through the Creator Marketplace discovery engine.</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar (Reviews) */}
        <div className="space-y-6">
          <h2 className="text-xl font-heading font-extrabold text-[var(--foreground)] tracking-tight">5-Star Reputation Engine</h2>
          <div className="space-y-4">
            {!reviews || reviews.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[var(--background)] border border-[var(--border-subtle)] text-center">
                <p className="text-[var(--text-tertiary)] font-bold text-sm">No reviews yet.</p>
              </div>
            ) : (
              reviews.map((review: any) => (
                <div key={review.id} className="p-6 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-sm relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-sm text-[var(--foreground)]">{review.reviewer?.full_name || "Unknown"}</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} className={s <= review.rating_out_of_5 ? "fill-[#F5A623] text-[#F5A623]" : "text-[var(--border-subtle)]"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">"{review.written_feedback}"</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
