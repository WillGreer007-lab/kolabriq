"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/landing/Footer";
import { Download, MonitorPlay, Terminal, ShieldAlert } from "lucide-react";

export default function DesktopAppPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />
      
      <section className="relative pt-32 pb-24 overflow-hidden flex flex-col items-center">
        <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] bg-[#FFB347]/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute top-[30%] right-[20%] w-[20%] h-[20%] bg-[#4A90E2]/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="container-custom max-w-4xl mx-auto flex flex-col items-center text-center z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)] mb-8 fade-in-up">
            <MonitorPlay size={18} className="text-[#4A90E2]" />
            <span className="text-sm font-semibold tracking-wide text-[var(--foreground)]">AdSwish Desktop Studio</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold text-[var(--foreground)] tracking-tight mb-6 fade-in-up delay-100">
            Native power for <br className="hidden md:block" />
            <span className="text-gradient-neon">heavy creators.</span>
          </h1>

          <p className="text-xl text-[var(--foreground)]/70 max-w-2xl mx-auto mb-12 fade-in-up delay-200">
            Bypass browser memory limits. Compress 4K video locally, upload instantly, and manage your campaigns from your dock.
          </p>

          <a href="#" onClick={(e) => { e.preventDefault(); alert('Link this to your generated .dmg file hosted on AWS S3 or GitHub Releases!'); }} className="btn-neon text-lg px-8 py-4 fade-in-up delay-300">
            <Download size={24} />
            Download for Mac (.dmg)
          </a>
        </div>
      </section>

      <section className="py-20 bg-[var(--surface)] border-y border-[var(--border-subtle)]">
        <div className="container-custom max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-16">
            Installation Guide
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="pixis-card bg-[var(--background)] p-8 border border-[var(--border)] relative overflow-hidden group">
              <div className="w-12 h-12 bg-[var(--surface)] rounded-full flex items-center justify-center text-xl font-bold mb-6 border border-[var(--border)] text-[#4A90E2]">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Download</h3>
              <p className="text-[var(--foreground)]/70 leading-relaxed">
                Click the download button above to grab the latest <code className="bg-[var(--surface-dark)] text-[var(--background)] px-2 py-1 rounded text-sm">AdSwish.dmg</code> installer for macOS.
              </p>
            </div>

            {/* Step 2 */}
            <div className="pixis-card bg-[var(--background)] p-8 border border-[var(--border)] relative overflow-hidden group">
              <div className="w-12 h-12 bg-[var(--surface)] rounded-full flex items-center justify-center text-xl font-bold mb-6 border border-[var(--border)] text-[#FFB347]">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Install</h3>
              <p className="text-[var(--foreground)]/70 leading-relaxed">
                Double-click the downloaded file and drag the AdSwish icon directly into your <span className="font-semibold">Applications</span> folder.
              </p>
            </div>

            {/* Step 3 */}
            <div className="pixis-card bg-[var(--background)] p-8 border border-[var(--border)] relative overflow-hidden group">
              <div className="w-12 h-12 bg-[var(--surface)] rounded-full flex items-center justify-center text-xl font-bold mb-6 border border-[var(--border)] text-[#10B981]">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Open & Allow</h3>
              <p className="text-[var(--foreground)]/70 leading-relaxed">
                Open AdSwish from Launchpad. If macOS shows a security warning, go to <span className="font-semibold">System Settings {'>'} Privacy & Security</span> and click <span className="font-semibold">Open Anyway</span>.
              </p>
            </div>
          </div>
          
          {/* Advanced Terminal Install for Devs */}
          <div className="mt-16 p-8 border border-[var(--border)] rounded-2xl bg-[var(--background)]">
            <div className="flex items-center gap-3 mb-4">
              <Terminal size={24} className="text-[var(--foreground)]/50" />
              <h3 className="text-2xl font-bold">For Developers (Local Build)</h3>
            </div>
            <p className="text-[var(--foreground)]/70 mb-6">
              If you are contributing to the AdSwish platform and want to compile the Desktop App from source code via terminal:
            </p>
            <div className="bg-[var(--foreground)] text-[var(--background)] p-6 rounded-xl font-mono text-sm overflow-x-auto">
              <p className="opacity-50 mb-2"># 1. Clone and enter directory</p>
              <p className="mb-4 text-emerald-400">git clone https://github.com/WillGreer007-lab/kolabriq.git<br/>cd kolabriq</p>
              
              <p className="opacity-50 mb-2"># 2. Install all dependencies</p>
              <p className="mb-4 text-emerald-400">npm install</p>

              <p className="opacity-50 mb-2"># 3. Compile the final .dmg installer</p>
              <p className="text-emerald-400">npm run build:desktop</p>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
