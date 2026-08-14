import Link from "next/link";
import { Menu } from "lucide-react";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[var(--background)]/90 backdrop-blur-md">
      <div className="container-custom h-24 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {/* Simple dark SVGs are used in Pixis for the logo */}
          <div className="font-heading font-extrabold text-3xl tracking-tight text-[var(--foreground)] flex items-center">
            AdSwish<span className="text-[#10B981]">.</span>
          </div>
        </Link>
        
        {/* Main Nav */}
        <nav className="hidden md:flex items-center gap-10">
          <div className="relative group cursor-pointer">
            <span className="text-base font-semibold text-[var(--foreground)] hover:opacity-70 transition-opacity flex items-center gap-1">
              Products
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="ml-1 opacity-60 group-hover:rotate-180 transition-transform"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </div>
          <div className="relative group cursor-pointer">
            <span className="text-base font-semibold text-[var(--foreground)] hover:opacity-70 transition-opacity flex items-center gap-1">
              Solutions
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="ml-1 opacity-60 group-hover:rotate-180 transition-transform"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </div>
          <Link href="#features" className="text-base font-semibold text-[var(--foreground)] hover:opacity-70 transition-opacity">
            Peer Stories
          </Link>
          <div className="relative group cursor-pointer">
            <span className="text-base font-semibold text-[var(--foreground)] hover:opacity-70 transition-opacity flex items-center gap-1">
              Company
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="ml-1 opacity-60 group-hover:rotate-180 transition-transform"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </div>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/auth/login" className="text-base font-semibold text-[var(--foreground)] hover:opacity-70 transition-opacity">
            Sign In
          </Link>
          <Link href="/pricing" className="btn-primary">
            Pricing
          </Link>
        </div>

        <button className="md:hidden text-[var(--foreground)] p-2">
          <Menu size={28} />
        </button>
      </div>
    </header>
  );
}
