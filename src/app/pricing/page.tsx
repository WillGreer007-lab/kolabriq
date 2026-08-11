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
      
      <section className="flex-1 w-full relative overflow-hidden flex flex-col bg-[#F3F4F6]">
        {/* Main Container taking up full width and height */}
        <div className="w-full flex-1 flex flex-col fade-in-up">
          
          <div className="pt-32 pb-12 text-center px-4">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-6">
              Select your plan!
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Select the right plan for your business team.
            </p>
          </div>

          {/* Monthly / Annual Toggle */}
          <div className="mx-auto flex items-center justify-center bg-gray-200 p-1.5 rounded-xl w-fit mb-16">
            <button className="px-10 py-3 bg-[#2D2D2D] text-white text-base font-medium rounded-lg shadow-sm transition-all">
              Monthly
            </button>
            <button className="px-10 py-3 text-gray-500 hover:text-gray-900 text-base font-medium rounded-lg transition-all">
              Annual
            </button>
          </div>

          {/* Cards Container - Full width grid */}
          <div className="flex-1 w-full px-4 md:px-8 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 w-full h-full max-w-[2000px] mx-auto min-h-[600px]">
              {plans.map((plan) => (
                <div 
                  key={plan.name} 
                  className={`relative flex flex-col p-12 lg:p-16 ${
                    plan.isDark 
                      ? 'bg-[#2D2D2D] text-white shadow-2xl z-10 scale-[1.02] rounded-xl' 
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <div className="mb-12">
                    <h3 className={`text-xl font-medium mb-6 ${plan.isDark ? 'text-gray-200' : 'text-gray-600'}`}>
                      {plan.displayName}
                    </h3>
                    
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-6xl md:text-7xl font-bold">£{plan.price}</span>
                      <span className={`text-lg font-medium ${plan.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        /month
                      </span>
                    </div>
                    
                    <p className={`text-base leading-relaxed ${plan.isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {plan.description}
                    </p>
                  </div>
                  
                  <div className="flex-1 mb-12">
                    <ul className="space-y-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-4">
                          <div className={`mt-1 rounded-full p-1 ${plan.isDark ? 'bg-white text-[#2D2D2D]' : 'bg-[#2D2D2D] text-white'}`}>
                            <Check size={16} strokeWidth={3} />
                          </div>
                          <span className="text-lg font-medium leading-tight">
                            {feature.includes("Video Editing") ? (
                              <span className="flex items-center gap-2 font-bold text-[#4A90E2]"><Video size={18}/> {feature}</span>
                            ) : feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-auto pt-8">
                    <button 
                      onClick={() => handleSubscribe(plan.name, plan.price)}
                      disabled={loading === plan.name}
                      className={`w-full py-5 rounded-full text-lg font-bold flex justify-center items-center gap-2 transition-all ${
                        plan.isDark 
                          ? 'bg-white text-[#2D2D2D] hover:bg-gray-100' 
                          : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-900'
                      }`}
                    >
                      {loading === plan.name ? <Loader2 className="animate-spin" size={24} /> : plan.buttonText}
                    </button>
                  </div>
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
