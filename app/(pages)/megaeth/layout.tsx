import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MegaETH testnet Stats Checker',
  description: 'Check wallet statistics on the MegaETH network including transactions, volume, and more.',
  keywords: 'MegaETH, wallet stats, Ethereum analytics, blockchain statistics, transaction analysis'
}

export default function MegaETHLayout({
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