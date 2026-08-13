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

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

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
              Adswish<span className="text-[#10B981]">.</span>
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
                Adswish<span className="text-[#10B981]">.</span>
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
              className="btn-primary w-full py-4 text-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed font-bold flex justify-center items-center h-[56px]"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Sign in"}
            </button>
          </form>

          <div className="mt-8 relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-subtle)]"></div>
            </div>
            <div className="relative bg-[var(--background)] px-4 text-sm text-[var(--text-tertiary)] font-medium">
              Or sign in with
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <button 
              type="button" 
              onClick={() => handleOAuthLogin('google')}
              className="flex items-center justify-center gap-2 p-3 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--surface-elevated)] transition-colors text-sm font-semibold text-[var(--foreground)]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.3 0 3.2 2.7 1.1 6.6l4 3.1c1-2.9 3.8-4.9 6.9-4.9z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.6c-.3 1.5-1.1 2.8-2.3 3.6l3.7 2.9c2.2-2 3.5-5 3.5-8.7z"/>
                <path fill="#FBBC05" d="M5.1 9.7c-.3 1-.4 2-.4 3.1s.1 2.1.4 3.1l-4 3.1C.4 17.5 0 14.8 0 12s.4-5.5 1.1-7.1l4 4.8z"/>
                <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.3 1.1-4.2 1.1-3 0-5.8-2-6.9-4.9l-4 3.1C3.2 21.3 7.3 24 12 24z"/>
              </svg>
              Google
            </button>
            <button 
              type="button" 
              onClick={() => handleOAuthLogin('apple')}
              className="flex items-center justify-center gap-2 p-3 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--surface-elevated)] transition-colors text-sm font-semibold text-[var(--foreground)]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 13.98c.02-2.35 1.94-3.48 2.03-3.53-1.09-1.58-2.79-1.8-3.39-1.82-1.43-.14-2.8.84-3.53.84-.73 0-1.85-.82-3.03-.8-1.54.02-2.96.9-3.76 2.28-1.6 2.77-.41 6.87 1.16 9.14.77 1.1 1.68 2.33 2.9 2.29 1.18-.05 1.62-.77 3.05-.77 1.41 0 1.83.77 3.07.75 1.25-.02 2.04-1.12 2.8-2.22 1-1.46 1.4-2.87 1.42-2.95-.03-.01-2.73-1.05-2.71-3.21zM15.1 7.38c.64-.78 1.07-1.87.95-2.94-1.01.04-2.13.68-2.79 1.46-.58.68-1.09 1.79-.95 2.85 1.11.08 2.15-.6 2.79-1.37z"/>
              </svg>
              Apple
            </button>
          </div>

          <div className="mt-8 text-center text-[var(--text-secondary)] text-sm font-medium">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-[var(--accent-secondary)] font-semibold hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
