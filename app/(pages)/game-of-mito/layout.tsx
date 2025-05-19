import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mitosis Rank Checker | Track Your MITO Balance and Rank',
  description: 'Check your rank and stats on the Mitosis chain including MITO and wMITO balances. View wealth distribution and track your position in the Mitosis ecosystem.',
  keywords: 'Mitosis rank checker, MITO balance, wMITO balance, Mitosis wallet stats, Mitosis rank, blockchain analytics'
}

export default function MitosisLayout({
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