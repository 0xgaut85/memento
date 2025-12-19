"use client";

import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ComingSoonDialog, useComingSoon } from "@/components/landing/coming-soon-dialog";
import { GlitchText } from "@/components/ui/glitch-text";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { useRef, useState } from "react";
import Image from "next/image";

const platforms = [
  { name: "Solana", logo: "/cryptologo/solana.jpg" },
  { name: "Ethereum", logo: "/cryptologo/ethereum.jpg" },
  { name: "Base", logo: "/cryptologo/base.jpg" },
  { name: "Jupiter", logo: "/cryptologo/jupiter.jpg" },
  { name: "Aave", logo: "/cryptologo/aave.png" },
  { name: "Uniswap", logo: "/cryptologo/uniswap.jpg" },
  { name: "Raydium", logo: "/cryptologo/raydium.jpg" },
  { name: "Marinade", logo: "/cryptologo/Marinade.jpg" },
  { name: "Kamino", logo: "/cryptologo/Kamino.jpg" },
  { name: "Orca", logo: "/cryptologo/Orca.jpg" },
  { name: "Curve", logo: "/cryptologo/Curve.jpg" },
  { name: "Ethena", logo: "/cryptologo/Ethena.png" },
  { name: "Fluid", logo: "/cryptologo/Fluid.png" },
  { name: "Maple", logo: "/cryptologo/Maple.jpg" },
  { name: "Morpho", logo: "/cryptologo/Morpho.jpg" },
  { name: "Sky", logo: "/cryptologo/Sky.jpg" },
  { name: "Spark", logo: "/cryptologo/Spark.jpg" },
];

export function YieldAggregator() {
  const { open, setOpen, showComingSoon } = useComingSoon();
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const textY = useTransform(scrollYProgress, [0, 0.4], [60, 0]);
  
  // Carousel wheel to vertical effect
  const carouselScale = useTransform(scrollYProgress, [0, 0.4, 0.7], [1.4, 1.15, 1]);
  const carouselRotateX = useTransform(scrollYProgress, [0, 0.4, 0.7], [45, 15, 0]);
  const carouselPerspective = useTransform(scrollYProgress, [0, 0.7], [1000, 1500]);
  const [animationDuration, setAnimationDuration] = useState(18);
  
  // Update animation speed based on scroll
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Map scroll progress to duration: moderate (18s) at start, slow (50s) at end
    const newDuration = 18 + (latest * 32);
    setAnimationDuration(newDuration);
  });

  return (
    <>
      <section ref={containerRef} className="relative lg:min-h-screen flex flex-col lg:flex-row">
        {/* Left: Content - Black background */}
        <div className="w-full lg:w-1/2 bg-black text-white relative overflow-hidden">
          {/* Fine grain - very subtle */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='turbulence' baseFrequency='4' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
              backgroundSize: '150px 150px',
            }}
          />

          <div className="relative z-10 flex items-center px-6 sm:px-8 md:px-16 lg:px-20 py-10 sm:py-12 lg:py-20">
            <motion.div 
              style={{ y: textY }}
              className="w-full"
            >
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-serif italic text-purple-400 text-base sm:text-lg mb-3"
              >
                powered by memento AI
              </motion.p>
              
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.9] mb-6 lg:mb-10"
              >
                <GlitchText>Yield</GlitchText><br/>
                <span className="font-serif italic font-normal text-white/30">Aggregator</span>
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/40 leading-relaxed mb-8 lg:mb-12"
              >
                Daily curated feed of the best farming opportunities across all chains. Stake, lend, farm directly.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mb-10 border-l border-white/15 pl-6"
              >
                <AnimatedCounter value={0.05} suffix="%" className="text-5xl md:text-6xl font-mono font-semibold text-white" />
                <span className="text-base text-white/30 font-mono ml-2">of $MM supply</span>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
                className="flex gap-6 sm:gap-8 md:gap-12 mb-8 lg:mb-12"
              >
                <div className="border-l border-white/15 pl-4 sm:pl-6">
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono font-semibold">24/7</div>
                  <div className="text-xs sm:text-sm font-mono uppercase text-white/30 tracking-wider">Analysis</div>
                </div>
                <div className="border-l border-white/15 pl-4 sm:pl-6">
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono font-semibold">Daily</div>
                  <div className="text-xs sm:text-sm font-mono uppercase text-white/30 tracking-wider">Updates</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
              >
                <button 
                  className="bg-white text-black hover:bg-white/95 text-base sm:text-lg md:text-xl px-6 sm:px-8 md:px-10 py-4 md:py-5 font-semibold transition-all duration-300"
                  onClick={showComingSoon}
                >
                  Launch Aggregator
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Right: Scrolling Carousel - White background */}
        <div className="w-full lg:w-1/2 bg-white relative min-h-[30vh] lg:min-h-screen overflow-hidden flex items-center justify-center">
          {/* Fine grain - very subtle */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-10 z-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='turbulence' baseFrequency='4' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
              backgroundSize: '150px 150px',
            }}
          />

          {/* Gradient overlays for fade effect */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white to-transparent z-20" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent z-20" />

          {/* Single column carousel with 3D wheel effect */}
          <motion.div 
            className="absolute inset-0 flex justify-center items-center overflow-hidden"
            style={{ perspective: carouselPerspective }}
          >
            <motion.div 
              className="w-full h-full flex justify-center"
              style={{ 
                scale: carouselScale,
                rotateX: carouselRotateX,
                transformStyle: "preserve-3d"
              }}
            >
              <motion.div
                className="flex flex-col gap-4 py-40"
                animate={{ y: [0, -2000] }}
                transition={{
                  y: {
                    duration: animationDuration,
                    repeat: Infinity,
                    ease: "linear",
                  },
                }}
              >
              {[...platforms, ...platforms, ...platforms].map((platform, i) => (
                <div
                  key={`platform-${i}`}
                  className="flex items-center gap-3 sm:gap-4 md:gap-6 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 bg-black/[0.02] border border-black/5 mx-4 sm:mx-6 md:mx-8"
                >
                  <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 relative rounded-lg md:rounded-xl overflow-hidden flex-shrink-0 border border-black/5">
                    <Image
                      src={platform.logo}
                      alt={platform.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-black">{platform.name}</span>
                </div>
              ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      <ComingSoonDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
