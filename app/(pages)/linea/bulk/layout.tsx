import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Linea Bulk Wallet Checker | WalletsX',
  description: 'Check multiple Linea Chain wallet statistics, LXP-L rankings, and POH verification status simultaneously.',
  keywords: 'Linea Chain, bulk wallet checker, LXP-L, POH verification, blockchain analytics'
}

export default function LineaBulkLayout({
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