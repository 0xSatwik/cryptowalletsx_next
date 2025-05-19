import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | WalletsX - Multi-Chain Analytics Platform',
  description: 'Learn about WalletsX, a comprehensive multi-chain analytics platform providing wallet tracking and blockchain statistics across various networks.'
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
} 