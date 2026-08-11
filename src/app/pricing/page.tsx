"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Check, Loader2, Video } from "lucide-react";
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
      description: "Ideal for new business and small teams who just started business.",
      features: [
        "Up to 2 active campaigns",
        "Basic creator matchmaking",
        "Standard support",
        "Performance and Fixed fee models"
      ],
      buttonText: "Current Plan",
      isDark: false
    },
    {
      name: "enterprise",
      displayName: "Enterprise",
      price: 5,
      description: "A comprehensive plan for brands seeking more advanced features.",
      features: [
        "Up to 10 active campaigns",
        "Advanced creator matchmaking",
        "Priority support",
        "Video Editing Suite",
        "Automated commission payouts"
      ],
      buttonText: "Upgrade to Enterprise",
      isDark: true
    },
    {
      name: "business",
      displayName: "Business",
      price: 10,
      description: "Tailored for experienced brands and companies with complex high-level needs.",
      features: [
        "Unlimited active campaigns",
        "Premium creator matchmaking",
        "24/7 Priority support",
        "Dedicated Account Manager",
        "Advanced Analytics & ROI Tracking",
        "Custom API Access"
      ],
      buttonText: "Upgrade to Business",
      isDark: false
    }
  ];

  return (
    <main className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />
      
      <section className="flex-1 w-full pt-32 pb-24 px-4 relative overflow-hidden flex items-center justify-center">
        {/* Main White Container matching the mockup */}
        <div className="bg-white w-full max-w-6xl mx-auto rounded-xl shadow-xl overflow-hidden fade-in-up">
          
          <div className="pt-16 pb-8 text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
              Select your plan!
            </h1>
            <p className="text-base text-gray-500 max-w-2xl mx-auto">
              Select the right plan for your business team.
            </p>
          </div>

          {/* Monthly / Annual Toggle */}
          <div className="mx-auto flex items-center justify-center bg-gray-100 p-1 rounded-lg w-fit mb-12">
            <button className="px-8 py-2.5 bg-[#2D2D2D] text-white text-sm font-medium rounded shadow-sm transition-all">
              Monthly
            </button>
            <button className="px-8 py-2.5 text-gray-500 hover:text-gray-900 text-sm font-medium rounded transition-all">
              Annual
            </button>
          </div>

          {/* Cards Container */}
          <div className="bg-[#F3F4F6] p-4 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <div 
                  key={plan.name} 
                  className={`relative flex flex-col p-8 md:p-10 ${
                    plan.isDark 
                      ? 'bg-[#2D2D2D] text-white shadow-2xl z-10 scale-105 rounded-lg' 
                      : 'bg-white text-gray-900 border border-gray-100'
                  }`}
                >
                  <div className="mb-8">
                    <h3 className={`text-sm font-medium mb-4 ${plan.isDark ? 'text-gray-200' : 'text-gray-600'}`}>
                      {plan.displayName}
                    </h3>
                    
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-4xl md:text-5xl font-bold">£{plan.price}</span>
                      <span className={`text-sm font-medium ${plan.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        /month
                      </span>
                    </div>
                    
                    <p className={`text-xs leading-relaxed ${plan.isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {plan.description}
                    </p>
                  </div>
                  
                  <div className="flex-1 mb-10">
                    <ul className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className={`mt-0.5 rounded-full p-0.5 ${plan.isDark ? 'bg-white text-[#2D2D2D]' : 'bg-[#2D2D2D] text-white'}`}>
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <span className="text-sm font-medium leading-tight">
                            {feature.includes("Video Editing") ? (
                              <span className="flex items-center gap-1 font-bold"><Video size={14}/> {feature}</span>
                            ) : feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button 
                    onClick={() => handleSubscribe(plan.name, plan.price)}
                    disabled={loading === plan.name}
                    className={`w-full py-3.5 rounded-full text-sm font-bold flex justify-center items-center gap-2 transition-all ${
                      plan.isDark 
                        ? 'bg-white text-[#2D2D2D] hover:bg-gray-100' 
                        : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-900'
                    }`}
                  >
                    {loading === plan.name ? <Loader2 className="animate-spin" size={18} /> : plan.buttonText}
                  </button>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </section>
      
      <Footer />
    </main>
  );
}
