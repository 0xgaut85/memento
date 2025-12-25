"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Zap, TrendingUp, Bot } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const features = [
  {
    icon: Bot,
    title: "AI-Curated Yields",
    description: "Our AI agents scan 100+ protocols 24/7 to surface the best opportunities.",
  },
  {
    icon: Shield,
    title: "Risk Filtering",
    description: "Toggle between Safe and Degen modes based on your risk appetite.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time APY",
    description: "Live data from DeFiLlama with accurate, up-to-the-minute yields.",
  },
  {
    icon: Zap,
    title: "x402 Payments",
    description: "Pay-per-access with USDC. No subscriptions, no commitments.",
  },
];

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const videoOpacity = useTransform(scrollYProgress, [0, 0.8], [0.6, 0.2]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section with Video Background */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ scale: videoScale }}
        >
          <motion.div style={{ opacity: videoOpacity }} className="w-full h-full">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/blossom2.mp4" type="video/mp4" />
            </video>
          </motion.div>
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        </motion.div>

        {/* Hero Content */}
        <motion.div 
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
          style={{ y: textY }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <Image
              src="/transparentlogo.png"
              alt="Memento"
              width={80}
              height={80}
              className="w-20 h-20 mx-auto mb-8 invert"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] mb-6"
          >
            Yield
            <br />
            <span className="font-serif italic font-normal text-white/40">Aggregator</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg sm:text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-10 font-serif italic"
          >
            AI-curated DeFi opportunities across all chains. 
            Find the best yields, filtered by risk, updated daily.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/aggregator">
              <motion.button
                className="group relative overflow-hidden px-10 py-5 bg-white text-black font-semibold text-lg transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Launch Aggregator
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-[#a855f7]"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>
          </motion.div>

          {/* Price Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-[#a855f7]" />
            <span className="text-sm text-white/60">
              <span className="font-semibold text-white">$5 USDC</span> for 24h premium access
            </span>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
          >
            <motion.div className="w-1 h-2 bg-white/60 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 lg:py-32 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-24"
          >
            <p className="font-serif italic text-[#a855f7] text-lg mb-4">why memento</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter">
              DeFi Intelligence,
              <br />
              <span className="text-white/30">Simplified</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-8 bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300"
              >
                <div className="w-12 h-12 mb-6 bg-white/5 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-[#a855f7]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#a855f7]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-24 bg-white text-black overflow-hidden">
        {/* Subtle grain texture */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='turbulence' baseFrequency='4' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
            backgroundSize: '150px 150px',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-3">100+</div>
              <div className="text-sm font-mono uppercase text-black/40 tracking-wider">Protocols Tracked</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-3 text-[#a855f7]">24/7</div>
              <div className="text-sm font-mono uppercase text-black/40 tracking-wider">AI Analysis</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-3">Daily</div>
              <div className="text-sm font-mono uppercase text-black/40 tracking-wider">Curated Updates</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 lg:py-32 bg-black">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter mb-6">
              Ready to find
              <br />
              <span className="font-serif italic font-normal text-white/40">better yields?</span>
            </h2>
            <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto">
              Pay $5 USDC for 24 hours of premium access. No subscriptions, no commitments.
            </p>
            <Link href="/aggregator">
              <motion.button
                className="group relative overflow-hidden px-12 py-6 bg-white text-black font-semibold text-lg transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-[#a855f7]"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/transparentlogo.png"
              alt="Memento"
              width={24}
              height={24}
              className="w-6 h-6 invert"
            />
            <span className="font-serif text-sm text-white/40">memento</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <a href="https://memento.money" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Main Site
            </a>
            <span>•</span>
            <span>Powered by x402</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
