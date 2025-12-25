"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Zap, TrendingUp, Coins, Bot } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const products = [
  {
    icon: TrendingUp,
    title: "Yield Aggregator",
    description: "AI-curated DeFi opportunities across 100+ protocols. Find the best yields, filtered by risk.",
    href: "/aggregator",
    status: "Live",
  },
  {
    icon: Coins,
    title: "Stablecoin Staking",
    description: "Put your stablecoins to work with AI-optimized yield strategies.",
    href: "/stake",
    status: "Coming Soon",
  },
  {
    icon: Bot,
    title: "Alpha Feed",
    description: "Real-time market intelligence and trading signals powered by AI.",
    href: "/alpha",
    status: "Coming Soon",
  },
];

const features = [
  {
    icon: Bot,
    title: "AI-Powered",
    description: "Our agents scan the market 24/7 to surface the best opportunities.",
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "Built-in risk filtering to match your investment appetite.",
  },
  {
    icon: Zap,
    title: "Instant Access",
    description: "Pay-per-use with x402. No subscriptions, no commitments.",
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
            Put your USDC
            <br />
            <span className="font-serif italic font-normal text-white/40">to work</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg sm:text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-10 font-serif italic"
          >
            AI-powered DeFi tools for the modern investor. 
            Safely, simply, privately, on Solana.
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
                  Explore Products
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

      {/* Products Section */}
      <section className="relative py-24 lg:py-32 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-24"
          >
            <p className="font-serif italic text-[#a855f7] text-lg mb-4">our products</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter">
              DeFi Tools,
              <br />
              <span className="text-white/30">Reimagined</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {products.map((product, i) => (
              <motion.div
                key={product.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={product.href} className="block h-full">
                  <div className="group relative h-full p-8 bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all duration-300">
                    {/* Status badge */}
                    <div className={`absolute top-6 right-6 px-3 py-1 text-xs font-medium ${
                      product.status === 'Live' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-white/10 text-white/50'
                    }`}>
                      {product.status}
                    </div>

                    <div className="w-12 h-12 mb-6 bg-white/5 flex items-center justify-center">
                      <product.icon className="w-6 h-6 text-[#a855f7]" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{product.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{product.description}</p>
                    
                    {/* Arrow */}
                    <div className="mt-6 flex items-center gap-2 text-white/30 group-hover:text-white/60 transition-colors">
                      <span className="text-sm font-medium">Learn more</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                    
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#a855f7]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
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
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="font-serif italic text-[#a855f7] text-lg mb-4">why memento</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter">
              Built Different
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-black flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-black/50 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
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
              Ready to start?
            </h2>
            <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto font-serif italic">
              You didn&apos;t survive 2 cycles to earn 3%.
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
