import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tempo Chain Stats Checker | CryptoWalletsX',
    description: 'Check comprehensive wallet statistics on Tempo Chain. Analyze total transactions, gas spending, contract deployments, contract interactions, and temporal activity patterns.',
    keywords: [
        'Tempo Chain',
        'Tempo blockchain',
        'wallet stats',
        'blockchain explorer',
        'Tempo stats checker',
        'gas tracker',
        'contract analyzer',
        'blockchain analytics',
        'wallet activity',
        'transaction history'
    ],
    openGraph: {
        title: 'Tempo Chain Stats Checker | CryptoWalletsX',
        description: 'Comprehensive wallet analytics for Tempo Chain. Track transactions, gas spending, contracts, and activity patterns.',
        type: 'website',
    },
};

export default function TempoChainStatsCheckerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
