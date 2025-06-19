import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Somnia Stats Checker',
  description: 'Check wallet statistics on the Somnia network including transactions, volume, and more.',
  keywords: 'Somnia, wallet stats, blockchain analytics, transaction analysis, Dream network'
}

export default function SomniaLayout({
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