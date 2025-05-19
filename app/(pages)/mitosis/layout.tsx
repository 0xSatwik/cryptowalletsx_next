import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mitosis Wallet Stats Checker | Wallets.X0',
  description: 'Check detailed stats for your Mitosis wallet across Game of Mito, Matrix, and Expedition',
};

export default function MitosisOverallLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
} 