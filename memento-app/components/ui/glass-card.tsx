"use client";

import { forwardRef, HTMLAttributes } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "strong" | "subtle";
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      variant = "default",
      hover = false,
      padding = "md",
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: "bg-white/60 backdrop-blur-xl border border-white/30 shadow-glass",
      strong: "bg-white/80 backdrop-blur-2xl border border-white/40 shadow-glass-lg",
      subtle: "bg-white/40 backdrop-blur-lg border border-white/20",
    };

    const paddings = {
      none: "",
      sm: "p-3",
      md: "p-4 sm:p-5",
      lg: "p-6 sm:p-8",
    };

    const hoverStyles = hover
      ? "transition-all duration-300 hover:bg-white/80 hover:shadow-glass-lg hover:border-white/40 cursor-pointer"
      : "";

    if (hover) {
      return (
        <motion.div
          ref={ref as React.Ref<HTMLDivElement>}
          whileHover={{ y: -2 }}
          className={cn(
            "rounded-2xl",
            variants[variant],
            paddings[padding],
            hoverStyles,
            className
          )}
          {...(props as HTMLMotionProps<"div">)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl",
          variants[variant],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };

