import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Linea Chain Stats | Track Your Wallet Activity | WalletsX',
  description: 'Analyze your wallet statistics on Linea Chain. Track transactions, LXP points, gas usage, NFTs, tokens, and more with detailed insights.',
  keywords: 'Linea Chain, wallet tracker, blockchain stats, NFT holdings, token balance, gas usage, contract interactions, LXP points',
  openGraph: {
    type: 'website',
    url: 'https://cryptowalletsx.com/linea',
    title: 'Linea Chain Stats | WalletsX',
    description: 'Track your wallet activity on Linea Chain with comprehensive analytics and insights.'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Linea Chain Stats | WalletsX',
    description: 'Track your wallet activity on Linea Chain with comprehensive analytics and insights.'
  }
}

export default function LineaLayout({
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