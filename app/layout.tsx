import type { Metadata } from "next";
import { Manrope, Space_Grotesk, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { ReactLenis } from "@/lib/lenis";
import { CustomCursor } from "@/components/ui/custom-cursor";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-mono",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-serif",
  weight: ["700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Memento | Real Yield on USDC",
  description: "Put your USDC to work safely, simply, on Solana. Market-neutral and income strategies.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} ${cormorantGaramond.variable} antialiased bg-background text-foreground`}
      >
        <ReactLenis root>
          <CustomCursor />
          {children}
        </ReactLenis>
      </body>
    </html>
  );
}
