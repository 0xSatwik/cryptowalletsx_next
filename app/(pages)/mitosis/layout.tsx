import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mitosis Stats and rank Checker ( testnet and mainnet )',
  description: 'Check detailed stats for your Mitosis wallet across Game of Mito, Matrix, and Expedition',
};

export default function MitosisOverallLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
} 