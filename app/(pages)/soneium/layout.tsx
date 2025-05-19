import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Soneium Chain Stats | Track Your Wallet Activity | WalletsX',
  description: 'Analyze your wallet statistics on Soneium Chain. Track transactions, gas usage, NFTs, tokens, and more with detailed insights.',
  keywords: 'Soneium Chain, wallet tracker, blockchain stats, NFT holdings, token balance, gas usage, contract interactions',
  openGraph: {
    type: 'website',
    url: 'https://cryptowalletsx.com/soneium',
    title: 'Soneium Chain Stats | WalletsX',
    description: 'Track your wallet activity on Soneium Chain with comprehensive analytics and insights.'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Soneium Chain Stats | WalletsX',
    description: 'Track your wallet activity on Soneium Chain with comprehensive analytics and insights.'
  }
}

export default function SoneiumLayout({
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