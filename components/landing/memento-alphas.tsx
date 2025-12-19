"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ComingSoonDialog, useComingSoon } from "@/components/landing/coming-soon-dialog";
import { useRef } from "react";
import { GlitchImage } from "@/components/ui/glitch-image";
import { GlitchText } from "@/components/ui/glitch-text";
import { AnimatedCounter } from "@/components/ui/animated-counter";

export function MementoAlphas() {
  const { open, setOpen, showComingSoon } = useComingSoon();
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const textY = useTransform(scrollYProgress, [0, 0.5], [60, 0]);
  
  // Image zoom out effect on scroll
  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1.1, 1]);
  const contentX = useTransform(scrollYProgress, [0, 0.5], [30, 0]);

  return (
    <>
      <section ref={containerRef} className="relative lg:min-h-screen overflow-hidden bg-white">

        <div className="relative z-10 lg:min-h-screen flex flex-col lg:flex-row">
          {/* Left: Image - takes half the screen on desktop, shows on top on mobile */}
          <div 
            className="w-full lg:w-1/2 relative h-[30vh] lg:h-auto lg:min-h-screen overflow-hidden flex items-end justify-center bg-white"
            style={{ transform: 'scaleX(-1)' }}
          >
            <motion.div
              className="w-full h-full absolute inset-0"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ scale: imageScale, transformOrigin: 'bottom center' }}
            >
              <GlitchImage 
                src="/lepenseur.png"
                alt="Le Penseur"
                fill
                className="object-contain object-bottom scale-100 lg:scale-[1.7] origin-bottom"
                unoptimized
                containerClassName="w-full h-full"
                intensity="strong"
                disableOnMobile
              />
            </motion.div>
          </div>

          {/* Right: Content */}
          <div className="w-full lg:w-1/2 flex items-center px-6 md:px-12 lg:px-16 py-8 sm:py-10 lg:py-20">
            <motion.div 
              style={{ y: textY, x: contentX }}
              className="relative z-10 max-w-lg"
            >
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-serif italic text-purple-600 text-base sm:text-lg mb-3"
              >
                exclusive intelligence
              </motion.p>
              
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-6 lg:mb-8"
              >
                <GlitchText>Memento</GlitchText><br/>
                <span className="font-serif italic font-normal text-black/30">Alphas</span>
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="text-lg md:text-xl text-black/40 max-w-md leading-relaxed mb-10"
              >
                Bi-weekly high-conviction yield strategies from our financial analysts team.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mb-10 border-l border-black/10 pl-6"
              >
                <AnimatedCounter value={0.1} suffix="%" className="text-5xl md:text-6xl font-mono font-semibold text-black" />
                <span className="text-base text-black/30 font-mono ml-2">of $MM supply</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
              >
                <button 
                  className="group bg-black text-white text-base px-8 py-4 font-semibold transition-all duration-300 hover:bg-black/90 flex items-center gap-2"
                  onClick={showComingSoon}
                >
                  Get Access
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      <ComingSoonDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
