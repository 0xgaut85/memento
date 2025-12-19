"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { XIcon } from "lucide-react";
import Image from "next/image";
import * as DialogPrimitive from "@radix-ui/react-dialog";

// Pattern: 2 English, 1 Japanese Kanji
const abundantWords = [
  "abundant", 
  "prosperous", 
  "豊か",
  "profitable", 
  "fruitful", 
  "繁栄",
  "lucrative", 
  "rewarding",
  "富裕",
  "flourishing",
  "thriving",
  "成功",
  "bountiful",
  "opulent",
  "豪華",
];

export function LoadingScreen() {
  const [isComplete, setIsComplete] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showNGMI, setShowNGMI] = useState(false);
  const [selectedOption, setSelectedOption] = useState<"Y" | "N" | null>(null);
  const [showContent, setShowContent] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle video playback with retry logic
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = async () => {
      try {
        video.playbackRate = 1;
        await video.play();
      } catch (err) {
        // Retry after a short delay if autoplay fails
        setTimeout(() => {
          video.play().catch(() => {});
        }, 100);
      }
    };

    // Play on load
    if (video.readyState >= 3) {
      playVideo();
    }

    // Handle visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && video.paused) {
        playVideo();
      }
    };

    // Handle video stall/pause
    const handlePause = () => {
      if (!isComplete) {
        playVideo();
      }
    };

    video.addEventListener('canplay', playVideo);
    video.addEventListener('pause', handlePause);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      video.removeEventListener('canplay', playVideo);
      video.removeEventListener('pause', handlePause);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isComplete]);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowContent(true), 300);
    const timer2 = setTimeout(() => setShowButtons(true), 3500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % abundantWords.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isComplete) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete || !showButtons) return;
      if (e.key === "ArrowLeft" || e.key === "y" || e.key === "Y") {
        if (showNGMI) return;
        setSelectedOption("Y");
        setTimeout(() => setIsComplete(true), 600);
      } else if (e.key === "ArrowRight" || e.key === "n" || e.key === "N") {
        if (showNGMI) return;
        setSelectedOption("N");
        setShowNGMI(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isComplete, showNGMI, showButtons]);

  const handleYes = () => {
    setSelectedOption("Y");
    setTimeout(() => setIsComplete(true), 600);
  };

  const handleNo = () => {
    setSelectedOption("N");
    setShowNGMI(true);
  };

  if (isComplete) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {!isComplete && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-black"
            style={{ pointerEvents: showNGMI ? 'none' : 'auto' }}
          >
            {/* Video Background */}
            <div className="absolute inset-0 z-0">
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                disablePictureInPicture
                className="w-full h-full object-cover"
                style={{ willChange: 'auto' }}
              >
                <source src="/blossom2.mp4" type="video/mp4" />
              </video>
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/60" />
            </div>
            
            {/* Fine grain texture - hidden on mobile for performance */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-20 z-[1] hidden lg:block"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='turbulence' baseFrequency='4' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
                backgroundSize: '150px 150px',
              }}
            />

            {/* Main content */}
            <div className="relative z-10 max-w-3xl px-6 sm:px-8 text-center flex flex-col items-center justify-center min-h-screen">
              
              {/* Logo + Brand name on single line */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: showContent ? 1 : 0, scale: showContent ? 1 : 0.8 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="mb-12 sm:mb-16 flex items-center justify-center gap-4 sm:gap-6"
              >
                <Image 
                  src="/logowhite.png" 
                  alt="Memento Logo" 
                  width={200} 
                  height={200} 
                  className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                  unoptimized
                />
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-white tracking-tight">
                  memento.money
                </h1>
              </motion.div>

              {/* Main text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showContent ? 1 : 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-10 sm:mb-14"
              >
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-white leading-relaxed tracking-tight">
                  <p className="mb-3 font-light whitespace-nowrap">
                    You're about to enter the most
                  </p>
                  <p className="mb-3">
                    <span className="inline-block min-w-[120px] sm:min-w-[160px] md:min-w-[220px] lg:min-w-[280px]">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={currentWordIndex}
                          initial={{ opacity: 0, y: 15, rotateX: -20 }}
                          animate={{ opacity: 1, y: 0, rotateX: 0 }}
                          exit={{ opacity: 0, y: -15, rotateX: 20 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="font-serif italic font-bold text-pink-300 drop-shadow-[0_0_30px_rgba(249,168,212,0.5)]"
                        >
                          {abundantWords[currentWordIndex]}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </p>
                  <p className="text-white/60 font-light">era of your existence.</p>
                </div>
              </motion.div>

              {/* Question */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: showContent ? 1 : 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-xl sm:text-2xl md:text-3xl font-serif italic text-white/40 mb-12 sm:mb-16"
              >
                Are you ready to proceed?
              </motion.p>

              {/* Y/N Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: showButtons ? 1 : 0, y: showButtons ? 0 : 20 }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-center gap-12 sm:gap-16 md:gap-24"
              >
                {/* Yes button */}
                <motion.button
                  onClick={handleYes}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`group relative transition-all duration-300 ${
                    selectedOption === "Y" ? "scale-110" : ""
                  }`}
                >
                  <div className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter transition-all duration-300 ${
                    selectedOption === "Y" 
                      ? "text-purple-400 drop-shadow-[0_0_40px_rgba(192,132,252,0.6)]" 
                      : "text-white/90 hover:text-purple-300"
                  }`}>
                    Y
                  </div>
                  <div className={`text-xs sm:text-sm font-mono mt-2 tracking-widest uppercase transition-colors ${
                    selectedOption === "Y" ? "text-purple-400/70" : "text-white/30"
                  }`}>
                    yes
                  </div>
                </motion.button>

                <div className="text-white/10 text-4xl sm:text-5xl font-extralight">/</div>

                {/* No button */}
                <motion.button
                  onClick={handleNo}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`group relative transition-all duration-300 ${
                    selectedOption === "N" ? "scale-110" : ""
                  }`}
                >
                  <div className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter transition-all duration-300 ${
                    selectedOption === "N" 
                      ? "text-red-400 drop-shadow-[0_0_40px_rgba(248,113,113,0.6)]" 
                      : "text-white/90 hover:text-red-300"
                  }`}>
                    N
                  </div>
                  <div className={`text-xs sm:text-sm font-mono mt-2 tracking-widest uppercase transition-colors ${
                    selectedOption === "N" ? "text-red-400/70" : "text-white/30"
                  }`}>
                    no
                  </div>
                </motion.button>
              </motion.div>

              {/* Hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: showButtons ? 0.4 : 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-xs text-white/30 font-mono mt-8"
              >
                press Y/N or use arrow keys
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NGMI Dialog */}
      <DialogPrimitive.Root open={showNGMI} onOpenChange={(open) => {
        setShowNGMI(open);
        if (!open) setSelectedOption(null);
      }}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[10000] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content className="fixed top-[50%] left-[50%] z-[10001] w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] sm:max-w-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <div className="bg-black border border-white/10 p-8 text-center">
              <DialogPrimitive.Title className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tighter">
                NGMI
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-lg text-white/50 font-serif italic mb-6">
                Not Gonna Make It.
              </DialogPrimitive.Description>
              <button
                onClick={() => {
                  setShowNGMI(false);
                  setSelectedOption(null);
                }}
                className="px-6 py-2 bg-white text-black font-bold text-sm hover:bg-white/90 transition-colors"
              >
                Try Again
              </button>
              <DialogPrimitive.Close className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors">
                <XIcon className="h-4 w-4" />
              </DialogPrimitive.Close>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
