"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 2,
  className = "",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const spring = useSpring(0, { duration: duration * 1000 });
  const [displayValue, setDisplayValue] = useState(0);
  
  // Check if value has decimals
  const hasDecimals = value % 1 !== 0;
  const decimalPlaces = hasDecimals ? (value.toString().split('.')[1]?.length || 1) : 0;

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      if (hasDecimals) {
        setDisplayValue(parseFloat(latest.toFixed(decimalPlaces)));
      } else {
        setDisplayValue(Math.round(latest));
      }
    });
    return unsubscribe;
  }, [spring, hasDecimals, decimalPlaces]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 15 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
    >
      {prefix}{displayValue}{suffix}
    </motion.span>
  );
}

interface AnimatedRangeProps {
  min: number;
  max: number;
  suffix?: string;
  className?: string;
}

export function AnimatedRange({
  min,
  max,
  suffix = "%",
  className = "",
}: AnimatedRangeProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const springMin = useSpring(0, { duration: 1800 });
  const springMax = useSpring(0, { duration: 2000 });
  
  const [displayMin, setDisplayMin] = useState(0);
  const [displayMax, setDisplayMax] = useState(0);

  useEffect(() => {
    if (isInView) {
      springMin.set(min);
      springMax.set(max);
    }
  }, [isInView, springMin, springMax, min, max]);

  useEffect(() => {
    const unsubMin = springMin.on("change", (v) => setDisplayMin(Math.round(v)));
    const unsubMax = springMax.on("change", (v) => setDisplayMax(Math.round(v)));
    return () => {
      unsubMin();
      unsubMax();
    };
  }, [springMin, springMax]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
    >
      {displayMin}-{displayMax}{suffix}
    </motion.span>
  );
}

