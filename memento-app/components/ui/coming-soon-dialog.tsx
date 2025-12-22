"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import Image from "next/image";

interface ComingSoonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function ComingSoonDialog({ 
  open, 
  onOpenChange,
  title = "Coming Soon",
  description = "We're working hard to bring this feature to life."
}: ComingSoonDialogProps) {
  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4"
          >
            <div className="relative bg-white/90 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-2xl overflow-hidden">
              {/* Close button */}
              <button
                onClick={() => onOpenChange(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="p-8 text-center">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-primary" />
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-primary/20 -z-10"
                    />
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  {title}
                </h2>

                {/* Description */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {description}
                </p>

                {/* Social CTA */}
                <p className="text-sm text-muted-foreground mb-6">
                  Follow us on{" "}
                  <a
                    href="https://x.com/mementodotmoney"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-semibold hover:underline"
                  >
                    @mementodotmoney
                  </a>{" "}
                  to stay updated!
                </p>

                {/* Button */}
                <button
                  onClick={() => onOpenChange(false)}
                  className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function useComingSoon() {
  const [open, setOpen] = React.useState(false);

  const showComingSoon = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setOpen(true);
  };

  return { open, setOpen, showComingSoon };
}

