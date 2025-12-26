"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { WalletButton } from "@/components/ui/wallet-button";

const navLinks = [
  { href: "/vaults", label: "Vaults" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/aggregator", label: "Aggregator" },
  { href: "/alpha", label: "Alpha" },
  { href: "/analytics", label: "Analytics" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-4">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3 bg-white/70 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-glass">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/transparentlogo.png"
                alt="Memento"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                memento.money
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-4 py-2 text-sm font-medium rounded-xl transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                        transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right side: x402 Server link + Wallet Button */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href="https://www.x402scan.com/server/e967cd67-2d0c-47dc-966c-2de04d17fa29"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/50 transition-colors"
              >
                <Image
                  src="/x402.svg"
                  alt="x402"
                  width={16}
                  height={16}
                  className="w-4 h-4"
                />
                <span className="text-xs font-medium text-muted-foreground">x402 Server</span>
              </a>
              <WalletButton />
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-white/50 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pt-4 border-t border-border/50"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <a
                  href="https://www.x402scan.com/server/e967cd67-2d0c-47dc-966c-2de04d17fa29"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-white/50 transition-colors"
                >
                  <Image
                    src="/x402.svg"
                    alt="x402"
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-muted-foreground">x402 Server</span>
                </a>
                <div className="mt-2 pt-2 border-t border-border/50">
                  <WalletButton />
                </div>
              </div>
            </motion.div>
          )}
        </nav>
      </div>
    </header>
  );
}
