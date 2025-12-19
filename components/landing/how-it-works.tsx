"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { GlitchText } from "@/components/ui/glitch-text";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Connect wallet",
    description: "Use a fresh Solana address for best privacy.",
  },
  {
    number: "02",
    title: "Sign once",
    description: "Your wallet accepts the exact terms, verifiable on-chain.",
  },
  {
    number: "03",
    title: "Deposit USDC",
    description: "Pick an Idea and your capital goes to work.",
  },
  {
    number: "04",
    title: "Track everything",
    description: "Dashboard built for stables: deposits, withdrawals, performance.",
  },
  {
    number: "05",
    title: "Withdraw anytime",
    description: "USDC back to your wallet.",
  },
];

export function HowItWorks() {
  const containerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Progress line animation
  const lineHeight = useTransform(scrollYProgress, [0.2, 0.8], ["0%", "100%"]);
  
  // Staggered card scale effects (subtle unzoom as they come into view)
  const getCardScale = (index: number) => {
    const start = 0.1 + (index * 0.08);
    const end = start + 0.15;
    return useTransform(scrollYProgress, [start, end], [1.08, 1]);
  };
  
  const getCardY = (index: number) => {
    const start = 0.1 + (index * 0.08);
    const end = start + 0.15;
    return useTransform(scrollYProgress, [start, end], [15, 0]);
  };

  // Pre-compute transforms
  const cardScales = steps.map((_, i) => getCardScale(i));
  const cardYs = steps.map((_, i) => getCardY(i));

  // Title zoom effect
  const titleScale = useTransform(scrollYProgress, [0, 0.3], [0.95, 1]);

  // If reduced motion, use simpler layout
  if (prefersReducedMotion) {
    return (
      <section className="relative bg-white text-black py-16 md:py-24 lg:py-32">
        <Container>
          <div className="mb-12">
            <p className="font-serif italic text-purple-600 text-lg mb-4">simple process</p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.9]">
              <GlitchText>How it works</GlitchText>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {steps.map((step) => (
              <div
                key={step.number}
                className="border-l border-black/10 pl-6 py-4"
              >
                <span className="text-4xl font-mono font-semibold text-black/10 block mb-3">
                  {step.number}
                </span>
                <h3 className="text-lg font-semibold mb-2 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-black/40 text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section 
      ref={containerRef} 
      className="relative bg-white text-black overflow-hidden py-10 sm:py-12 md:py-20 lg:py-28"
    >
      {/* Fine grain - very subtle */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='turbulence' baseFrequency='4' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px',
        }}
      />

      <Container className="relative z-10">
        {/* Title with scroll-based scale */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          style={{ scale: titleScale }}
          className="mb-8 sm:mb-12 md:mb-16 origin-left"
        >
          <p className="font-serif italic text-purple-600 text-base sm:text-lg mb-3 sm:mb-4">simple process</p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.9]">
            <GlitchText>How it works</GlitchText>
          </h2>
        </motion.div>

        {/* Hero step - Connect wallet (larger on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block mb-12"
        >
          <div className="flex items-baseline gap-6">
            <span className="text-6xl xl:text-7xl font-mono font-bold text-primary/20">01</span>
            <h3 className="text-3xl xl:text-4xl font-black tracking-tight">Connect wallet</h3>
          </div>
          <p className="text-lg xl:text-xl text-black/40 mt-2 ml-[100px] xl:ml-[120px]">Use a fresh Solana address for best privacy.</p>
        </motion.div>

        <div className="relative">
          {/* Animated progress line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-black/10 hidden lg:block">
            <motion.div 
              className="w-full bg-primary origin-top"
              style={{ height: lineHeight }}
            />
          </div>

          {/* Cards grid - show all on mobile, skip first on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 lg:pl-8">
            {steps.map((step, index) => {
              // On desktop, skip first step (shown as hero above)
              const isHeroStep = index === 0;
              
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    delay: index * 0.08, 
                    duration: 0.5,
                  }}
                  style={{
                    scale: cardScales[index],
                    y: cardYs[index],
                  }}
                  className={`group relative border-l border-black/10 hover:border-black/20 pl-4 sm:pl-6 py-3 sm:py-4 transition-colors duration-300 will-change-transform ${isHeroStep ? 'lg:hidden' : ''}`}
                >
                  <span className="text-3xl sm:text-4xl md:text-5xl font-mono font-semibold text-black/10 group-hover:text-black/15 transition-colors duration-300 block mb-2 sm:mb-3">
                    {step.number}
                  </span>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-black/40 text-xs sm:text-sm md:text-base group-hover:text-black/50 transition-colors duration-300">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
