"use client";

import { motion } from "framer-motion";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface GlitchImageProps extends ImageProps {
  containerClassName?: string;
  intensity?: "subtle" | "strong";
  clipEdges?: boolean;
  disableOnMobile?: boolean;
  waveOnly?: boolean;
  shake?: boolean;
}

export function GlitchImage({ containerClassName, className, alt, intensity = "subtle", clipEdges = false, disableOnMobile = false, waveOnly = false, shake = false, ...props }: GlitchImageProps) {
  const isStrong = intensity === "strong";
  const mobileHideClass = disableOnMobile ? "hidden lg:block" : "";
  const showGhostLayers = !waveOnly;
  
  return (
    <div className={cn("relative", clipEdges ? "overflow-hidden" : "", containerClassName)}>
      {/* Inner wrapper to clip glitch at edges - with inset to prevent shadow overflow */}
      <div className={cn("relative w-full h-full", clipEdges && "overflow-hidden")} style={clipEdges ? { clipPath: "inset(0)" } : undefined}>
        {/* Ghost Layer 1 - Horizontal Displacement with Skew */}
        {showGhostLayers && (
          <motion.div
            className={cn("absolute inset-0 z-0 opacity-50 pointer-events-none", mobileHideClass)}
            animate={{
              x: isStrong ? [-8, 12, -6, 10, -8] : [-2, 2, -1, 3, -2],
              skewX: isStrong ? [-3, 3, -2, 1, 0] : [0, 0, 0, 0],
              scaleX: isStrong ? [1, 1.03, 0.97, 1.02, 1] : [1, 1, 1, 1, 1],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{
              duration: 0.15,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "linear"
            }}
          >
            <Image
              alt={alt}
              className={cn("opacity-60", className)}
              {...props}
            />
          </motion.div>
        )}

        {/* Ghost Layer 2 - Vertical Displacement with Skew */}
        {showGhostLayers && (
          <motion.div
            className={cn("absolute inset-0 z-0 opacity-50 pointer-events-none", mobileHideClass)}
            animate={{
              y: isStrong ? [-6, 10, -8, 6, 0] : [-1, 2, -2, 1, 0],
              skewY: isStrong ? [-2, 2, -1, 1, 0] : [0, 0, 0, 0],
              scaleY: isStrong ? [1, 1.02, 0.98, 1.01, 1] : [1, 1, 1, 1, 1],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{
              duration: 0.25,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "linear"
            }}
          >
            <Image
              alt={alt}
              className={cn("opacity-60", className)}
              {...props}
            />
          </motion.div>
        )}

        {/* Ghost Layer 3 - Combined Deformation (only for strong) */}
        {showGhostLayers && isStrong && (
          <motion.div
            className={cn("absolute inset-0 z-0 opacity-40 pointer-events-none", mobileHideClass)}
            animate={{
              x: [6, -8, 5, -6, 6],
              y: [-4, 6, -5, 4, -4],
              scaleX: [1, 1.04, 0.96, 1.02, 1],
              scaleY: [1, 0.98, 1.03, 0.99, 1],
              skewX: [0, 2, -2, 1, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 0.28,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "linear"
            }}
          >
            <Image
              alt={alt}
              className={cn("opacity-50", className)}
              {...props}
            />
          </motion.div>
        )}

        {/* Main Image - with optional shake */}
        <motion.div 
          className="relative z-10 w-full h-full"
          animate={shake ? {
            x: [0, -2, 2, -1.5, 1.5, -1, 1, 0],
          } : undefined}
          transition={shake ? {
            duration: 3,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut"
          } : undefined}
        >
          <Image
            alt={alt}
            className={cn("", className)}
            {...props}
          />
        </motion.div>
        
        {/* Deformative Wave - more visible when waveOnly */}
        <motion.div 
          className={cn(
            "absolute w-full z-30 pointer-events-none", 
            mobileHideClass,
            waveOnly ? "h-[3px] bg-gradient-to-r from-transparent via-white/40 to-transparent" : "h-[1px] bg-white/20 mix-blend-overlay"
          )}
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: waveOnly ? 2 : 3, repeat: Infinity, ease: "linear" }}
        />
        {waveOnly && (
          <motion.div 
            className={cn(
              "absolute w-full h-[2px] bg-gradient-to-r from-transparent via-black/20 to-transparent z-30 pointer-events-none", 
              mobileHideClass
            )}
            animate={{ top: ["100%", "0%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>
    </div>
  );
}
