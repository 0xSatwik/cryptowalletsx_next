import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Base Stats Checker | CryptoWalletsX',
    description: 'Check wallet statistics on Base Network. Search by address or domain to view balance, transaction count, gas usage, and transaction history.',
    keywords: ['Base', 'Base Network', 'wallet stats', 'blockchain explorer', 'Base stats checker', 'ENS', 'domain resolution'],
    openGraph: {
        title: 'Base Stats Checker | CryptoWalletsX',
        description: 'Check wallet statistics on Base Network. Supports both addresses and domains.',
        type: 'website',
    },
};

export default function BaseStatsCheckerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
