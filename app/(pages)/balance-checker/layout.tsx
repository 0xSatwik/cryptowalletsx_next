import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Multi-Chain Native Balance Checker | WalletsX',
  description: 'Check native token balances across multiple blockchain networks for multiple addresses simultaneously.',
  keywords: 'blockchain, multi-chain, balance checker, crypto wallet, native tokens'
}

export default function BalanceCheckerLayout({
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