"use client";

import { useEffect, useState } from "react";

interface GlitchTextProps {
  children: React.ReactNode;
  className?: string;
}

export function GlitchText({ children, className = "" }: GlitchTextProps) {
  const [glitchFrame, setGlitchFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Cycle through glitch states: 0 = off, 1-3 = different glitch frames
      setGlitchFrame((prev) => {
        if (prev === 0) {
          // 50% chance to start glitching
          return Math.random() > 0.5 ? 1 : 0;
        }
        // Continue glitch sequence or reset
        return prev < 3 ? prev + 1 : 0;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const isGlitching = glitchFrame > 0;

  return (
    <span className={`relative inline-block ${className}`}>
      {/* Main text */}
      <span className="relative z-10">{children}</span>

      {/* Glitch layers */}
      <span
        className={`absolute inset-0 text-pink-500 transition-opacity duration-50 ${isGlitching && glitchFrame === 1 ? 'opacity-80' : 'opacity-0'}`}
        style={{
          transform: "translate(-4px, 2px) skewX(-3deg)",
        }}
        aria-hidden="true"
      >
        {children}
      </span>

      <span
        className={`absolute inset-0 text-purple-500 transition-opacity duration-50 ${isGlitching && glitchFrame === 2 ? 'opacity-80' : 'opacity-0'}`}
        style={{
          transform: "translate(4px, -2px) skewX(3deg)",
        }}
        aria-hidden="true"
      >
        {children}
      </span>

      <span
        className={`absolute inset-0 text-cyan-400 transition-opacity duration-50 ${isGlitching && glitchFrame === 3 ? 'opacity-70' : 'opacity-0'}`}
        style={{
          transform: "translate(2px, 3px) skewX(-1deg)",
        }}
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  );
}

