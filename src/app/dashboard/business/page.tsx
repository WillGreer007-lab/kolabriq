import { createClient } from "@/lib/supabase/server";
import { TrendingUp, ArrowUpRight, Activity, Users, MousePointerClick } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function BusinessDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch campaigns for this business
  const { data: myCampaigns } = await supabase
    .from("campaigns")
    .select("id, pixel_status")
    .eq("business_id", user.id);

  const isPixelOffline = myCampaigns?.some(c => c.pixel_status === "offline") || false;



  let totalSpend = 0;
  let totalConversions = 0;
  let totalClicks = 0;
  let activeCreators = 0;

  if (myCampaigns && myCampaigns.length > 0) {
    const campaignIds = myCampaigns.map(c => c.id);

    // Total Spend (from ledger)
    const { data: ledgers } = await supabase
      .from("ledger_entries")
      .select("amount_total")
      .in("campaign_id", campaignIds);
    
    totalSpend = ledgers?.reduce((sum, item) => sum + Number(item.amount_total), 0) || 0;

    // Active Creators (accepted applications)
    const { count: creatorsCount } = await supabase
      .from("campaign_applications")
      .select("*", { count: 'exact', head: true })
      .in("campaign_id", campaignIds)
      .eq("status", "accepted");
    activeCreators = creatorsCount || 0;

    // Clicks
    const { count: clicksCount } = await supabase
      .from("clicks")
      .select("*", { count: 'exact', head: true })
      .in("campaign_id", campaignIds);
    totalClicks = clicksCount || 0;

    // Conversions
    const { count: convsCount } = await supabase
      .from("conversions")
      .select("*", { count: 'exact', head: true })
      .in("campaign_id", campaignIds);
    totalConversions = convsCount || 0;
  }

  const cpc = totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : "0.00";

  const companyName = user.user_metadata?.company_name || user.user_metadata?.full_name || "Business";

  const stats = [
    { title: "Total Spend", value: `£${totalSpend.toLocaleString(undefined, {minimumFractionDigits: 2})}`, change: "+8%", icon: TrendingUp, color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
    { title: "Total Conversions", value: totalConversions.toLocaleString(), change: "+15%", icon: Activity, color: "text-[#FFB347]", bg: "bg-[#FFB347]/10" },
    { title: "Active Creators", value: activeCreators.toString(), change: "+3", icon: Users, color: "text-[#4A90E2]", bg: "bg-[#4A90E2]/10" },
    { title: "Avg. CPC", value: `£${cpc}`, change: "-2%", icon: MousePointerClick, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" },
  ];

  return (
    <div className="space-y-8 fade-in-up">
      {/* Penalty Warning (Glassmorphic) */}
      {isPixelOffline && (
        <div className="glass-panel-danger p-6 rounded-xl flex items-center justify-between mb-8 shadow-neon-red fade-in-up">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 animate-pulse">
              <Activity size={20} strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-red-500 text-lg uppercase tracking-wider">Pixel Penalty Initiated — 30 Day Ban Pending</h3>
              <p className="text-red-500/80 text-sm mt-1 font-mono">CRITICAL: 12-hour grace period active. Restore pixel heartbeat immediately.</p>
            </div>
          </div>
          <button className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors shadow-neon-red">
            Override & Fix
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-heading font-extrabold text-[var(--foreground)] tracking-tighter">
            {companyName} Command Center
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 text-lg">
            Track your campaign ROI and performance metrics in real-time.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass-panel flex items-center gap-3 px-4 py-2 border border-[var(--border)] rounded-full">
            <div className={`w-2.5 h-2.5 rounded-full ${!isPixelOffline ? 'bg-[var(--accent-tertiary)] shadow-[0_0_10px_#10B981] animate-pulse' : 'bg-red-500 shadow-neon-red animate-pulse'}`} />
            <span className={`text-xs font-mono font-bold tracking-widest ${!isPixelOffline ? 'text-[var(--accent-tertiary)]' : 'text-red-500'}`}>
              {!isPixelOffline ? 'PIXEL: SECURE' : 'PIXEL: OFFLINE'}
            </span>
          </div>
          <Link href="/dashboard/business/campaigns/new" className="btn-primary py-2.5 px-8 text-sm">
            Deploy Campaign
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel p-6 border border-[var(--border)] group hover:border-[var(--accent-primary)] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={20} strokeWidth={1.5} />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold text-[#10B981] bg-[#10B981]/10 font-mono`}>
                <ArrowUpRight size={14} />
                {stat.change}
              </div>
            </div>
            <h3 className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-widest mb-2 font-mono">
              {stat.title}
            </h3>
            <p className="text-4xl font-mono font-bold text-[var(--foreground)]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Empty State Graph */}
        <div className="lg:col-span-2 glass-panel p-8 border border-[var(--border)] min-h-[400px] flex flex-col justify-center items-center text-center group relative overflow-hidden">
          <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-[var(--accent-primary)] opacity-5 blur-[100px] pointer-events-none group-hover:opacity-10 transition-opacity duration-700" />
          <Activity size={48} strokeWidth={1} className="text-[var(--text-tertiary)] mb-6" />
          <h2 className="text-2xl font-heading font-extrabold text-[var(--foreground)] tracking-tighter mb-2">Awaiting Data Streams</h2>
          <p className="text-[var(--text-secondary)] font-medium max-w-sm">Deploy a campaign to initiate real-time conversion routing and performance matrix.</p>
        </div>

        {/* Discovery CTA */}
        <div className="glass-panel p-8 border border-[var(--border)] bg-[var(--foreground)] text-white flex flex-col items-center text-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-primary)] opacity-20 blur-[50px]" />
          <Users size={48} strokeWidth={1} className="text-[var(--accent-primary)] mb-6" />
          <h2 className="text-3xl font-heading font-extrabold mb-4 tracking-tighter">Initialize Network</h2>
          <p className="text-white/70 font-medium mb-8 text-sm leading-relaxed">
            Query our curated network of tier-one creators ready to scale your infrastructure.
          </p>
          
          <Link href="/dashboard/business/discovery" className="btn-neon w-full">
            Discover Creators
          </Link>
        </div>
      </div>
    </div>
  );
}
