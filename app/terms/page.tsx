"use client";

import { Container } from "@/components/ui/container";
import { Navbar } from "@/components/landing/navbar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Container className="py-32">
        <Link href="/" className="inline-flex items-center gap-2 text-black/50 hover:text-black mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-8">Terms of Service</h1>
        <p className="text-black/50 mb-12">Last updated: December 2024</p>

        <div className="prose prose-lg max-w-none text-black/70">
          <h2 className="text-2xl font-bold text-black mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Memento ("the Protocol"), you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, do not use the Protocol. Memento is a decentralized finance 
            protocol built on the Solana blockchain that enables users to deposit USDC and earn yield through 
            various investment strategies.
          </p>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">2. Eligibility</h2>
          <p>
            You must be at least 18 years old and legally able to enter into contracts in your jurisdiction 
            to use the Protocol. By using Memento, you represent and warrant that you meet these eligibility 
            requirements. The Protocol is not available to residents of jurisdictions where cryptocurrency 
            trading or DeFi protocols are prohibited.
          </p>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">3. Nature of the Protocol</h2>
          <p>
            Memento is a decentralized, non-custodial protocol. You retain full control of your assets at 
            all times through your connected wallet. We do not have access to your private keys or the 
            ability to control your funds. All transactions are executed via smart contracts on the Solana 
            blockchain and are irreversible once confirmed.
          </p>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">4. Risks</h2>
          <p>
            Using the Protocol involves significant risks, including but not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Smart contract vulnerabilities and potential exploits</li>
            <li>Market volatility and potential loss of principal</li>
            <li>Regulatory uncertainty in the cryptocurrency space</li>
            <li>Blockchain network congestion and transaction failures</li>
            <li>Liquidity risks in underlying strategies</li>
            <li>Counterparty risks in delta-neutral and yield strategies</li>
          </ul>
          <p className="mt-4">
            You acknowledge that target yields are estimates only and are not guaranteed. Past performance 
            is not indicative of future results.
          </p>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">5. Fees</h2>
          <p>
            Memento charges a 1% fee on deposits and a 1% fee on withdrawals (in USDC). These fees are 
            subject to change with prior notice. 50% of collected fees are used for operations and growth, 
            while 50% are used for buyback and burn of the $MM token.
          </p>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">6. No Financial Advice</h2>
          <p>
            Nothing in the Protocol or associated materials constitutes financial, investment, legal, or 
            tax advice. You should consult with qualified professionals before making any investment 
            decisions. Memento does not endorse or recommend any particular investment strategy.
          </p>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Memento and its contributors shall not be liable for 
            any direct, indirect, incidental, special, consequential, or punitive damages arising from 
            your use of the Protocol, including but not limited to loss of funds, profits, or data.
          </p>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">8. Modifications</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. Changes will be effective 
            immediately upon posting. Your continued use of the Protocol after any changes constitutes 
            acceptance of the new terms.
          </p>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">9. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with applicable laws, without 
            regard to conflict of law principles. Any disputes shall be resolved through binding arbitration.
          </p>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">10. Contact</h2>
          <p>
            For questions about these Terms of Service, please reach out via our official Twitter 
            account <a href="https://x.com/mementodotmoney" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">@mementodotmoney</a>.
          </p>
        </div>
      </Container>
    </div>
  );
}



