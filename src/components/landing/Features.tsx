import { Target, Zap, ShieldCheck, BarChart3, Users, DollarSign } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Target,
      title: "Precision Matching",
      description: "Our algorithm matches brands with creators based on deep audience analytics, not just vanity metrics.",
    },
    {
      icon: Zap,
      title: "Performance First",
      description: "Move beyond flat fees. Create hybrid or purely commission-based campaigns that align incentives.",
    },
    {
      icon: ShieldCheck,
      title: "Secure Escrow",
      description: "Funds are held securely until campaign deliverables are met, protecting both brands and creators.",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track clicks, conversions, and ROI through our integrated tracking links and live dashboards.",
    },
    {
      icon: Users,
      title: "Direct Communication",
      description: "Negotiate terms, approve content, and manage relationships directly through our built-in messenger.",
    },
    {
      icon: DollarSign,
      title: "Automated Payouts",
      description: "No more chasing invoices. Creators get paid automatically when milestones or conversions are hit.",
    },
  ];

  return (
    <section className="section py-24 md:py-32 bg-white border-y border-[var(--border-subtle)]" id="features">
      <div className="container-custom">
        <div className="flex flex-col items-center text-center mb-24 md:mb-32 fade-in-up gap-12">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-[var(--foreground)] mb-6 leading-none tracking-tight">
              Everything you need to scale
            </h2>
            <p className="text-xl text-[var(--foreground)]/70 font-medium">
              We&apos;ve built the infrastructure for the next generation of creator marketing, replacing spreadsheets with intelligent tools.
            </p>
          </div>
          <button className="btn-secondary whitespace-nowrap">
            View all capabilities
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="p-6 md:p-8 rounded-2xl bg-white shadow-sm border border-[var(--border-subtle)] hover:border-[#10B981]/30 transition-colors duration-500 group fade-in-up flex flex-col items-center text-center"
              style={{ animationDelay: `${(index % 3) * 0.1}s` }}
            >
              <div className="w-16 h-16 rounded-full bg-[var(--background)] flex items-center justify-center mb-8 shrink-0 text-[var(--foreground)] group-hover:text-[#10B981] group-hover:bg-[#10B981]/10 transition-all duration-500">
                <feature.icon size={24} />
              </div>
              
              <h3 className="text-2xl font-heading font-bold text-[var(--foreground)] mb-3">
                {feature.title}
              </h3>
              
              <p className="text-[var(--foreground)]/70 leading-relaxed text-lg font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
