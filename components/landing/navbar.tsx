"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ComingSoonDialog, useComingSoon } from "@/components/landing/coming-soon-dialog";
import { motion, useScroll, useTransform } from "framer-motion";

export function Navbar() {
  const { open, setOpen, showComingSoon } = useComingSoon();
  const { scrollY } = useScroll();
  
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.95)"]
  );
  
  const borderOpacity = useTransform(
    scrollY,
    [0, 100],
    [0.2, 1]
  );

  return (
    <>
      <motion.header 
        className="fixed top-0 z-50 w-full border-b-2 border-border backdrop-blur-md"
        style={{ 
          backgroundColor,
          borderBottomColor: useTransform(borderOpacity, (v) => `rgba(10, 10, 10, ${v})`)
        }}
      >
        <Container className="flex h-20 md:h-24 items-center justify-between">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/transparentlogo.png" 
                alt="Memento Logo" 
                width={80} 
                height={80} 
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
                unoptimized
              />
              <span className="font-serif text-xl md:text-2xl font-bold tracking-tight">memento.money</span>
            </Link>
          </motion.div>
          <motion.nav 
            className="flex items-center gap-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link 
              href="#" 
              onClick={showComingSoon}
              className="hidden text-sm font-medium hover:text-primary transition-colors sm:block"
            >
              Read the docs
            </Link>
            <Button variant="brutalist" onClick={showComingSoon}>
              Start Earning
            </Button>
          </motion.nav>
        </Container>
      </motion.header>
      <ComingSoonDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
