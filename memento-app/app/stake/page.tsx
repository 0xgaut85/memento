"use client";

import { PageWrapper } from "@/components/layout/page-wrapper";
import { motion } from "framer-motion";
import { Coins, TrendingUp, Shield, Clock } from "lucide-react";
import Image from "next/image";

const stablecoins = [
  { name: "USDC", logo: "/cryptologo/USDC.png", color: "#2775CA" },
  { name: "USDT", logo: "/cryptologo/USDT.png", color: "#26A17B" },
  { name: "DAI", logo: "/cryptologo/DAI.png", color: "#F5AC37" },
  { name: "USDS", logo: "/cryptologo/USDS.png", color: "#1BAC6B" },
];

const features = [
  {
    icon: TrendingUp,
    title: "Optimized Yields",
    description: "AI-driven strategies to maximize your stablecoin returns.",
  },
  {
    icon: Shield,
    title: "Risk-Adjusted",
    description: "Multiple vault tiers from conservative to aggressive.",
  },
  {
    icon: Clock,
    title: "Flexible Terms",
    description: "No lock-ups. Withdraw your stablecoins anytime.",
  },
];

export default function StakePage() {
  return (
    <PageWrapper>
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="w-16 h-16 mx-auto mb-8 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center"
          >
            <Coins className="w-8 h-8 text-primary" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter mb-4"
          >
            Stablecoin
            <br />
            <span className="font-serif italic font-normal text-foreground/40">Staking</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl text-foreground/60 mb-10 font-serif italic"
          >
            Put your stablecoins to work with AI-optimized yield strategies
          </motion.p>

          {/* Stablecoin logos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-4 mb-12"
          >
            {stablecoins.map((coin, i) => (
              <motion.div
                key={coin.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="relative group"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 relative rounded-full overflow-hidden border-2 border-gray-100 bg-white shadow-sm group-hover:border-primary/30 transition-colors">
                  <Image
                    src={coin.logo}
                    alt={coin.name}
                    fill
                    className="object-cover p-1"
                  />
                </div>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono text-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  {coin.name}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Coming Soon Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-8 sm:p-10 mb-10 shadow-sm max-w-xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-sm font-semibold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Coming Soon
            </div>

            <h3 className="text-xl font-semibold mb-3">
              Earn yield on your stablecoins
            </h3>
            <p className="text-foreground/60 text-sm leading-relaxed mb-6">
              Deposit USDC, USDT, DAI, or USDS into our AI-managed vaults. 
              Our strategies automatically allocate across the best opportunities 
              to maximize your returns while managing risk.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {features.map((feature, i) => (
                <div key={feature.title} className="flex flex-col gap-2 p-4 bg-gray-50/50">
                  <feature.icon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">{feature.title}</span>
                  <span className="text-xs text-foreground/50">{feature.description}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-foreground/40"
          >
            Join the waitlist for early access
          </motion.p>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
