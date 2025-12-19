"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { GlitchText } from "@/components/ui/glitch-text";
import { AnimatedRange } from "@/components/ui/animated-counter";
import { useRef } from "react";

const vaults = [
  {
    id: "01",
    title: "Dividend Delta-Neutral",
    description: "Capture high-dividend equity yields while neutralizing price exposure through systematic hedging.",
    apyMin: 10,
    apyMax: 12,
  },
  {
    id: "02",
    title: "Basis & Funding Arbitrage",
    description: "Extract yield from perpetual funding rates and futures basis spreads.",
    apyMin: 8,
    apyMax: 10,
  },
  {
    id: "03",
    title: "REITs / Income",
    description: "Tokenized real estate exposure delivering steady rental yields and property appreciation.",
    apyMin: 12,
    apyMax: 14,
  },
  {
    id: "04",
    title: "RWA Cashflow",
    description: "Direct ownership in high-margin businesses. Laundromats, car washes, ATM routes, vending machines.",
    apyMin: 15,
    apyMax: 20,
  },
];

export function Vaults() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const titleX = useTransform(scrollYProgress, [0, 0.3], [-50, 0]);
  
  // Image zoom in effect on scroll
  const imageScale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [20, 0]);

  return (
    <section ref={containerRef} className="relative bg-white py-16 lg:py-20 mb-16 lg:mb-24 overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center">
        
        {/* Left: Content */}
        <motion.div 
          className="w-full lg:w-[45%] xl:w-[40%] px-6 sm:px-8 md:px-12 lg:pl-16 xl:pl-24 2xl:pl-32 lg:pr-8"
          style={{ y: contentY }}
        >
          {/* Title */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ x: titleX }}
            className="mb-8 lg:mb-10"
          >
            <p className="font-serif italic text-purple-600 text-base sm:text-lg mb-3">our strategies</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter leading-[0.9] mb-4">
              <GlitchText>The Vaults</GlitchText>
            </h2>
            <p className="text-base lg:text-lg text-black/50 max-w-md">
              Focused set of strategies. Each one capacity-limited to keep execution tight.
            </p>
          </motion.div>

{/* Vault cards */}
            <div className="space-y-1">
              {vaults.map((vault, i) => (
                <motion.div
                  key={vault.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="group relative border-b border-black/5 hover:border-black/10 py-5 cursor-pointer transition-colors duration-300"
                >
                  {/* Subtle hover background */}
                  <div className="absolute -inset-x-4 -inset-y-1 bg-black/[0.02] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                  
                  <div className="flex items-start gap-4">
                    <span className="text-[11px] font-mono text-black/25 pt-1 group-hover:text-black/40 transition-colors duration-300">
                      {vault.id}
                    </span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base lg:text-lg font-semibold tracking-tight group-hover:text-black transition-colors duration-300">
                          {vault.title}
                        </h3>
                      </div>
                      <p className="text-black/40 text-sm leading-relaxed group-hover:text-black/50 transition-colors duration-300">{vault.description}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] font-mono text-black/30 uppercase tracking-wider">APY</div>
                        <AnimatedRange 
                          min={vault.apyMin} 
                          max={vault.apyMax} 
                          suffix="%" 
                          className="text-base lg:text-lg font-mono font-semibold text-black"
                        />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-black/15 group-hover:text-black/40 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

          <p className="text-xs text-black/30 font-mono mt-6">*Targets are not guarantees.</p>
        </motion.div>

        {/* Right: Image - touches right edge, bigger than content */}
        <div className="hidden lg:block lg:w-[55%] xl:w-[60%] relative overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[600px] xl:h-[700px] overflow-hidden"
            style={{ scale: imageScale }}
          >
            <Image 
              src="/vaultwhite.png" 
              alt="Memento Vault" 
              fill
              className="object-contain object-right"
              unoptimized
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
