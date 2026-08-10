import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kolabriq | Premium Creator Marketplace",
  description: "The intelligent infrastructure for the next generation of creator marketing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className="antialiased min-h-screen bg-[var(--background)] w-full"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
