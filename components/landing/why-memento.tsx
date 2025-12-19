"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Container, Section } from "@/components/ui/container";
import { GlitchText } from "@/components/ui/glitch-text";
import { useRef, useState, useEffect } from "react";

const cyclingWords = [
  "degens",
  "your mom",
  "normies",
  "chads",
  "your dad",
  "apes",
  "believers",
  "your wife's boyfriend",
  "traders",
  "diamond hands",
  "survivors",
  "anons",
  "lunatics",
  "winners",
  "your grandma",
  "builders",
  "CT legends",
  "holders",
  "the boys",
];

const problems = [
  {
    title: "On-chain Yield",
    description: "Often low, fragmented, or dependent on inflationary token emissions.",
  },
  {
    title: "TradFi Yield",
    description: "Locked behind paperwork, minimums, slow rails, and accredited status.",
  },
];

export function WhyMemento() {
  const containerRef = useRef(null);
  const [wordIndex, setWordIndex] = useState(0);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const titleScale = useTransform(scrollYProgress, [0, 0.3], [0.8, 1]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  
  // Glass container scale effect
  const containerScale = useTransform(scrollYProgress, [0, 0.3, 0.7], [0.95, 1, 0.98]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % cyclingWords.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Section ref={containerRef} className="relative overflow-hidden">
      {/* Sticky container */}
      <div className="sticky top-0 min-h-[70vh] lg:min-h-screen flex items-center py-8 sm:py-10 md:py-16 lg:py-20">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/blossom2.mp4" type="video/mp4" />
          </video>
        </div>
        
        {/* Fine grain - very subtle */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.12] z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='turbulence' baseFrequency='4' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
            backgroundSize: '150px 150px',
          }}
        />

        <Container className="relative z-20">
          {/* White glass container */}
          <motion.div 
            className="backdrop-blur-xl bg-white/80 p-4 sm:p-6 md:p-10 lg:p-16"
            style={{ scale: containerScale }}
          >
            <motion.div
              style={{ scale: titleScale, opacity: titleOpacity }}
              className="mb-8 sm:mb-10 md:mb-12 lg:mb-16"
            >
              <p className="font-serif italic text-purple-600 text-base sm:text-lg mb-3">the problem</p>
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.9]">
                <GlitchText>Why Memento?</GlitchText>
              </h2>
            </motion.div>

            <div className="max-w-3xl space-y-6 sm:space-y-8">
              {problems.map((problem, index) => (
                <motion.div
                  key={problem.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="group"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span className="text-black/20 text-base sm:text-lg mt-1">•</span>
                    <div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-1 sm:mb-2 tracking-tight text-black">
                        {problem.title}
                      </h3>
                      <p className="text-base sm:text-lg md:text-xl text-black/40 leading-relaxed">
                        {problem.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Solution */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-black/5"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <span className="text-black text-base sm:text-lg mt-1">→</span>
                  <div>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3 tracking-tighter text-black">
                      Memento
                    </h3>
                    <p className="text-lg sm:text-xl md:text-2xl text-black/50 leading-relaxed">
                      Better yield. Real strategies. Clean UX.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Built for cycling text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 sm:mt-12 md:mt-16 lg:mt-20"
            >
              <h3 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter text-black">
                Built for{" "}
                <span className="inline-block min-w-[140px] sm:min-w-[180px] md:min-w-[250px] lg:min-w-[300px]">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={wordIndex}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.25 }}
                      className={`inline-block font-serif italic ${wordIndex % 2 === 0 ? 'text-purple-500' : 'text-pink-300'}`}
                    >
                      {cyclingWords[wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </h3>
            </motion.div>
          </motion.div>
        </Container>
      </div>
    </Section>
  );
}
