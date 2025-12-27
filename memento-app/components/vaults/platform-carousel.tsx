"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Platform {
  name: string;
  logo: string;
}

interface PlatformCarouselProps {
  platforms: Platform[];
}

/**
 * PlatformCarousel - Animated carousel showing platform logos
 */
export function PlatformCarousel({ platforms }: PlatformCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (platforms.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % platforms.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [platforms.length]);

  if (platforms.length === 0) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-black/30 font-medium tracking-wide shrink-0">
        POWERED BY
      </span>
      <div className="relative h-6 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center gap-2"
          >
            <Image
              src={platforms[currentIndex].logo}
              alt={platforms[currentIndex].name}
              width={20}
              height={20}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="text-xs font-medium text-black/70">
              {platforms[currentIndex].name}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Progress dots */}
      <div className="flex gap-1">
        {platforms.map((_, i) => (
          <div
            key={i}
            className={`w-1 h-1 rounded-full transition-colors ${
              i === currentIndex ? "bg-black/40" : "bg-black/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Platform configurations for each vault
 */
export const VAULT_PLATFORMS: Record<string, Platform[]> = {
  // Vault 01: Dividend Delta-Neutral
  "01": [
    { name: "TotalEnergies", logo: "/TotalEnergies.jpeg" },
    { name: "Santander", logo: "/Santander.png" },
    { name: "AXA", logo: "/Axa.png" },
    { name: "Ford", logo: "/Ford.jpeg" },
    { name: "SDIV", logo: "/SDIV Etf.png" },
    { name: "KWBD", logo: "/KBW Etf.png" },
    { name: "JEPI ETF", logo: "/JEPI.png" },
  ],
  // Vault 02: Basis & Funding Arbitrage
  "02": [
    { name: "Lighter", logo: "/Lighter.jpg" },
    { name: "Hyperliquid", logo: "/hyperliquid.jpg" },
    { name: "Aster", logo: "/aster.png" },
    { name: "Polymarket", logo: "/Polymarket.jpeg" },
    { name: "dYdX", logo: "/dydx.png" },
    { name: "Paradex", logo: "/Paradex.jpg" },
  ],
  // Vault 03: REITs / Income
  "03": [
    { name: "Annaly", logo: "/Annaly.jpeg" },
    { name: "Omega", logo: "/Omega.png" },
    { name: "Starwood", logo: "/Starwood.png" },
    { name: "EPR Properties", logo: "/EPR Properties.png" },
    { name: "Broadmark", logo: "/Broadmark.png" },
    { name: "Arbor", logo: "/Arbor.png" },
  ],
  // Vault 04: RWA Cashflow (coming soon)
  "04": [],
};

