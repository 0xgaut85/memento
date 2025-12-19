"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import Image from "next/image";
import { Twitter, Send } from "lucide-react";
import { ComingSoonDialog, useComingSoon } from "@/components/landing/coming-soon-dialog";
import { GlitchText } from "@/components/ui/glitch-text";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function FooterCTA() {
  const { open, setOpen, showComingSoon } = useComingSoon();
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const titleScale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <>
      <section ref={containerRef} className="relative min-h-[70vh] lg:min-h-screen overflow-hidden bg-black text-white">
        {/* Background Image - para.png */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/para.png"
            alt="Background"
            fill
            className="object-cover object-top"
            unoptimized
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Fine grain - subtle */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20 z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='turbulence' baseFrequency='4' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
            backgroundSize: '150px 150px',
          }}
        />

        <Container className="relative z-20 py-10 sm:py-12 md:py-20 lg:py-28 min-h-[70vh] lg:min-h-screen flex items-center">
          <motion.div
            style={{ scale: titleScale, opacity: titleOpacity }}
            className="max-w-4xl mx-auto text-center w-full px-2"
          >
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-serif italic text-white/50 text-sm sm:text-base mb-3 sm:mb-4"
            >
              you didn't survive 2 cycles
            </motion.p>
            
            <motion.h2 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.9] mb-6 sm:mb-8"
            >
              <GlitchText>to earn 3%</GlitchText>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-white/50 max-w-xl mx-auto mb-8 sm:mb-10 font-serif italic"
            >
              Tired of low yields? Allergic to sketchy products?<br/>
              Memento is for you.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
              className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4"
            >
              <motion.button 
                className="bg-white text-black text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 font-semibold transition-all duration-300 hover:bg-white/95"
                onClick={showComingSoon}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Launch App
              </motion.button>
              <motion.button 
                className="border border-white/20 text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 font-semibold bg-transparent hover:bg-white/5 transition-all duration-300"
                onClick={showComingSoon}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Read Whitepaper
              </motion.button>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="relative py-10 sm:py-12 md:py-16 lg:py-24 bg-white">
        {/* Fine grain - very subtle */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='turbulence' baseFrequency='4' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
            backgroundSize: '150px 150px',
          }}
        />
        
        <Container className="relative z-10">
          {/* Main footer grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-12 gap-8 sm:gap-10 md:gap-8 mb-10 sm:mb-12 md:mb-16">
            {/* Brand column */}
            <div className="col-span-2 sm:col-span-2 md:col-span-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 relative">
                  <Image 
                    src="/transparentlogo.png" 
                    alt="Memento Logo" 
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <span className="font-serif text-xl sm:text-2xl font-bold text-black">memento.money</span>
              </div>
              <p className="text-black/50 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 max-w-xs">
                Premium yield strategies for USDC on Solana. Built for multi-cycle cockroaches.
              </p>
              <div className="flex gap-3">
                <Link 
                  href="https://x.com/mementodotmoney" 
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-black/10 flex items-center justify-center text-black/50 hover:text-black hover:border-black/30 transition-all" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
                <Link 
                  href="#" 
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-black/10 flex items-center justify-center text-black/50 hover:text-black hover:border-black/30 transition-all"
                >
                  <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
              </div>
            </div>

            {/* Navigation columns */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="font-bold text-black text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4">Product</h4>
              <ul className="space-y-2 sm:space-y-3">
                <li><Link href="#" onClick={(e) => { e.preventDefault(); showComingSoon(); }} className="text-black/50 hover:text-black text-xs sm:text-sm transition-colors">Vaults</Link></li>
                <li><Link href="#" onClick={(e) => { e.preventDefault(); showComingSoon(); }} className="text-black/50 hover:text-black text-xs sm:text-sm transition-colors">Alphas</Link></li>
                <li><Link href="#" onClick={(e) => { e.preventDefault(); showComingSoon(); }} className="text-black/50 hover:text-black text-xs sm:text-sm transition-colors">Aggregator</Link></li>
              </ul>
            </div>

            <div className="col-span-1 md:col-span-2">
              <h4 className="font-bold text-black text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4">Resources</h4>
              <ul className="space-y-2 sm:space-y-3">
                <li><Link href="#" onClick={(e) => { e.preventDefault(); showComingSoon(); }} className="text-black/50 hover:text-black text-xs sm:text-sm transition-colors">Documentation</Link></li>
                <li><Link href="#" onClick={(e) => { e.preventDefault(); showComingSoon(); }} className="text-black/50 hover:text-black text-xs sm:text-sm transition-colors">Whitepaper</Link></li>
                <li><Link href="#" onClick={(e) => { e.preventDefault(); showComingSoon(); }} className="text-black/50 hover:text-black text-xs sm:text-sm transition-colors">FAQs</Link></li>
              </ul>
            </div>

            <div className="col-span-1 md:col-span-2">
              <h4 className="font-bold text-black text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4">Legal</h4>
              <ul className="space-y-2 sm:space-y-3">
                <li><Link href="/terms" className="text-black/50 hover:text-black text-xs sm:text-sm transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-black/50 hover:text-black text-xs sm:text-sm transition-colors">Privacy Policy</Link></li>
                <li><Link href="/risk" className="text-black/50 hover:text-black text-xs sm:text-sm transition-colors">Risk Disclosure</Link></li>
              </ul>
            </div>

            <div className="col-span-1 md:col-span-2">
              <h4 className="font-bold text-black text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4">Connect</h4>
              <ul className="space-y-2 sm:space-y-3">
                <li><Link href="https://x.com/mementodotmoney" target="_blank" rel="noopener noreferrer" className="text-black/50 hover:text-black text-xs sm:text-sm transition-colors">Twitter / X</Link></li>
                <li><Link href="#" className="text-black/50 hover:text-black text-xs sm:text-sm transition-colors">Telegram</Link></li>
                <li><Link href="#" className="text-black/50 hover:text-black text-xs sm:text-sm transition-colors">Discord</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-black/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-black/30 font-mono">
                © 2025 Memento. All rights reserved.
              </p>
              
              <p className="text-xs text-black/30 text-center md:text-right max-w-2xl leading-relaxed">
                Memento is a decentralized protocol. Past performance is not indicative of future results. 
                Cryptocurrency investments involve substantial risk. Target yields are estimates, not guarantees.
              </p>
            </div>
          </div>
        </Container>
      </footer>
      <ComingSoonDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
