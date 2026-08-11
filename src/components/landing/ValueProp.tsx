import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function ValueProp() {
  return (
    <section className="section bg-[var(--background)]" id="how-it-works">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Visual */}
          <div className="relative w-full fade-in-up">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-[#FFB347]/10 rounded-full blur-[80px] -z-10" />
            
            <div className="pixis-card relative z-10 p-8 md:p-10 border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--border-subtle)]">
                <div>
                  <h3 className="text-2xl font-heading font-extrabold text-[var(--foreground)] mb-1">Campaign ROI</h3>
                  <p className="text-sm font-medium text-[var(--foreground)]/60">Last 30 days</p>
                </div>
                <div className="px-4 py-2 bg-[#10B981]/10 text-[#10B981] rounded-full font-bold text-sm">
                  +24% ROI
                </div>
              </div>

              <div className="space-y-8">
                {/* Metric 1 */}
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-[var(--foreground)]/60 font-semibold uppercase tracking-wider">Creator Spend</span>
                    <span className="text-[var(--foreground)] font-bold text-lg">£12,450</span>
                  </div>
                  <div className="w-full bg-[var(--background)] rounded-full h-3">
                    <div className="bg-[#4A90E2] h-3 rounded-full w-[65%]" />
                  </div>
                </div>

                {/* Metric 2 */}
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-[var(--foreground)]/60 font-semibold uppercase tracking-wider">Revenue Generated</span>
                    <span className="text-[var(--foreground)] font-bold text-lg">£48,200</span>
                  </div>
                  <div className="w-full bg-[var(--background)] rounded-full h-3">
                    <div className="bg-[#10B981] h-3 rounded-full w-[85%]" />
                  </div>
                </div>

                {/* Metric 3 */}
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-[var(--foreground)]/60 font-semibold uppercase tracking-wider">Total Conversions</span>
                    <span className="text-[var(--foreground)] font-bold text-lg">842</span>
                  </div>
                  <div className="w-full bg-[var(--background)] rounded-full h-3">
                    <div className="bg-[#FFB347] h-3 rounded-full w-[45%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="flex flex-col gap-8 fade-in-up delay-100">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-[var(--foreground)] leading-none tracking-tight">
              Stop guessing. Start tracking <span className="text-[#10B981]">ROI</span>.
            </h2>
            
            <p className="text-xl text-[var(--foreground)]/70 font-medium leading-relaxed">
              The days of paying flat fees for vanity metrics are over. Kolabriq empowers you to build campaigns based on actual performance and conversions.
            </p>

            <ul className="space-y-6 mt-4">
              {[
                "Unique tracking links automatically generated for every creator",
                "Real-time dashboards showing clicks, conversions, and sales",
                "Automated commission payouts when milestones are hit",
                "Detailed analytics on which niches and creators perform best"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-[var(--foreground)] font-medium text-lg leading-snug">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link href="/auth/signup?role=business" className="btn-primary py-4 px-8 text-lg">
                Start your first campaign
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
