"use client";

import { useState } from "react";
import { Zap, Loader2, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VerifyPhonePage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Placeholder: In the future, this will call Twilio Verify API
    setTimeout(() => {
      setStep("code");
      setLoading(false);
    }, 1000);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Placeholder: Verify code with Twilio
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-6">
      <div className="pixis-card max-w-md w-full p-8 border border-[var(--border-subtle)] text-center">
        <div className="w-16 h-16 bg-[var(--accent-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--accent-primary)]">
          <Smartphone size={32} />
        </div>
        
        <h2 className="text-2xl font-heading font-extrabold text-[var(--foreground)] mb-2">
          Verify your phone
        </h2>
        
        <p className="text-[var(--text-secondary)] mb-8 text-sm">
          {step === "phone" 
            ? "Add your phone number to enable Two-Factor Authentication (2FA) and secure your account."
            : `Enter the 6-digit code we sent to ${phone}`}
        </p>

        {step === "phone" ? (
          <form onSubmit={handleSendCode} className="space-y-4 text-left">
            <div>
              <label className="text-sm font-semibold text-[var(--text-primary)] block mb-2" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field w-full"
                placeholder="+1 (555) 000-0000"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 font-bold flex justify-center items-center h-[48px]"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Send Code"}
            </button>
            <Link href="/dashboard" className="block text-center text-sm font-semibold text-[var(--text-tertiary)] hover:text-[var(--foreground)] mt-4">
              Skip for now
            </Link>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4 text-left">
            <div>
              <label className="text-sm font-semibold text-[var(--text-primary)] block mb-2" htmlFor="code">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="input-field w-full text-center text-2xl tracking-[0.5em] font-mono"
                placeholder="000000"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="btn-primary w-full py-3 font-bold flex justify-center items-center h-[48px]"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Verify Code"}
            </button>
            <button 
              type="button" 
              onClick={() => setStep("phone")}
              className="block w-full text-center text-sm font-semibold text-[var(--text-tertiary)] hover:text-[var(--foreground)] mt-4"
            >
              Use a different number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
