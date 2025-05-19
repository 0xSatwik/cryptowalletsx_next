import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | WalletsX - Multi-Chain Analytics Platform',
  description: 'Get in touch with the WalletsX team for support, feedback, or collaboration opportunities.'
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
} 