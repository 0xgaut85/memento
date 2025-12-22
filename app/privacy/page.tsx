"use client";

import { Container } from "@/components/ui/container";
import { Navbar } from "@/components/landing/navbar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Container className="py-32">
        <Link href="/" className="inline-flex items-center gap-2 text-black/50 hover:text-black mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-8">Privacy Policy</h1>
        <p className="text-black/50 mb-12">Last updated: December 2024</p>

        <div className="prose prose-lg max-w-none text-black/70">
          <h2 className="text-2xl font-bold text-black mt-8 mb-4">1. Introduction</h2>
          <p>
            Memento ("we", "our", or "the Protocol") is committed to protecting your privacy. This Privacy 
            Policy explains how we collect, use, and safeguard information when you use our decentralized 
            finance protocol on the Solana blockchain.
          </p>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">2. Information We Collect</h2>
          <p>
            As a decentralized protocol, we collect minimal information:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Wallet Addresses:</strong> Your public Solana wallet address when you connect to the Protocol. This is publicly visible on the blockchain.</li>
            <li><strong>Transaction Data:</strong> All transactions are recorded on the public Solana blockchain and are not private.</li>
            <li><strong>Usage Analytics:</strong> We may collect anonymized usage data such as page views, feature usage, and performance metrics to improve the Protocol.</li>
          </ul>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">3. Information We Do NOT Collect</h2>
          <p>
            We do not collect or have access to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your private keys or seed phrases</li>
            <li>Personal identification information (name, email, phone number)</li>
            <li>IP addresses (unless required for security purposes)</li>
            <li>Location data</li>
          </ul>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">4. How We Use Information</h2>
          <p>
            The limited information we collect is used to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Facilitate transactions and interactions with the Protocol</li>
            <li>Improve and optimize the user experience</li>
            <li>Monitor and prevent fraudulent or malicious activity</li>
            <li>Comply with legal obligations if required</li>
          </ul>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">5. Blockchain Transparency</h2>
          <p>
            Please be aware that blockchain transactions are inherently public and transparent. Anyone can 
            view transaction history, wallet balances, and smart contract interactions on blockchain explorers. 
            We have no control over this public data.
          </p>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">6. Third-Party Services</h2>
          <p>
            The Protocol may integrate with third-party services such as:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Wallet providers (Phantom, Solflare, etc.)</li>
            <li>RPC providers for blockchain connectivity</li>
            <li>Analytics services (anonymized data only)</li>
          </ul>
          <p className="mt-4">
            Each third-party service has its own privacy policy, and we encourage you to review them.
          </p>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">7. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect the limited data we 
            handle. However, no system is completely secure, and we cannot guarantee absolute security. 
            Your wallet security is your responsibility—never share your private keys or seed phrases.
          </p>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">8. Cookies</h2>
          <p>
            Our website may use essential cookies to ensure proper functionality. We do not use tracking 
            cookies or sell data to advertisers.
          </p>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">9. Your Rights</h2>
          <p>
            Depending on your jurisdiction, you may have rights regarding your personal data, including 
            the right to access, correct, or delete information. However, due to the decentralized nature 
            of the Protocol and blockchain immutability, some data cannot be modified or deleted.
          </p>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page with 
            an updated revision date. Your continued use of the Protocol after changes constitutes acceptance 
            of the updated policy.
          </p>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">11. Contact</h2>
          <p>
            For privacy-related inquiries, please reach out via our official Twitter 
            account <a href="https://x.com/mementodotmoney" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">@mementodotmoney</a>.
          </p>
        </div>
      </Container>
    </div>
  );
}






