import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tempo Chain Stats Checker | CryptoWalletsX',
    description: 'Track your Tempo Chain wallet stats, transactions, gas spent, and activity patterns.',
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
        'transaction history',
        'Tempo chain airdrop'
    ],
    openGraph: {
        title: 'Tempo Chain Stats Checker | Wallet Analytics & Gas Tracker',
        description: 'Track your Tempo Chain wallet stats, transactions, gas spent, and activity patterns. Detailed analytics and score for Tempo blockchain users.',
        type: 'website',
        url: 'https://cryptowalletsx.com/tempo',
    },
    alternates: {
        canonical: 'https://cryptowalletsx.com/tempo',
    }
};

export default function TempoChainStatsCheckerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
