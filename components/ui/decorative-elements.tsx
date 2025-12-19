"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientOrbProps {
  className?: string;
  color?: "purple" | "pink" | "blue" | "orange";
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
}

const orbColors = {
  purple: "from-purple-500/30 to-purple-600/10",
  pink: "from-pink-500/30 to-pink-600/10",
  blue: "from-blue-500/30 to-blue-600/10",
  orange: "from-orange-500/30 to-orange-600/10",
};

const orbSizes = {
  sm: "w-32 h-32",
  md: "w-64 h-64",
  lg: "w-96 h-96",
  xl: "w-[500px] h-[500px]",
};

export function GradientOrb({
  className,
  color = "purple",
  size = "lg",
  animate = true,
}: GradientOrbProps) {
  return (
    <motion.div
      className={cn(
        "absolute rounded-full blur-3xl bg-gradient-radial pointer-events-none",
        orbColors[color],
        orbSizes[size],
        className
      )}
      animate={
        animate
          ? {
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }
          : undefined
      }
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

interface CornerAccentProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
  variant?: "lines" | "dots" | "corner";
}

export function CornerAccent({
  position,
  className,
  variant = "corner",
}: CornerAccentProps) {
  const positionClasses = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0 rotate-90",
    "bottom-left": "bottom-0 left-0 -rotate-90",
    "bottom-right": "bottom-0 right-0 rotate-180",
  };

  if (variant === "corner") {
    return (
      <div
        className={cn(
          "absolute w-16 h-16 pointer-events-none",
          positionClasses[position],
          className
        )}
      >
        <svg viewBox="0 0 64 64" className="w-full h-full text-black/10">
          <path
            d="M0 0 L64 0 L64 8 L8 8 L8 64 L0 64 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div
        className={cn(
          "absolute pointer-events-none",
          positionClasses[position],
          className
        )}
      >
        <div className="grid grid-cols-3 gap-2 p-4">
          {[...Array(9)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-black/20"
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute pointer-events-none",
        positionClasses[position],
        className
      )}
    >
      <div className="flex flex-col gap-1 p-4">
        <div className="w-12 h-0.5 bg-black/20" />
        <div className="w-8 h-0.5 bg-black/10" />
        <div className="w-4 h-0.5 bg-black/5" />
      </div>
    </div>
  );
}

interface AnimatedDividerProps {
  className?: string;
  variant?: "gradient" | "dots" | "line";
}

export function AnimatedDivider({
  className,
  variant = "gradient",
}: AnimatedDividerProps) {
  if (variant === "gradient") {
    return (
      <div className={cn("relative h-px w-full overflow-hidden", className)}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent" />
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center gap-2 py-4", className)}>
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-black/20"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={cn("h-px bg-black/10", className)}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
    />
  );
}

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function FloatingElement({
  children,
  className,
  delay = 0,
}: FloatingElementProps) {
  return (
    <motion.div
      className={cn("pointer-events-none", className)}
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

interface GridPatternProps {
  className?: string;
}

export function GridPattern({ className }: GridPatternProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none opacity-[0.02]",
        className
      )}
      style={{
        backgroundImage: `
          linear-gradient(to right, black 1px, transparent 1px),
          linear-gradient(to bottom, black 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    />
  );
}



