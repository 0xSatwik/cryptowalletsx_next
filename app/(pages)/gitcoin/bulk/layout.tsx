import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gitcoin Passport Bulk Score Checker',
  description: 'Check Gitcoin Passport scores for multiple addresses at once. View detailed breakdowns of stamp scores and export results.',
  keywords: 'Gitcoin Passport, bulk checker, score checker, web3 identity, blockchain verification'
}

export default function GitcoinBulkLayout({
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