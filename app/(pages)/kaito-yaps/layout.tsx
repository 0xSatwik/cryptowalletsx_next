import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kaito YAPS Checker | Track Twitter Engagement',
  description: 'Check Kaito YAPS scores for Twitter users. Track engagement metrics and analyze performance across multiple timeframes.',
  keywords: 'Kaito, YAPS, Twitter, engagement, metrics, analytics'
}

export default function KaitoYapsLayout({
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