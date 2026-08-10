"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Megaphone, Wallet, Settings, LogOut, Menu, UserCircle, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // We determine the active base route to highlight the correct nav links
  const isCreator = pathname.includes("/creator");
  const baseRoute = isCreator ? "/dashboard/creator" : "/dashboard/business";

  const navLinks = isCreator 
    ? [
        { name: "Overview", href: baseRoute, icon: LayoutDashboard },
        { name: "Marketplace", href: `${baseRoute}/campaigns/marketplace`, icon: UserCircle },
        { name: "My Campaigns", href: `${baseRoute}/campaigns`, icon: Megaphone },
        { name: "Messages", href: `${baseRoute}/messages`, icon: MessageCircle },
        { name: "Earnings", href: `${baseRoute}/earnings`, icon: Wallet },
        { name: "Profile", href: `${baseRoute}/profile`, icon: UserCircle },
        { name: "Settings", href: `${baseRoute}/settings`, icon: Settings },
      ]
    : [
        { name: "Overview", href: baseRoute, icon: LayoutDashboard },
        { name: "Discovery", href: `${baseRoute}/discovery`, icon: UserCircle },
        { name: "Campaigns", href: `${baseRoute}/campaigns`, icon: Megaphone },
        { name: "Messages", href: `${baseRoute}/messages`, icon: MessageCircle },
        { name: "Profile", href: `${baseRoute}/profile`, icon: UserCircle },
        { name: "Settings", href: `${baseRoute}/settings`, icon: Settings },
      ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-[var(--border-subtle)] sticky top-0 h-screen">
        <div className="h-24 flex items-center px-8 border-b border-[var(--border-subtle)]">
          <Link href="/" className="font-heading font-extrabold text-2xl tracking-tight text-[var(--foreground)]">
            Kolabriq<span className="text-[#10B981]">.</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActive 
                    ? "bg-[#10B981]/10 text-[#10B981]" 
                    : "text-[var(--foreground)]/70 hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                }`}
              >
                <link.icon size={20} className={isActive ? "text-[#10B981]" : ""} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border-subtle)]">
          <button 
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-all duration-300"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-20 bg-white border-b border-[var(--border-subtle)] flex items-center justify-between px-6 shrink-0">
          <Link href="/" className="font-heading font-extrabold text-xl tracking-tight text-[var(--foreground)]">
            Kolabriq<span className="text-[#10B981]">.</span>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[var(--foreground)]">
            <Menu size={24} />
          </button>
        </header>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-[var(--border-subtle)] z-50 shadow-lg fade-in-up">
            <nav className="p-4 space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                      isActive 
                        ? "bg-[#10B981]/10 text-[#10B981]" 
                        : "text-[var(--foreground)]/70 hover:bg-[var(--background)]"
                    }`}
                  >
                    <link.icon size={20} />
                    {link.name}
                  </Link>
                );
              })}
              <button 
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </nav>
          </div>
        )}

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12">
          <div className="max-w-6xl mx-auto w-full fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
