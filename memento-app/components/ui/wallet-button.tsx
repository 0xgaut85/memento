'use client';

/**
 * WalletButton - Uses native Solana Wallet Adapter
 * Exactly as per x402-solana README: https://github.com/PayAINetwork/x402-solana
 * 
 * Uses WalletMultiButton for connection UI
 */

import dynamic from 'next/dynamic';

// Dynamically import the wallet button to prevent SSR issues
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false, loading: () => <WalletButtonPlaceholder /> }
);

function WalletButtonPlaceholder() {
  return (
    <button
      className="px-4 py-2.5 bg-pink-100 text-pink-800 rounded-xl font-medium text-sm"
      disabled
    >
      Connect Wallet
    </button>
  );
}

export function WalletButton() {
  return (
    <div className="wallet-adapter-button-wrapper">
      <WalletMultiButtonDynamic 
        style={{
          backgroundColor: '#fce7f3',
          color: '#9d174d',
          borderRadius: '0.75rem',
          fontWeight: 500,
          fontSize: '0.875rem',
          height: '2.75rem',
          padding: '0 1rem',
        }}
      />
      <style jsx global>{`
        .wallet-adapter-button-wrapper .wallet-adapter-button {
          border-radius: 0.75rem !important;
          font-weight: 500 !important;
          font-size: 0.875rem !important;
          height: 2.75rem !important;
          padding: 0 1rem !important;
          transition: all 0.2s ease !important;
        }
        .wallet-adapter-button-wrapper .wallet-adapter-button:not(.wallet-adapter-button-trigger) {
          background-color: #fce7f3 !important;
          color: #9d174d !important;
        }
        .wallet-adapter-button-wrapper .wallet-adapter-button:not(.wallet-adapter-button-trigger):hover {
          background-color: #fbcfe8 !important;
        }
        .wallet-adapter-button-wrapper .wallet-adapter-button.wallet-adapter-button-trigger {
          background-color: #d1fae5 !important;
          color: #065f46 !important;
        }
        .wallet-adapter-button-wrapper .wallet-adapter-button.wallet-adapter-button-trigger:hover {
          background-color: #a7f3d0 !important;
        }
        .wallet-adapter-button-wrapper .wallet-adapter-button-start-icon {
          margin-right: 0.5rem !important;
        }
        .wallet-adapter-dropdown {
          z-index: 1000 !important;
        }
        .wallet-adapter-dropdown-list {
          background-color: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 0.75rem !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
          overflow: hidden !important;
        }
        .wallet-adapter-dropdown-list-item {
          background-color: white !important;
          color: #374151 !important;
          padding: 0.75rem 1rem !important;
          font-size: 0.875rem !important;
        }
        .wallet-adapter-dropdown-list-item:hover {
          background-color: #f3f4f6 !important;
        }
        .wallet-adapter-modal-wrapper {
          background-color: rgba(0, 0, 0, 0.8) !important;
          backdrop-filter: blur(4px) !important;
        }
        .wallet-adapter-modal-container {
          background-color: white !important;
          border-radius: 1rem !important;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25) !important;
        }
        .wallet-adapter-modal-title {
          color: #111827 !important;
          font-weight: 700 !important;
        }
        .wallet-adapter-modal-list li {
          margin-bottom: 0.5rem !important;
        }
        .wallet-adapter-modal-list .wallet-adapter-button {
          background-color: #f9fafb !important;
          color: #111827 !important;
          border-radius: 0.75rem !important;
          border: 1px solid #e5e7eb !important;
        }
        .wallet-adapter-modal-list .wallet-adapter-button:hover {
          background-color: #f3f4f6 !important;
          border-color: #d1d5db !important;
        }
      `}</style>
    </div>
  );
}
