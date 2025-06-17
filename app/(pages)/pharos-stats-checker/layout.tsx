import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pharos Stats Checker | Wallets.X',
  description: 'Check wallet statistics on the Pharos testnet including transactions, volume, and more.',
  keywords: 'Pharos, wallet stats, blockchain analytics, transaction analysis, Pharos testnet'
}

export default function PharosLayout({
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