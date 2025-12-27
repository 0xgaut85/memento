"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ApyDisplayProps {
  apyMin: number;
  apyMax: number;
  currentApy: number;
  size?: "sm" | "md" | "lg";
  showRange?: boolean;
}

/**
 * ApyDisplay - Animated APY display that oscillates realistically
 */
export function ApyDisplay({
  apyMin,
  apyMax,
  currentApy,
  size = "md",
  showRange = true,
}: ApyDisplayProps) {
  const [displayApy, setDisplayApy] = useState(currentApy);

  // Animate APY changes smoothly
  useEffect(() => {
    const startValue = displayApy;
    const endValue = currentApy;
    const duration = 1000; // 1 second
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const newValue = startValue + (endValue - startValue) * eased;
      
      setDisplayApy(newValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [currentApy]);

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const rangeSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-1">
        <motion.span
          key={Math.floor(displayApy * 10)}
          initial={{ opacity: 0.5, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`font-mono font-bold tabular-nums ${sizeClasses[size]}`}
        >
          {displayApy.toFixed(2)}
        </motion.span>
        <span className={`font-mono text-black/50 ${rangeSizeClasses[size]}`}>%</span>
      </div>
      
      {showRange && (
        <span className={`font-mono text-black/40 ${rangeSizeClasses[size]}`}>
          {apyMin}–{apyMax}% range
        </span>
      )}
    </div>
  );
}

/**
 * ApyBadge - Compact APY badge for cards
 */
export function ApyBadge({ apy, className = "" }: { apy: number; className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-200/50 ${className}`}>
      <span className="text-emerald-600 font-mono font-semibold text-sm">
        {apy.toFixed(1)}%
      </span>
      <span className="text-emerald-500/70 text-xs">APY</span>
    </div>
  );
}

