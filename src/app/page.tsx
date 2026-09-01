import React from 'react';
import { MarketingNavbar } from '@/components/marketing/Navbar';
import { Hero } from '@/components/marketing/Hero';
import { InteractiveInvoiceDemo } from '@/components/marketing/InteractiveInvoiceDemo';
import { Features } from '@/components/marketing/Features';
import { Testimonials } from '@/components/marketing/Testimonials';
import { Pricing } from '@/components/marketing/Pricing';
import { FAQ } from '@/components/marketing/FAQ';
import { CTA } from '@/components/marketing/CTA';
import { Footer } from '@/components/marketing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <MarketingNavbar />
      <main className="flex-1">
        <Hero />
        <InteractiveInvoiceDemo />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
