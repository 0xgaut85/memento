"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
  showClear?: boolean;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
  showClear = true,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2 text-sm",
          "bg-white/60 backdrop-blur-xl border border-white/30 rounded-xl",
          "hover:bg-white/80 transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
          isOpen && "ring-2 ring-ring ring-offset-1"
        )}
      >
        <span className={cn(!selectedOption && "text-muted-foreground")}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 w-full mt-1 py-1",
              "bg-white/90 backdrop-blur-xl border border-white/30 rounded-xl shadow-glass-lg",
              "max-h-60 overflow-auto"
            )}
          >
            {showClear && value && (
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-sm text-left text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                Clear selection
              </button>
            )}
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm text-left",
                  "hover:bg-muted/50 transition-colors",
                  value === option.value && "bg-muted/30"
                )}
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

