import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-48 md:pt-56 pb-12 md:pb-16 overflow-hidden flex flex-col items-center bg-[var(--background)]">
      {/* Decorative gradient orbs in background (very subtle on Pixis) */}
      <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-[#FFB347]/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] bg-[#4A90E2]/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="container-custom relative z-10 w-full max-w-[1200px] mx-auto flex flex-col items-center mt-12">
        
        {/* Massive Pixis Typography */}
        <div className="text-center fade-in-up w-full flex flex-col items-center">
          <h1 className="text-[3.5rem] leading-tight sm:text-[4.5rem] md:text-[5.5rem] lg:text-[6.5rem] font-heading font-extrabold text-[var(--foreground)] tracking-tight mx-auto max-w-[1100px] text-center">
            Advertisement for<br />
            <span className="relative inline-block">
              creators & brands
              <svg className="absolute -bottom-2 left-0 w-full h-4 text-[#10B981]" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          
          <p className="mt-8 text-xl md:text-2xl text-[var(--foreground)]/70 max-w-2xl mx-auto font-medium tracking-tight text-center">
            A complete performance-based marketplace connecting premium consumer brands with high-converting creators.
          </p>
        </div>

        {/* Carousel of Cards (Pixis Product Style) */}
        <div className="w-full mt-24 md:mt-32 fade-in-up delay-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            
            {/* Card 1: Prism / Business */}
            <Link href="/auth/signup?role=business" className="pixis-card bg-white group relative h-[500px] flex flex-col justify-between overflow-hidden block border border-[var(--border-subtle)] hover:border-[var(--foreground)]/20 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFF5E5] to-[#FFFFFF] -z-10" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#FFB347] opacity-20 blur-[80px] group-hover:opacity-40 transition-opacity duration-700 pointer-events-none" />
              
              <div className="p-8 md:p-10 relative z-10">
                <h3 className="text-3xl font-heading font-extrabold text-[var(--foreground)] mb-3">
                  For Businesses
                </h3>
                <p className="text-lg text-[var(--foreground)]/70 font-medium leading-tight max-w-[90%]">
                  Your command center for campaign performance and ROI tracking.
                </p>
              </div>

              <div className="flex items-center justify-between mt-auto p-8 md:p-10 relative z-10 bg-gradient-to-t from-white via-white/80 to-transparent">
                <span className="font-semibold text-[var(--foreground)] flex items-center gap-2 group-hover:gap-4 transition-all">
                  Launch a campaign <ArrowRight size={20} className="text-[#10B981]" />
                </span>
              </div>
            </Link>

            {/* Card 2: Adroom / Creator */}
            <Link href="/auth/signup?role=creator" className="pixis-card bg-white group relative h-[500px] flex flex-col justify-between overflow-hidden block border border-[var(--border-subtle)] hover:border-[var(--foreground)]/20 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-[#F0FDF4] to-[#FFFFFF] -z-10" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#10B981] opacity-20 blur-[80px] group-hover:opacity-40 transition-opacity duration-700 pointer-events-none" />
              
              <div className="p-8 md:p-10 relative z-10">
                <h3 className="text-3xl font-heading font-extrabold text-[var(--foreground)] mb-3">
                  For Creators
                </h3>
                <p className="text-lg text-[var(--foreground)]/70 font-medium leading-tight max-w-[90%]">
                  Your all-in-one creative powerhouse. Connect with premium brands automatically.
                </p>
              </div>

              <div className="flex items-center justify-between mt-auto p-8 md:p-10 relative z-10 bg-gradient-to-t from-white via-white/80 to-transparent">
                <span className="font-semibold text-[var(--foreground)] flex items-center gap-2 group-hover:gap-4 transition-all">
                  Start earning <ArrowRight size={20} className="text-[#4A90E2]" />
                </span>
              </div>
            </Link>

            {/* Card 3: Visibility */}
            <Link href="#features" className="pixis-card bg-white group relative h-[500px] flex flex-col justify-between overflow-hidden hidden lg:flex border border-[var(--border-subtle)] hover:border-[var(--foreground)]/20 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-[#EFF6FF] to-[#FFFFFF] -z-10" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#4A90E2] opacity-20 blur-[80px] group-hover:opacity-40 transition-opacity duration-700 pointer-events-none" />
              
              <div className="p-8 md:p-10 relative z-10">
                <h3 className="text-3xl font-heading font-extrabold text-[var(--foreground)] mb-3 flex items-center gap-2">
                  <Sparkles size={28} className="text-[#FFB347]" />
                  Visibility
                </h3>
                <p className="text-lg text-[var(--foreground)]/70 font-medium leading-tight max-w-[90%]">
                  Be the brand our algorithm recommends. Secure payments and instant matching.
                </p>
              </div>

              <div className="flex items-center justify-between mt-auto p-8 md:p-10 relative z-10 bg-gradient-to-t from-white via-white/80 to-transparent">
                <span className="font-semibold text-[var(--foreground)] flex items-center gap-2 group-hover:gap-4 transition-all">
                  See features <ArrowRight size={20} className="text-[#FFB347]" />
                </span>
              </div>
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}
