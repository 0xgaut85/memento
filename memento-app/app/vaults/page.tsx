"use client";

import { PageWrapper } from "@/components/layout/page-wrapper";
import { GlassCard } from "@/components/ui/glass-card";

export default function VaultsPage() {
  return (
    <PageWrapper>
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold mb-4">Vaults</h1>
        <p className="text-muted-foreground mb-8">Coming soon...</p>
        <GlassCard className="max-w-md mx-auto">
          <p className="text-sm text-muted-foreground">
            Capacity-limited strategies targeting 10-20% APY. Delta-neutral dividends, funding arbitrage, REITs, and RWA cashflow. This feature is under development.
          </p>
        </GlassCard>
      </div>
    </PageWrapper>
  );
}
