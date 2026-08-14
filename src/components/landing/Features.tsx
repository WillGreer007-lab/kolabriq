import { Target, Zap, ShieldCheck, BarChart3, Users, DollarSign } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Target,
      title: "Precision Matching",
      description: "Our algorithm matches brands with creators based on deep audience analytics, not just vanity metrics.",
      className: "md:col-span-2 lg:col-span-2",
    },
    {
      icon: Zap,
      title: "Performance First",
      description: "Move beyond flat fees. Create hybrid or purely commission-based campaigns that align incentives.",
      className: "md:col-span-1 lg:col-span-1",
    },
    {
      icon: ShieldCheck,
      title: "Secure Escrow",
      description: "Funds are held securely until campaign deliverables are met, protecting both brands and creators.",
      className: "md:col-span-1 lg:col-span-1",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track clicks, conversions, and ROI through our integrated tracking links and live dashboards.",
      className: "md:col-span-2 lg:col-span-2",
    },
    {
      icon: Users,
      title: "Direct Communication",
      description: "Negotiate terms, approve content, and manage relationships directly through our built-in messenger.",
      className: "md:col-span-2 lg:col-span-1",
    },
    {
      icon: DollarSign,
      title: "Automated Payouts",
      description: "No more chasing invoices. Creators get paid automatically when milestones or conversions are hit.",
      className: "md:col-span-2 lg:col-span-2",
    },
  ];

  return (
    <section className="section relative bg-[var(--background)]" id="features">
      {/* Decorative Gradients for Glass to refract */}
      <div className="absolute top-[30%] left-[5%] w-[40%] h-[40%] bg-[var(--accent-primary)] opacity-[0.03] blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[20%] right-[5%] w-[40%] h-[40%] bg-[var(--accent-secondary)] opacity-[0.03] blur-[100px] -z-10 pointer-events-none" />

      <div className="container-custom">
        <div className="flex flex-col items-center text-center mb-16 fade-in-up">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-[var(--foreground)] mb-6 tracking-tighter">
              The Engine Room
            </h2>
            <p className="text-xl text-[var(--text-secondary)] font-medium">
              We've built the infrastructure for the next generation of creator marketing, replacing spreadsheets with mathematically precise tools.
            </p>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 auto-rows-fr">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`glass-panel p-8 md:p-10 flex flex-col group fade-in-up ${feature.className || ''}`}
              style={{ animationDelay: `${(index % 3) * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--background-subtle)] border border-[var(--border)] flex items-center justify-center mb-6 shrink-0 text-[var(--foreground)] group-hover:text-[var(--accent-primary)] transition-all duration-300 shadow-sm">
                <feature.icon size={20} />
              </div>
              
              <h3 className="text-2xl font-heading font-bold text-[var(--foreground)] mb-3">
                {feature.title}
              </h3>
              
              <p className="text-[var(--text-secondary)] leading-relaxed text-lg">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
