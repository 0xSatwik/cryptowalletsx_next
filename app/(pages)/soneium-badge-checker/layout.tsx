import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Soneium Badge Checker | Ecosystem & OG Badge Checker Tool',
  description: 'Check which Soneium ecosystem badges and OG badges you own with our comprehensive Soneium Badge Checker. Track your badge collection across the Soneium network easily.',
  keywords: 'Soneium badge checker, Soneium ecosystem badge checker, Soneium OG checker, Soneium badges, Soneium NFT, Soneium Badge Collection, Soneium Network badges',
  openGraph: {
    type: 'website',
    url: 'https://cryptowalletsx.com/soneium-badge-checker',
    title: 'Soneium Ecosystem and OGBadge Checker',
    description: 'Check which Soneium ecosystem badges and OG badges you own with our comprehensive Soneium Badge Checker. Verify your Soneium ecosystem badges instantly.'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Soneium Badge Checker | Ecosystem & OG Badge Verification Tool',
    description: 'Check which Soneium ecosystem badges and OG badges you own with our comprehensive Soneium Badge Checker. Verify your Soneium badge collection instantly.'
  }
}

export default function SoneiumBadgeCheckerLayout({
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