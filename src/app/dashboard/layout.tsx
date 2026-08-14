"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Megaphone, Wallet, Settings, LogOut, Menu, UserCircle, MessageCircle, ListOrdered, Users } from "lucide-react";
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
  const isAdmin = pathname.includes("/admin");
  const isCreator = pathname.includes("/creator");
  
  let baseRoute = "/dashboard/business";
  if (isAdmin) baseRoute = "/dashboard/admin";
  else if (isCreator) baseRoute = "/dashboard/creator";

  let navLinks: any[] = [];
  
  if (isAdmin) {
    navLinks = [
      { name: "Platform Users", href: baseRoute, icon: Users },
      { name: "Settings", href: `${baseRoute}/settings`, icon: Settings },
    ];
  } else if (isCreator) {
    navLinks = [
      { name: "Overview", href: baseRoute, icon: LayoutDashboard },
      { name: "Marketplace", href: `${baseRoute}/campaigns/marketplace`, icon: UserCircle },
      { name: "My Campaigns", href: `${baseRoute}/campaigns`, icon: Megaphone },
      { name: "Messages", href: `${baseRoute}/messages`, icon: MessageCircle },
      { name: "Earnings", href: `${baseRoute}/earnings`, icon: Wallet },
      { name: "Profile", href: `${baseRoute}/profile`, icon: UserCircle },
      { name: "Settings", href: `${baseRoute}/settings`, icon: Settings },
    ];
  } else {
    navLinks = [
      { name: "Overview", href: baseRoute, icon: LayoutDashboard },
      { name: "Discovery", href: `${baseRoute}/discovery`, icon: UserCircle },
      { name: "Campaigns", href: `${baseRoute}/campaigns`, icon: Megaphone },
      { name: "Messages", href: `${baseRoute}/messages`, icon: MessageCircle },
      { name: "Applications", href: `${baseRoute}/applications`, icon: ListOrdered },
      { name: "Profile", href: `${baseRoute}/profile`, icon: UserCircle },
      { name: "Settings", href: `${baseRoute}/settings`, icon: Settings },
    ];
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className={`min-h-screen ${isAdmin ? 'dark' : ''} bg-[var(--background)] flex w-full`}>
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-[var(--surface)] border-r border-[var(--border)] sticky top-0 h-screen transition-colors duration-500 backdrop-blur-3xl">
        <div className="h-24 flex items-center px-8 border-b border-[var(--border-subtle)]">
          <Link href="/" className="font-heading font-extrabold text-2xl tracking-tighter text-[var(--foreground)]">
            ADSWISH<span className="text-[var(--accent-primary)]">.</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 text-sm ${
                  isActive 
                    ? "bg-[var(--accent-primary)] text-white shadow-neon" 
                    : "text-[var(--text-secondary)] hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]"
                }`}
              >
                <link.icon size={18} strokeWidth={isActive ? 2 : 1.5} className={isActive ? "text-white" : ""} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border-subtle)]">
          <button 
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm text-[var(--accent-destructive)] hover:bg-[var(--accent-destructive)]/10 transition-all duration-300"
          >
            <LogOut size={18} strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden h-20 bg-white border-b border-[var(--border-subtle)] flex items-center justify-between px-6 shrink-0">
          <Link href="/" className="font-heading font-extrabold text-xl tracking-tight text-[var(--foreground)]">
            Adswish<span className="text-[#10B981]">.</span>
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
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="w-full fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
