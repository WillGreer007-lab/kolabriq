import Link from "next/link";
import { ArrowRight, UserCheck, Building2 } from "lucide-react";

export default function RoleSplit() {
  return (
    <section className="section bg-[var(--background)]">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Creator Card */}
          <div className="pixis-card bg-[var(--surface)] p-10 md:p-14 flex flex-col items-center text-center fade-in-up relative">
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#FFB347]/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-8 shadow-sm">
              <UserCheck size={28} className="text-[var(--foreground)]" />
            </div>
            
            <h3 className="text-3xl md:text-5xl font-heading font-extrabold text-[var(--foreground)] mb-6 tracking-tight">
              Scale your brand.
            </h3>
            
            <p className="text-xl text-[var(--foreground)]/70 mb-10 flex-1 leading-relaxed font-medium">
              Monetize your audience with premium brand partnerships. Find campaigns that match your niche, negotiate rates, and get paid securely.
            </p>
            
            <Link href="/auth/signup?role=creator" className="btn-primary text-lg mt-auto">
              Join as a Creator
              <ArrowRight size={20} />
            </Link>
          </div>

          {/* Business Card */}
          <div className="pixis-card bg-[var(--surface)] p-10 md:p-14 flex flex-col items-center text-center fade-in-up delay-100 relative">
            <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-[#10B981]/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-8 shadow-sm">
              <Building2 size={28} className="text-[var(--foreground)]" />
            </div>
            
            <h3 className="text-3xl md:text-5xl font-heading font-extrabold text-[var(--foreground)] mb-6 tracking-tight">
              Scale your ROI.
            </h3>
            
            <p className="text-xl text-[var(--foreground)]/70 mb-10 flex-1 leading-relaxed font-medium">
              Find authentic creator content. Launch performance-based campaigns and track your ROI in real-time, all from one dashboard.
            </p>
            
            <Link href="/auth/signup?role=business" className="btn-primary text-lg mt-auto">
              Join as a Business
              <ArrowRight size={20} />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
