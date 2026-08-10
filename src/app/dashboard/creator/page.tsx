import { createClient } from "@/lib/supabase/server";
import { Wallet, ArrowUpRight, Megaphone, Users, Target } from "lucide-react";
import { redirect } from "next/navigation";

export default async function CreatorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch actual earnings from ledger
  const { data: ledgers } = await supabase
    .from("ledger_entries")
    .select("amount_creator")
    .eq("creator_id", user.id);

  const totalEarnings = ledgers?.reduce((sum, item) => sum + Number(item.amount_creator), 0) || 0;

  // Fetch active campaigns (accepted applications)
  const { count: activeCampaigns } = await supabase
    .from("campaign_applications")
    .select("*", { count: 'exact', head: true })
    .eq("creator_id", user.id)
    .eq("status", "accepted");

  // Fetch clicks
  const { count: clicksCount } = await supabase
    .from("clicks")
    .select("*", { count: 'exact', head: true })
    .eq("creator_id", user.id);
  let totalClicks = clicksCount || 0;

  // Calculate EPC
  const epc = totalClicks > 0 ? (totalEarnings / totalClicks).toFixed(2) : "0.00";
  
  const firstName = user.user_metadata?.full_name?.split(" ")[0] || "Creator";

  const stats = [
    { title: "Total Earnings", value: `£${totalEarnings.toLocaleString(undefined, {minimumFractionDigits: 2})}`, change: "+12%", icon: Wallet, color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
    { title: "Active Campaigns", value: (activeCampaigns || 0).toString(), change: "+2", icon: Megaphone, color: "text-[#4A90E2]", bg: "bg-[#4A90E2]/10" },
    { title: "Total Link Clicks", value: totalClicks.toLocaleString(), change: "+5%", icon: Users, color: "text-[#FFB347]", bg: "bg-[#FFB347]/10" },
    { title: "Earnings Per Click", value: `£${epc}`, change: "+1%", icon: Target, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-[var(--foreground)] tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-[var(--foreground)]/60 mt-1 font-medium">
          Here is what is happening with your content today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="pixis-card p-6 border border-[var(--border-subtle)] group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={24} />
              </div>
              <div className="flex items-center gap-1 text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-md text-xs font-bold">
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
        {/* Active Campaigns List */}
        <div className="lg:col-span-2 pixis-card p-8 border border-[var(--border-subtle)] flex flex-col justify-center items-center text-center min-h-[300px]">
          <Megaphone size={48} className="text-[#10B981]/20 mb-4" />
          <h2 className="text-xl font-heading font-extrabold text-[var(--foreground)] tracking-tight mb-2">No Active Campaigns</h2>
          <p className="text-[var(--foreground)]/60 font-medium">You don't have any active campaigns yet. Browse the marketplace to find brands.</p>
        </div>

        {/* Next Steps / Suggestions */}
        <div className="pixis-card p-8 border border-[var(--border-subtle)] bg-[var(--foreground)] text-white">
          <h2 className="text-xl font-heading font-extrabold mb-6 tracking-tight">Complete Profile</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/10 border border-white/5">
              <span className="font-bold text-sm">Add Social Links</span>
              <span className="text-xs font-bold px-2 py-1 bg-[#10B981]/20 text-[#10B981] rounded-md">Action</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/10 border border-white/5">
              <span className="font-bold text-sm">Update Bio</span>
              <span className="text-xs font-bold px-2 py-1 bg-[#10B981]/20 text-[#10B981] rounded-md">Action</span>
            </div>
          </div>
          
          <button className="w-full mt-8 py-3 rounded-xl bg-white text-[var(--foreground)] font-bold hover:bg-[#F5F5F0] transition-colors">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
