"use client";

import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { WhyMemento } from "@/components/landing/why-memento";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Vaults } from "@/components/landing/vaults";
import { MementoAlphas } from "@/components/landing/memento-alphas";
import { YieldAggregator } from "@/components/landing/yield-aggregator";
import { FeesToken } from "@/components/landing/fees-token";
import { FooterCTA } from "@/components/landing/footer-cta";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { SmoothScrollProvider } from "@/components/ui/smooth-scroll";

export default function Home() {
  return (
    <>
      <LoadingScreen />
      <SmoothScrollProvider>
        <div className="min-h-screen font-sans selection:bg-primary selection:text-white overflow-x-hidden">
          <ScrollProgress />
          <Navbar />
          <main className="overflow-x-hidden">
            <Hero />
            <WhyMemento />
            <HowItWorks />
            <Vaults />
            <MementoAlphas />
            <YieldAggregator />
            <FeesToken />
            <FooterCTA />
          </main>
        </div>
      </SmoothScrollProvider>
    </>
  );
}
