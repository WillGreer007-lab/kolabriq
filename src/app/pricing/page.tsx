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
    <main className="flex min-h-screen flex-col bg-[#F3F4F6]">
      <Navbar />
      
      <section className="flex-1 w-full min-h-[calc(100vh-96px)] flex flex-col justify-between pt-28 pb-12 px-4 md:px-8 bg-[#F3F4F6]">
        {/* Main Container taking up full width and height */}
        <div className="w-full flex-1 flex flex-col justify-between fade-in-up max-w-[1800px] mx-auto">
          
          <div className="pt-4 pb-8 text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight mb-4">
              Select your plan!
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
              Select the right plan for your business team.
            </p>
          </div>

          {/* Monthly / Annual Toggle */}
          <div className="mx-auto flex items-center justify-center bg-gray-200 p-1.5 rounded-xl w-fit mb-8">
            <button className="px-8 py-2.5 bg-[#2D2D2D] text-white text-base font-medium rounded-lg shadow-sm transition-all">
              Monthly
            </button>
            <button className="px-8 py-2.5 text-gray-500 hover:text-gray-900 text-base font-medium rounded-lg transition-all">
              Annual
            </button>
          </div>

          {/* Cards Container - Full width grid */}
          <div className="flex-1 w-full flex flex-col justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 w-full flex-1 items-stretch min-h-[500px]">
              {plans.map((plan) => (
                <div 
                  key={plan.name} 
                  className={`relative flex flex-col justify-between p-8 md:p-12 lg:p-14 ${
                    plan.isDark 
                      ? 'bg-[#2D2D2D] text-white shadow-2xl z-10 scale-[1.01] rounded-2xl md:rounded-xl' 
                      : 'bg-white text-gray-900 border border-gray-200 rounded-2xl md:rounded-none md:first:rounded-l-2xl md:last:rounded-r-2xl'
                  }`}
                >
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${plan.isDark ? 'text-gray-200' : 'text-gray-600'}`}>
                      {plan.displayName}
                    </h3>
                    
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-5xl md:text-6xl font-extrabold">£{plan.price}</span>
                      <span className={`text-base font-medium ${plan.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        /month
                      </span>
                    </div>
                    
                    <p className={`text-sm leading-relaxed mb-8 ${plan.isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {plan.description}
                    </p>
                    
                    <ul className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className={`mt-0.5 rounded-full p-1 shrink-0 ${plan.isDark ? 'bg-white text-[#2D2D2D]' : 'bg-[#2D2D2D] text-white'}`}>
                            <Check size={14} strokeWidth={3} />
                          </div>
                          <span className="text-base font-medium leading-tight">
                            {feature.includes("Video Editing") ? (
                              <span className="flex items-center gap-1.5 font-bold text-[#4A90E2]"><Video size={16}/> {feature}</span>
                            ) : feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-8 mt-auto">
                    <button 
                      onClick={() => handleSubscribe(plan.name, plan.price)}
                      disabled={loading === plan.name}
                      className={`w-full py-4 rounded-full text-base font-bold flex justify-center items-center gap-2 transition-all ${
                        plan.isDark 
                          ? 'bg-white text-[#2D2D2D] hover:bg-gray-100' 
                          : 'bg-[#2D2D2D] text-white hover:bg-gray-800'
                      }`}
                    >
                      {loading === plan.name ? <Loader2 className="animate-spin" size={20} /> : plan.buttonText}
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
