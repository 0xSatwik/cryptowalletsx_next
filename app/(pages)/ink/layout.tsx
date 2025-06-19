import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'INK Chain Stats checker',
  description: 'Analyze your wallet statistics on INK Chain. Track transactions, gas usage, NFTs, tokens, and more with detailed insights.',
  keywords: 'INK Chain, wallet tracker, blockchain stats, NFT holdings, token balance, gas usage, contract interactions'
}

export default function InkLayout({
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