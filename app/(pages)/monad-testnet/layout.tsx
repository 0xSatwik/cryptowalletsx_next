import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Monad Testnet Stats Checker | Check Monad Rank & Wallet Status',
  description: 'Analyze your wallet rank on Monad Testnet. Use our Monad Checker for free stats, transaction history, and ranking. Check wallet status and activity score.',
  keywords: 'Monad Testnet rank checker, monad stats checker, monad testnet stats, check monad rank, monad wallet checker, monad transaction checker, monad testnet ranking, monad wallet stats',
  openGraph: {
    type: 'website',
    url: 'https://cryptowalletsx.com/monad-testnet-stats',
    title: 'Monad Testnet Stats & Wallet Checker | Transaction Analysis Tool',
    description: 'Check your Monad wallet status, rank, and transaction history. Free Monad Testnet stats checker with detailed activity scoring.'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Monad Testnet Stats & Wallet Checker | Transaction Analysis Tool',
    description: 'Check your Monad wallet status, rank, and transaction history. Free Monad Testnet stats checker with detailed activity scoring.'
  }
};

export default function MonadTestnetLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
} 