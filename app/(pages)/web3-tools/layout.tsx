import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Tools - Blockchain Analytics & Wallet Tracking | WalletsX',
  description: 'Explore our comprehensive suite of Web3 tools for analyzing blockchain wallets, tracking statistics, and monitoring holdings across multiple chains.',
  keywords: 'Web3 tools, blockchain analytics, wallet tracker, NFT holdings, token balance, crypto rankings, Mitosis Chain, Monad Chain, Linea Chain, Soneium Chain, Gitcoin Passport, Galxe Airdrops',
  metadataBase: new URL('https://cryptowalletsx.com'),
}

export default function Web3ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  );
} 