import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pharos testnet Stats Checker',
  description: 'Check wallet statistics on the Pharos testnet including transactions, volume, and more.',
  keywords: 'Pharos, wallet stats, blockchain analytics, transaction analysis, Pharos testnet, testnet airdrop'
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