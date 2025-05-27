import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sahara AI Stats Checker | Wallets.X',
  description: 'Check wallet statistics on the Sahara AI testnet including transactions, volume, and more.',
  keywords: 'Sahara AI, SAHARA, wallet stats, blockchain analytics, transaction analysis, Sahara AI testnet'
}

export default function SaharaAiLayout({
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