import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Relay Stats Checker | Bridge Analytics',
  description: 'Check wallet statistics on Relay bridge including transactions, volume, chain usage, and bridge activity.',
  keywords: 'Relay, bridge, wallet stats, blockchain analytics, transaction analysis, cross-chain, bridge stats'
}

export default function RelayStatsLayout({
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
