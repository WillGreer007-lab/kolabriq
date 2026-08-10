import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import RoleSplit from "@/components/landing/RoleSplit";
import Features from "@/components/landing/Features";
import ValueProp from "@/components/landing/ValueProp";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />
      <Hero />
      <RoleSplit />
      <Features />
      <ValueProp />
      <Footer />
    </main>
  );
}
