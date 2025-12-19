"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { GlitchImage } from "@/components/ui/glitch-image";
import { GlitchText } from "@/components/ui/glitch-text";
import { AnimatedCounter } from "@/components/ui/animated-counter";

export function FeesToken() {
  const containerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Image animation - slides from left to right position and unzooms
  const imageX = useTransform(scrollYProgress, [0.1, 0.4], ["-20%", "0%"]);
  const imageScale = useTransform(scrollYProgress, [0.1, 0.4], [1.2, 1]);

  // Content Y movement
  const textY = useTransform(scrollYProgress, [0, 0.4], [40, 0]);

  // Reduced motion: simple static layout
  if (prefersReducedMotion) {
    return (
      <section className="relative flex flex-col lg:flex-row bg-white">
        <div className="w-full lg:w-1/2 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-10 sm:py-12 lg:py-20">
          <p className="font-serif italic text-purple-600 text-base sm:text-lg mb-3">simple & aligned</p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-8 lg:mb-10">
            <GlitchText>Fees</GlitchText>
          </h2>
          <div className="space-y-3 sm:space-y-4 mb-8 lg:mb-10">
            <div className="flex items-baseline gap-3 sm:gap-4">
              <span className="text-4xl sm:text-5xl md:text-6xl font-mono font-semibold text-black">1.5%</span>
              <span className="text-lg sm:text-xl md:text-2xl text-black/25 font-serif italic">in</span>
            </div>
            <div className="flex items-baseline gap-3 sm:gap-4">
              <span className="text-4xl sm:text-5xl md:text-6xl font-mono font-semibold text-black">1.5%</span>
              <span className="text-lg sm:text-xl md:text-2xl text-black/25 font-serif italic">out</span>
            </div>
            <p className="text-black/25 font-mono text-xs sm:text-sm">(USDC)</p>
          </div>
          <div className="border-t border-black/5 pt-6 lg:pt-8 mb-10 lg:mb-14">
            <p className="font-semibold text-base sm:text-lg mb-4 sm:mb-6">Aligned Incentives</p>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-xl sm:text-2xl md:text-3xl font-mono text-black/25">50%</span>
                <span className="text-sm sm:text-base md:text-lg text-black/40">Operations & growth</span>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-xl sm:text-2xl md:text-3xl font-mono text-black">50%</span>
                <span className="text-sm sm:text-base md:text-lg font-semibold">Buyback & burn $MM</span>
              </div>
            </div>
          </div>
          <p className="font-serif italic text-black/40 text-base sm:text-lg mb-2 sm:mb-3">the token</p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-4 sm:mb-6">
            <GlitchText>$MM</GlitchText>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-black/40 font-serif italic mb-6 sm:mb-8">The heartbeat of the Memento ecosystem.</p>
          <div className="space-y-4">
            <div className="border-l border-black/10 pl-4 sm:pl-6">
              <h3 className="font-semibold text-base sm:text-lg mb-1">Governance</h3>
              <p className="text-black/40 text-sm sm:text-base">Vote on new vault strategies</p>
            </div>
            <div className="border-l border-black/10 pl-4 sm:pl-6">
              <h3 className="font-semibold text-base sm:text-lg mb-1">Deflationary</h3>
              <p className="text-black/40 text-sm sm:text-base">Supply reduces with platform success</p>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex lg:w-1/2 relative min-h-[500px]">
          <GlitchImage
            src="/gora.png"
            alt="Gora"
            fill
            className="object-contain"
            unoptimized
            containerClassName="w-full h-full"
            intensity="strong"
            disableOnMobile
          />
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="relative bg-white overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:min-h-screen">
        {/* Left: Content */}
        <div className="w-full lg:w-1/2 relative z-10">
          <div className="px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-10 sm:py-12 lg:py-20">
            <motion.div 
              style={{ y: textY }}
              className="w-full"
            >
              {/* Fees Section */}
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-serif italic text-purple-600 text-base sm:text-lg mb-3"
              >
                simple & aligned
              </motion.p>
              
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.9] mb-6 lg:mb-10"
              >
                <GlitchText>Fees</GlitchText>
              </motion.h2>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="space-y-3 sm:space-y-4 mb-6 lg:mb-10"
              >
                <div className="flex items-baseline gap-3 sm:gap-4">
                  <AnimatedCounter value={1.5} suffix="%" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-mono font-semibold text-black" />
                  <span className="text-lg sm:text-xl md:text-2xl text-black/25 font-serif italic">in</span>
                </div>
                <div className="flex items-baseline gap-3 sm:gap-4">
                  <AnimatedCounter value={1.5} suffix="%" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-mono font-semibold text-black" />
                  <span className="text-lg sm:text-xl md:text-2xl text-black/25 font-serif italic">out</span>
                </div>
                <p className="text-black/25 font-mono text-xs sm:text-sm">(USDC)</p>
              </motion.div>

              <motion.div 
                className="border-t border-black/5 pt-6 lg:pt-8 mb-10 lg:mb-14"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <p className="font-semibold tracking-tight text-base sm:text-lg mb-4 sm:mb-6">Aligned Incentives</p>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <AnimatedCounter value={50} suffix="%" className="text-xl sm:text-2xl md:text-3xl font-mono text-black/25" />
                    <span className="text-sm sm:text-base md:text-lg text-black/40">Operations & growth</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <AnimatedCounter value={50} suffix="%" className="text-xl sm:text-2xl md:text-3xl font-mono text-black" />
                    <span className="text-sm sm:text-base md:text-lg font-semibold">Buyback & burn $MM</span>
                  </div>
                </div>
              </motion.div>

              {/* Token Section */}
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-serif italic text-black/40 text-base sm:text-lg mb-2 sm:mb-3"
              >
                the token
              </motion.p>
              
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.9] mb-4 sm:mb-6"
              >
                <GlitchText>$MM</GlitchText>
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="text-base sm:text-lg md:text-xl lg:text-2xl text-black/40 font-serif italic leading-relaxed mb-6 sm:mb-8"
              >
                The heartbeat of the Memento ecosystem.
              </motion.p>

              <div className="space-y-4">
                <motion.div 
                  className="border-l border-black/10 pl-4 sm:pl-6"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="font-semibold text-base sm:text-lg tracking-tight mb-1">Governance</h3>
                  <p className="text-black/40 text-sm sm:text-base">Vote on new vault strategies</p>
                </motion.div>
                <motion.div 
                  className="border-l border-black/10 pl-4 sm:pl-6"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 }}
                >
                  <h3 className="font-semibold text-base sm:text-lg tracking-tight mb-1">Deflationary</h3>
                  <p className="text-black/40 text-sm sm:text-base">Supply reduces with platform success</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right: Image with scroll-based animation - Desktop only */}
        <motion.div 
          className="hidden lg:flex lg:w-1/2 relative min-h-[600px] xl:min-h-[700px]"
          style={{ 
            x: imageX,
            scale: imageScale,
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <GlitchImage
            src="/gora.png"
            alt="Gora"
            fill
            className="object-contain"
            unoptimized
            containerClassName="w-full h-full"
            intensity="strong"
            disableOnMobile
          />
        </motion.div>
      </div>
    </section>
  );
}
