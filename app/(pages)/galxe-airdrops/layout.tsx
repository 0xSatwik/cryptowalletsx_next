import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Galxe Airdrop Tracker',
  description: 'Track your Galxe airdrops and points across multiple projects. Check which campaigns you\'ve participated in and your total points.',
  keywords: 'Galxe, airdrops, points, campaigns, crypto, blockchain, tracker'
}

export default function GalxeAirdropsLayout({
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