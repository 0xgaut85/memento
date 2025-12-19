"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ComingSoonDialog, useComingSoon } from "@/components/landing/coming-soon-dialog";
import { GlitchImage } from "@/components/ui/glitch-image";
import { GlitchText } from "@/components/ui/glitch-text";
import { TypingText } from "@/components/ui/typing-text";
import { AnimatedRange } from "@/components/ui/animated-counter";
import { useRef } from "react";

export function Hero() {
  const { open, setOpen, showComingSoon } = useComingSoon();
  const ref = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  // Parallax and zoom effects - NO background changes
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  
  // Image zoom out effect on scroll
  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1.15, 1]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <section ref={ref} className="relative overflow-hidden min-h-screen">
      {/* Background - Pure white */}
      <div className="absolute inset-0 bg-white" />

      <div className="relative z-10 flex flex-col lg:flex-row w-full min-h-screen pt-20 md:pt-24">
        {/* Left Side: Text Content */}
        <motion.div 
          className="flex-1 lg:w-1/2 flex items-center justify-center px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-10 lg:py-0"
          style={{ y: textY, opacity: textOpacity }}
        >
          <div className="max-w-3xl w-full space-y-4 sm:space-y-6 md:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-1 sm:space-y-2 md:space-y-3"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black tracking-tighter leading-[1.05]">
                <GlitchText>Put your USDC to work</GlitchText>
              </h1>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black tracking-tighter text-primary leading-[1.1]">
                safely, simply, privately, on Solana
              </h2>
            </motion.div>
            
            <div className="min-h-[60px] sm:min-h-[80px] md:min-h-[100px] lg:min-h-[120px] flex items-start">
              <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-serif italic text-foreground/80 leading-tight">
                <TypingText 
                  text="You didn't survive 2 cycles to earn 3%."
                  delay={1500}
                  speed={60}
                />
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 4.3 }}
              className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-1 sm:pt-2"
            >
              <motion.button
                onClick={showComingSoon}
                className="group relative overflow-hidden w-full sm:w-auto text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-black text-white font-semibold transition-all duration-300"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start earning
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-0.5 transition-transform duration-300" />
                </span>
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 4.5 }}
              className="text-sm text-black/50 font-mono pt-1"
            >
              <p>Target yields: <AnimatedRange min={10} max={15} suffix="% APY*" className="font-semibold text-black" /></p>
            </motion.div>

            {/* Mobile Marble Face - shows below target yields on mobile only */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4.6 }}
              className="lg:hidden relative w-full h-[35vh] mt-4 bg-white"
            >
              <GlitchImage 
                src="/marbleface.png"
                alt="Memento Statue"
                fill
                className="object-contain"
                unoptimized
                containerClassName="w-full h-full"
                intensity="strong"
                disableOnMobile
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side: Marble Face - Desktop only */}
        <div className="hidden lg:flex lg:w-1/2 relative lg:min-h-full overflow-hidden items-center justify-center bg-white">
          <motion.div 
            className="w-full h-full"
            style={{ scale: imageScale, y: imageY }}
          >
            <GlitchImage 
              src="/marbleface.png"
              alt="Memento Statue"
              fill
              className="object-contain"
              unoptimized
              containerClassName="w-full h-full"
              intensity="strong"
              disableOnMobile
            />
          </motion.div>
        </div>
      </div>
      <ComingSoonDialog open={open} onOpenChange={setOpen} />
    </section>
  );
}
