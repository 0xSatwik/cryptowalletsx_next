import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LayerZero Stats Checker | WalletsX',
  description: 'Check your LayerZero transactions statistics for the second airdrop. Track your cross-chain activity since May 1, 2024.',
  keywords: 'LayerZero, airdrop, cross-chain, transactions, blockchain, wallet stats',
  openGraph: {
    type: 'website',
    url: 'https://cryptowalletsx.com/layerzero-stats',
    title: 'LayerZero Stats Checker | WalletsX',
    description: 'Check your LayerZero transactions statistics for the second airdrop. Track your cross-chain activity since May 1, 2024.'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LayerZero Stats Checker | WalletsX',
    description: 'Check your LayerZero transactions statistics for the second airdrop. Track your cross-chain activity since May 1, 2024.'
  }
}

export default function LayerZeroStatsLayout({
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