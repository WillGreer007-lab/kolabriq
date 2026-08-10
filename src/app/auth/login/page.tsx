"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
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
        <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-[#FFB347]/10 blur-[100px] rounded-full" />
        
        <div className="relative z-10 max-w-md px-12 text-center fade-in-up">
          <Link href="/" className="inline-flex items-center gap-2 mb-12">
            <div className="font-heading font-extrabold text-4xl tracking-tight text-[var(--foreground)] flex items-center">
              Kolabriq<span className="text-[#10B981]">.</span>
            </div>
          </Link>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-[var(--foreground)] mb-6 tracking-tight leading-tight">
            Welcome back to the network.
          </h1>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            Sign in to manage your campaigns, track your ROI, and scale your audience.
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
            Sign in
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Enter your details below to access your account.
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                {error}
              </div>
            )}
            
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
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[var(--text-primary)]" htmlFor="password">
                  Password
                </label>
                <Link href="#" className="text-sm font-medium text-[var(--accent-secondary)] hover:underline">
                  Forgot password?
                </Link>
              </div>
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
              className="btn-primary w-full py-4 text-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Sign in"}
            </button>
          </form>

          <p className="text-center mt-10 text-[var(--text-secondary)]">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-[var(--accent-secondary)] font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
