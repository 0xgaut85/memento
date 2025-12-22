"use client";

import { PageWrapper } from "@/components/layout/page-wrapper";
import { GlassCard } from "@/components/ui/glass-card";

export default function AlphaPage() {
  return (
    <PageWrapper>
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold mb-4">Alpha</h1>
        <p className="text-muted-foreground mb-8">Coming soon...</p>
        <GlassCard className="max-w-md mx-auto">
          <p className="text-sm text-muted-foreground">
            Access exclusive alpha strategies and insights. This feature is under development.
          </p>
        </GlassCard>
      </div>
    </PageWrapper>
  );
}

