import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import ValueProp from "@/components/landing/ValueProp";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col gap-48 md:gap-64 bg-[var(--background)] pb-40">
      <Navbar />
      <Hero />
      <Features />
      <ValueProp />
      <Footer />
    </main>
  );
}
