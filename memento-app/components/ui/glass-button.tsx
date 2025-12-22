"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface GlassButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      default:
        "bg-white/60 backdrop-blur-xl border border-white/30 text-foreground hover:bg-white/80 shadow-glass hover:shadow-glass-lg",
      primary:
        "bg-pink-200 text-pink-900 border-0 hover:bg-pink-300 shadow-sm",
      ghost:
        "bg-transparent hover:bg-white/40 text-foreground border border-transparent hover:border-white/20",
      outline:
        "bg-transparent border border-border hover:bg-white/40 text-foreground",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
      md: "px-4 py-2 text-sm rounded-xl gap-2",
      lg: "px-6 py-3 text-base rounded-xl gap-2.5",
    };

    return (
      <motion.button
        ref={ref as React.Ref<HTMLButtonElement>}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...(props as HTMLMotionProps<"button">)}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);

GlassButton.displayName = "GlassButton";

export { GlassButton };

