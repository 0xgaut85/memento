"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  gradient?: "purple-pink" | "pink-orange" | "blue-purple" | "gold";
  animate?: boolean;
}

const gradients = {
  "purple-pink": "from-purple-600 via-pink-500 to-purple-600",
  "pink-orange": "from-pink-500 via-orange-400 to-pink-500",
  "blue-purple": "from-blue-500 via-purple-500 to-blue-500",
  "gold": "from-yellow-400 via-amber-500 to-yellow-400",
};

export function GradientText({
  children,
  className,
  gradient = "purple-pink",
  animate = true,
}: GradientTextProps) {
  return (
    <motion.span
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent bg-[length:200%_auto]",
        gradients[gradient],
        animate && "animate-gradient",
        className
      )}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      {children}
    </motion.span>
  );
}

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
}

export function TextReveal({ children, className, delay = 0 }: TextRevealProps) {
  const words = children.split(" ");

  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: delay + i * 0.1,
              ease: [0.33, 1, 0.68, 1],
            }}
          >
            {word}
            {i < words.length - 1 && "\u00A0"}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

interface TextScrambleProps {
  children: string;
  className?: string;
}

export function TextScramble({ children, className }: TextScrambleProps) {
  return (
    <motion.span
      className={cn("inline-block", className)}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.span>
  );
}



