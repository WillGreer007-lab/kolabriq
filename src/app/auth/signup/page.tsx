"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Zap, Loader2, UserCheck, Building2 } from "lucide-react";
import { Suspense } from "react";

function SignupForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "business" ? "business" : "creator";
  
  const [role, setRole] = useState<"creator" | "business">(initialRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "business" || roleParam === "creator") {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--background)]">
      {/* Left side - Visual */}
      <div className="hidden md:flex md:w-1/2 bg-white relative overflow-hidden items-center justify-center border-r border-[var(--border-subtle)]">
        <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-[#10B981]/10 blur-[100px] rounded-full" />
        
        <div className="relative z-10 max-w-md px-12 text-center fade-in-up">
          <Link href="/" className="inline-flex items-center gap-2 mb-12">
            <div className="font-heading font-extrabold text-4xl tracking-tight text-[var(--foreground)] flex items-center">
              Kolabriq<span className="text-[#10B981]">.</span>
            </div>
          </Link>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-[var(--foreground)] mb-6 tracking-tight leading-tight">
            Join the premier creator network.
          </h1>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            Whether you&apos;re building an audience or scaling a brand, we have the tools you need to succeed.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-[var(--background)]">
        <div className="w-full max-w-md fade-in-up delay-100">
          <div className="md:hidden mb-10 flex justify-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="font-heading font-extrabold text-3xl tracking-tight text-[var(--foreground)] flex items-center">
                Kolabriq<span className="text-[#10B981]">.</span>
              </div>
            </Link>
          </div>

          <h2 className="text-4xl font-heading font-extrabold text-[var(--foreground)] mb-2 tracking-tight">
            Create an account
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Choose your role and enter your details to get started.
          </p>

          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                {error}
              </div>
            )}
            
            {/* Role Toggle */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setRole("creator")}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  role === "creator"
                    ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/5"
                    : "border-[var(--border)] bg-transparent hover:border-[var(--border-subtle)] hover:bg-[var(--surface-elevated)]"
                }`}
              >
                <UserCheck size={24} className={role === "creator" ? "text-[var(--accent-primary)]" : "text-[var(--text-tertiary)]"} />
                <span className={`text-sm font-semibold ${role === "creator" ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                  Creator
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRole("business")}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  role === "business"
                    ? "border-[var(--accent-secondary)] bg-[var(--accent-secondary)]/5"
                    : "border-[var(--border)] bg-transparent hover:border-[var(--border-subtle)] hover:bg-[var(--surface-elevated)]"
                }`}
              >
                <Building2 size={24} className={role === "business" ? "text-[var(--accent-secondary)]" : "text-[var(--text-tertiary)]"} />
                <span className={`text-sm font-semibold ${role === "business" ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                  Business
                </span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--text-primary)]" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--text-primary)]" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="hello@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--text-primary)]" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed ${
                role === "business" ? "btn-accent" : "btn-primary"
              }`}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-10 text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[var(--accent-primary)] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--background)]"><Loader2 className="animate-spin text-[var(--accent-primary)]" /></div>}>
      <SignupForm />
    </Suspense>
  );
}
