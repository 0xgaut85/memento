"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RefreshCw, ArrowUpDown, Loader2, Shield, Flame } from "lucide-react";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { GlassButton } from "@/components/ui/glass-button";
import { OpportunityCard } from "@/components/aggregator/opportunity-card";
import { AccessGate } from "@/components/aggregator/access-gate";
import { usePools } from "@/lib/hooks/use-pools";

const cyclingWords = ["saving", "earning", "lending", "growing", "staking"];

export default function AggregatorPage() {
  const {
    filteredPools,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    mode,
    setMode,
    refetch,
  } = usePools();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  // Reset showAll when mode changes
  useEffect(() => {
    setShowAll(false);
  }, [mode]);

  // Show 9 pools initially, all when expanded
  const displayedPools = showAll ? filteredPools : filteredPools.slice(0, 9);

  // Cycle through words
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % cyclingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  return (
    <PageWrapper>
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        {/* Logo + Brand */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          <Image
            src="/transparentlogo.png"
            alt="Memento"
            width={80}
            height={80}
            className="w-16 h-16 sm:w-20 sm:h-20"
          />
          <span className="font-serif text-lg sm:text-xl text-foreground/70 self-center">
            memento.money
          </span>
        </div>

        {/* Tagline with cycling word */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight">
          <span className="font-extralight">It's never too late to start</span>
          {" "}
          <AnimatePresence mode="wait">
            <motion.span
              key={currentWordIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-primary font-serif italic font-semibold"
            >
              {cyclingWords[currentWordIndex]}
            </motion.span>
          </AnimatePresence>
        </h1>
      </motion.div>

      {/* Search & Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search protocols, tokens, chains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-background/50 backdrop-blur-sm border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Mode toggle - Safe / Degen */}
          <div className="flex items-center bg-background/50 backdrop-blur-sm border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setMode("safe")}
              className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                mode === "safe"
                  ? "bg-emerald-500 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Basic stablecoins only (USDC, USDT, DAI, etc.)"
            >
              <Shield className="w-4 h-4" />
              Safe
            </button>
            <button
              onClick={() => setMode("degen")}
              className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                mode === "degen"
                  ? "bg-orange-500 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Include exotic stablecoins (sUSDe, sDAI, etc.)"
            >
              <Flame className="w-4 h-4" />
              Degen
            </button>
          </div>

          {/* Sort toggle */}
          <div className="flex items-center bg-background/50 backdrop-blur-sm border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setSortBy("tvl")}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                sortBy === "tvl"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <ArrowUpDown className="w-4 h-4" />
                TVL
              </span>
            </button>
            <button
              onClick={() => setSortBy("apy")}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                sortBy === "apy"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              APY
            </button>
          </div>

          {/* Refresh */}
          <GlassButton
            variant="default"
            size="sm"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            className="px-4 py-3"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </GlassButton>
        </div>
      </motion.div>

      {/* Error state */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-10 p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-center"
        >
          <p className="font-semibold text-lg mb-1">Failed to load opportunities</p>
          <p className="text-sm mb-3">{error.message}</p>
          <GlassButton variant="ghost" size="sm" onClick={handleRefresh}>
            Try again
          </GlassButton>
        </motion.div>
      )}

      {/* Loading state */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading opportunities...</p>
        </motion.div>
      )}

      {/* Results label */}
      {!isLoading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
        >
          <Image
            src="/transparentlogo.png"
            alt="Memento"
            width={20}
            height={20}
            className="w-5 h-5"
          />
          <span>Curated by Memento AI</span>
        </motion.div>
      )}

      {/* Cards Grid */}
      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedPools.map((pool, index) => (
              <OpportunityCard 
                key={pool.pool} 
                pool={pool} 
                index={index}
                rank={index < 3 ? index + 1 : undefined}
              />
            ))}
          </div>

          {/* Discover More Button */}
          {!showAll && filteredPools.length > 9 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center mt-10"
            >
              <GlassButton
                variant="outline"
                size="lg"
                onClick={() => setShowAll(true)}
                className="px-8"
              >
                Discover {filteredPools.length - 9} more opportunities
              </GlassButton>
            </motion.div>
          )}
        </>
      )}

      {/* Empty state */}
      {!isLoading && !error && filteredPools.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <p className="text-2xl font-semibold mb-2">No opportunities found</p>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or check back later
          </p>
          <GlassButton variant="default" onClick={() => setSearchQuery("")}>
            Clear search
          </GlassButton>
        </motion.div>
      )}
    </PageWrapper>
  );
}
