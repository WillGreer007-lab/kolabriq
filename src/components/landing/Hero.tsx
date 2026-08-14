"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden flex flex-col items-center justify-center bg-[var(--background)] min-h-[90vh]">
      {/* Intense Enterprise Mesh Gradients */}
      <div className="absolute top-[10%] left-[20%] w-[50%] h-[50%] bg-[var(--accent-primary)] opacity-10 blur-[150px] -z-10 pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute top-[30%] right-[20%] w-[40%] h-[40%] bg-[var(--accent-secondary)] opacity-15 blur-[130px] -z-10 pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

      {/* Top Navbar / Get Started Pill */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
        <div className="font-heading font-extrabold text-2xl tracking-tighter text-[var(--foreground)]">
          ADSWISH.
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[var(--foreground)] text-[var(--background)] px-6 py-2.5 rounded-full font-heading font-semibold text-sm hover:scale-105 transition-transform"
        >
          Get Started
        </button>
      </div>

      <div className="container-custom relative z-10 w-full max-w-[1000px] mx-auto flex flex-col items-center">
        
        {/* Massive Enterprise Typography */}
        <div className="text-center fade-in-up w-full flex flex-col items-center">
          <h1 className="text-[4rem] leading-[1.05] sm:text-[5.5rem] md:text-[6.5rem] font-heading font-extrabold text-[var(--foreground)] tracking-tighter mx-auto text-center">
            The Infrastructure for <br className="hidden md:block" />
            <span className="text-gradient-neon">Creator Commerce</span>
          </h1>
          
          <p className="mt-8 text-xl md:text-2xl text-[var(--text-secondary)] max-w-2xl mx-auto font-medium tracking-tight text-center">
            A mathematically precise, performance-based marketplace routing high-converting creators to premium consumer brands.
          </p>
        </div>

        {/* Auth Modal Overlay (Glassmorphism) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--foreground)]/10 backdrop-blur-md transition-opacity">
            <div className="glass-panel w-full max-w-md p-8 relative flex flex-col gap-6 fade-in-up">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
              
              <div className="text-center">
                <h3 className="font-heading font-bold text-2xl text-[var(--foreground)]">Choose your pathway</h3>
                <p className="text-[var(--text-secondary)] text-sm mt-1">Select your operating environment.</p>
              </div>

              <div className="flex flex-col gap-3">
                <Link href="/auth/signup?role=business" className="w-full flex items-center justify-between p-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5 transition-all group">
                  <div className="flex flex-col">
                    <span className="font-bold text-[var(--foreground)] group-hover:text-[var(--accent-primary)] transition-colors">Business Terminal</span>
                    <span className="text-xs text-[var(--text-tertiary)] mt-1">Campaign routing & pixel tracking</span>
                  </div>
                  <ChevronRight size={18} className="text-[var(--text-tertiary)] group-hover:text-[var(--accent-primary)] transition-colors" />
                </Link>

                <Link href="/auth/signup?role=creator" className="w-full flex items-center justify-between p-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent-secondary)] hover:bg-[var(--accent-secondary)]/5 transition-all group">
                  <div className="flex flex-col">
                    <span className="font-bold text-[var(--foreground)] group-hover:text-[var(--accent-secondary)] transition-colors">Creator Engine</span>
                    <span className="text-xs text-[var(--text-tertiary)] mt-1">Escrow payouts & strict deliverables</span>
                  </div>
                  <ChevronRight size={18} className="text-[var(--text-tertiary)] group-hover:text-[var(--accent-secondary)] transition-colors" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
