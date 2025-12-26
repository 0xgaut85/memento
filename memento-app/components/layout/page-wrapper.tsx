"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageWrapper - Provides consistent page layout with animations
 */
export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "min-h-screen pt-24 pb-12 px-4 sm:px-6",
        className
      )}
    >
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </motion.main>
  );
}
