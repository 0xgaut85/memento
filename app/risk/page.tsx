"use client";

import { Container } from "@/components/ui/container";
import { Navbar } from "@/components/landing/navbar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RiskDisclosure() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Container className="py-32">
        <Link href="/" className="inline-flex items-center gap-2 text-black/50 hover:text-black mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-8">Risk Disclosure</h1>
        <p className="text-black/50 mb-12">Last updated: December 2024</p>

        <div className="prose prose-lg max-w-none text-black/70">
          <div className="bg-black/5 border-l-4 border-black p-6 mb-8">
            <p className="font-bold text-black m-0">
              IMPORTANT: Please read this Risk Disclosure carefully before using Memento. Cryptocurrency 
              investments and DeFi protocols involve substantial risk of loss. Only invest what you can 
              afford to lose.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">1. General Investment Risks</h2>
          <p>
            Investing in cryptocurrency and decentralized finance protocols carries inherent risks:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Loss of Principal:</strong> You may lose some or all of your deposited funds.</li>
            <li><strong>No Guaranteed Returns:</strong> Target yields (10-15% APY) are estimates based on historical performance and market conditions. Actual returns may be significantly lower or negative.</li>
            <li><strong>Market Volatility:</strong> Cryptocurrency markets are highly volatile and can experience rapid price changes.</li>
          </ul>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">2. Smart Contract Risks</h2>
          <p>
            Memento operates through smart contracts on the Solana blockchain:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Code Vulnerabilities:</strong> Despite audits, smart contracts may contain bugs or vulnerabilities that could be exploited.</li>
            <li><strong>Immutability:</strong> Once deployed, smart contract code cannot be easily changed, which may limit our ability to fix issues.</li>
            <li><strong>Oracle Risks:</strong> The Protocol may rely on external data feeds (oracles) that could malfunction or be manipulated.</li>
          </ul>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">3. Strategy-Specific Risks</h2>
          
          <h3 className="text-xl font-bold text-black mt-6 mb-3">Dividend Delta-Neutral Strategy</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Hedging may not perfectly offset price movements</li>
            <li>Dividend payments from underlying assets are not guaranteed</li>
            <li>Counterparty risk with hedging instruments</li>
          </ul>

          <h3 className="text-xl font-bold text-black mt-6 mb-3">Funding Rate Arbitrage</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Funding rates can turn negative, resulting in losses</li>
            <li>Exchange counterparty risk</li>
            <li>Liquidation risk in leveraged positions</li>
            <li>Basis risk between spot and perpetual prices</li>
          </ul>

          <h3 className="text-xl font-bold text-black mt-6 mb-3">REITs / Income Strategy</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Real estate market downturns</li>
            <li>Regulatory risks in real-world asset tokenization</li>
            <li>Liquidity constraints</li>
          </ul>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">4. Liquidity Risks</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Withdrawal Delays:</strong> Large withdrawals may take time to process depending on strategy liquidity.</li>
            <li><strong>Capacity Limits:</strong> Vaults have capacity limits; you may not be able to deposit during high demand periods.</li>
            <li><strong>Market Liquidity:</strong> During market stress, underlying assets may become illiquid.</li>
          </ul>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">5. Regulatory Risks</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Cryptocurrency regulations are evolving and uncertain</li>
            <li>The Protocol or its strategies may become illegal in certain jurisdictions</li>
            <li>Regulatory actions could impact the value of assets or restrict access to the Protocol</li>
          </ul>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">6. Technology Risks</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Blockchain Risks:</strong> Solana network congestion, outages, or security issues</li>
            <li><strong>Wallet Security:</strong> Loss of private keys means permanent loss of funds</li>
            <li><strong>Frontend Attacks:</strong> Phishing or DNS attacks could redirect users to malicious sites</li>
          </ul>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">7. No Insurance</h2>
          <p>
            Deposits in Memento are NOT insured by any government agency or private insurance. There is no 
            guarantee of recovery in case of losses due to hacks, exploits, or market conditions.
          </p>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">8. Do Your Own Research</h2>
          <p>
            Before using Memento, you should:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Understand how DeFi protocols work</li>
            <li>Research the specific strategies used by the Protocol</li>
            <li>Consult with financial and legal professionals</li>
            <li>Only invest funds you can afford to lose entirely</li>
          </ul>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">9. Acknowledgment</h2>
          <p>
            By using Memento, you acknowledge that you have read and understood this Risk Disclosure, and 
            you accept full responsibility for any losses incurred. You confirm that you are not relying 
            on any statements or representations made by Memento or its contributors as investment advice.
          </p>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">10. Contact</h2>
          <p>
            For questions about risks, please reach out via our official Twitter 
            account <a href="https://x.com/mementodotmoney" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">@mementodotmoney</a>.
          </p>
        </div>
      </Container>
    </div>
  );
}





