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
    .select("id")
    .eq("business_id", user.id);

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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-[var(--foreground)] tracking-tight">
            {companyName} Command Center
          </h1>
          <p className="text-[var(--foreground)]/60 mt-1 font-medium">
            Track your campaign ROI and performance metrics in real-time.
          </p>
        </div>
        <button className="btn-primary py-2 px-6 text-sm">
          New Campaign
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="pixis-card p-6 border border-[var(--border-subtle)] group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold text-[#10B981] bg-[#10B981]/10`}>
                <ArrowUpRight size={14} />
                {stat.change}
              </div>
            </div>
            <h3 className="text-[var(--foreground)]/60 text-sm font-semibold uppercase tracking-wider mb-1">
              {stat.title}
            </h3>
            <p className="text-3xl font-heading font-extrabold text-[var(--foreground)]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Empty State Graph */}
        <div className="lg:col-span-2 pixis-card p-8 border border-[var(--border-subtle)] min-h-[400px] flex flex-col justify-center items-center text-center">
          <Activity size={48} className="text-[var(--foreground)]/20 mb-4" />
          <h2 className="text-xl font-heading font-extrabold text-[var(--foreground)] tracking-tight mb-2">No Campaign Data</h2>
          <p className="text-[var(--foreground)]/60 font-medium max-w-sm">Launch a campaign to start seeing real-time conversion and ROI tracking.</p>
        </div>

        {/* Discovery CTA */}
        <div className="pixis-card p-8 border border-[var(--border-subtle)] bg-[var(--foreground)] text-white flex flex-col items-center text-center justify-center">
          <Users size={48} className="text-[#10B981] mb-6" />
          <h2 className="text-2xl font-heading font-extrabold mb-4 tracking-tight">Hire Creators</h2>
          <p className="text-white/70 font-medium mb-8">
            Browse our curated network of premium creators ready to scale your brand.
          </p>
          
          <Link href="/dashboard/business/discovery" className="w-full py-3 rounded-xl bg-white text-[var(--foreground)] font-bold hover:bg-[#F5F5F0] transition-colors block text-center">
            Discover Creators
          </Link>
        </div>
      </div>
    </div>
  );
}
