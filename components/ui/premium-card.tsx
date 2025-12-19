"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  hoverLift?: boolean;
  glowColor?: string;
}

export function FloatingCard({
  children,
  className,
  hoverLift = true,
  glowColor = "purple",
}: FloatingCardProps) {
  const glowColors = {
    purple: "hover:shadow-purple-500/20",
    pink: "hover:shadow-pink-500/20",
    blue: "hover:shadow-blue-500/20",
    none: "",
  };

  return (
    <motion.div
      className={cn(
        "relative bg-white rounded-2xl p-6",
        "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1),0_8px_40px_-8px_rgba(0,0,0,0.05)]",
        hoverLift && [
          "transition-all duration-300 ease-out",
          "hover:-translate-y-2",
          "hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15),0_30px_60px_-20px_rgba(0,0,0,0.1)]",
          glowColors[glowColor as keyof typeof glowColors],
        ],
        className
      )}
      whileHover={hoverLift ? { scale: 1.01 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  blur?: "sm" | "md" | "lg" | "xl";
  opacity?: number;
}

export function GlassCard({
  children,
  className,
  blur = "lg",
  opacity = 70,
}: GlassCardProps) {
  const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        blurClasses[blur],
        `bg-white/${opacity}`,
        "rounded-2xl border border-white/20",
        "shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]",
        "p-6",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface GradientBorderCardProps {
  children: React.ReactNode;
  className?: string;
  borderWidth?: number;
  gradient?: string;
}

export function GradientBorderCard({
  children,
  className,
  borderWidth = 2,
  gradient = "from-purple-500 via-pink-500 to-purple-500",
}: GradientBorderCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl p-[2px]",
        "bg-gradient-to-r",
        gradient,
        className
      )}
      style={{ padding: borderWidth }}
    >
      <div className="rounded-2xl bg-white h-full">
        {children}
      </div>
    </div>
  );
}



