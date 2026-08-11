"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, X, Sparkles, Loader2, Video } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/landing/Footer";

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubscribe = async (planName: string, amount: number) => {
    setLoading(planName);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = `/auth/login?redirect=/pricing`;
        return;
      }

      const res = await fetch("/api/stripe/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName, amount }),
      });

      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to initialize checkout");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error starting subscription: " + err.message);
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      name: "free",
      displayName: "Free Tier",
      price: 0,
      description: "Perfect for getting started with Kolabriq.",
      features: [
        "Up to 2 active campaigns",
        "Basic creator matchmaking",
        "Standard support",
        "Performance and Fixed fee models"
      ],
      notIncluded: [
        "Video Editing Suite",
        "Unlimited active campaigns",
        "Dedicated Account Manager"
      ],
      buttonText: "Start for free"
    },
    {
      name: "enterprise",
      displayName: "Enterprise",
      price: 5,
      popular: true,
      description: "For teams that need advanced content tools.",
      features: [
        "Up to 10 active campaigns",
        "Advanced creator matchmaking",
        "Priority support",
        "Video Editing Suite (Exclusive)",
        "Automated commission payouts"
      ],
      notIncluded: [
        "Unlimited active campaigns",
        "Dedicated Account Manager"
      ],
      buttonText: "Upgrade to Enterprise"
    },
    {
      name: "business",
      displayName: "Business",
      price: 10,
      description: "Unlimited scaling for established brands.",
      features: [
        "Unlimited active campaigns",
        "Premium creator matchmaking",
        "24/7 Priority support",
        "Dedicated Account Manager",
        "Advanced Analytics & ROI Tracking",
        "Custom API Access"
      ],
      notIncluded: [
        "Video Editing Suite (Enterprise Only)"
      ],
      buttonText: "Upgrade to Business"
    }
  ];

  return (
    <main className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />
      
      <section className="flex-1 w-full pt-48 pb-24 md:pt-56 md:pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#10B981]/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center mb-16 fade-in-up">
            <h1 className="text-4xl md:text-6xl font-heading font-extrabold text-[var(--foreground)] tracking-tight mb-6">
              Simple, transparent pricing.
            </h1>
            <p className="text-xl text-[var(--foreground)]/70 max-w-2xl mx-auto font-medium">
              Choose the plan that fits your growth. All plans are billed every 30 days.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {plans.map((plan, i) => (
              <div 
                key={plan.name} 
                className={`pixis-card relative bg-white border ${plan.popular ? 'border-[#10B981] shadow-lg shadow-[#10B981]/10' : 'border-[var(--border-subtle)]'} rounded-3xl p-8 flex flex-col fade-in-up`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#10B981] text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={14} /> Recommended
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-2xl font-heading font-extrabold text-[var(--foreground)] mb-2">{plan.displayName}</h3>
                  <p className="text-[var(--foreground)]/60 text-sm font-medium h-10">{plan.description}</p>
                </div>
                
                <div className="mb-8 flex items-end gap-1">
                  <span className="text-5xl font-heading font-extrabold text-[var(--foreground)]">£{plan.price}</span>
                  <span className="text-[var(--foreground)]/60 font-medium mb-1">/ month</span>
                </div>
                
                <button 
                  onClick={() => handleSubscribe(plan.name, plan.price)}
                  disabled={loading === plan.name}
                  className={`w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 mb-8 transition-all ${
                    plan.popular 
                      ? 'bg-[var(--foreground)] text-white hover:bg-[#10B981]' 
                      : 'bg-white border border-[var(--border-subtle)] text-[var(--foreground)] hover:border-[var(--foreground)]'
                  }`}
                >
                  {loading === plan.name ? <Loader2 className="animate-spin" size={20} /> : plan.buttonText}
                </button>
                
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/50 mb-4">What's included</p>
                  <ul className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-[#10B981] shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-[var(--foreground)]">
                          {feature.includes("Video Editing") ? (
                            <span className="flex items-center gap-1 font-bold text-[#4A90E2]"><Video size={14}/> {feature}</span>
                          ) : feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.notIncluded.length > 0 && (
                    <>
                      <div className="my-6 border-t border-[var(--border-subtle)]" />
                      <ul className="space-y-4 opacity-50">
                        {plan.notIncluded.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <X size={18} className="text-[var(--foreground)] shrink-0 mt-0.5" />
                            <span className="text-sm font-medium text-[var(--foreground)]">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}
