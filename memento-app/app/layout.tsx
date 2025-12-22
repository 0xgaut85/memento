import type { Metadata } from "next";
import { Manrope, Space_Grotesk, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AppProviders } from "@/components/providers/AppProviders";

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
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "app.memento.money",
  description: "Find the best stablecoin yields across all chains - USDC, USDT, GHO, USDS and more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} ${cormorantGaramond.variable} antialiased`}
      >
        <AppProviders>
          <Navbar />
          {children}
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
