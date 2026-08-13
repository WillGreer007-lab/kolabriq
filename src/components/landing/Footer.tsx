import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[var(--foreground)] text-white pt-16 pb-8">
      <div className="container-custom">
        {/* Massive Footer CTA matching Pixis style */}
        <div className="mb-12 pb-12 border-b border-white/10 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12">
          <h2 className="text-4xl md:text-6xl font-heading font-extrabold max-w-2xl leading-none tracking-tight">
            Ready to revolutionize your marketing?
          </h2>
          <Link href="/pricing" className="bg-[#10B981] hover:bg-[#0EA5E9] text-white font-bold py-3 px-8 rounded-xl transition-colors">
            Pricing
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-5 pr-8">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="font-heading font-extrabold text-3xl tracking-tight text-white flex items-center">
                Adswish<span className="text-[#10B981]">.</span>
              </div>
            </Link>
            <p className="text-lg text-white/60 leading-relaxed max-w-sm font-medium">
              The intelligent infrastructure for the next generation of creator marketing. Built for scale, driven by performance.
            </p>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest opacity-50">Platform</h4>
            <ul className="flex flex-col gap-4 text-base font-medium text-white/90">
              <li><Link href="#features" className="hover:text-[#10B981] transition-colors">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-[#10B981] transition-colors">How It Works</Link></li>
              <li><Link href="/pricing" className="hover:text-[#10B981] transition-colors">Pricing</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest opacity-50">Company</h4>
            <ul className="flex flex-col gap-4 text-base font-medium text-white/90">
              <li><Link href="/about" className="hover:text-[#10B981] transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-[#10B981] transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-[#10B981] transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-3">
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest opacity-50">Join</h4>
            <ul className="flex flex-col gap-4 text-base font-medium text-white/90">
              <li><Link href="/auth/signup?role=creator" className="hover:text-[#10B981] transition-colors">I am a Creator</Link></li>
              <li><Link href="/auth/signup?role=business" className="hover:text-[#10B981] transition-colors">I am a Business</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 text-sm font-medium text-white/40 gap-4">
          <p>&copy; {new Date().getFullYear()} Adswish. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
