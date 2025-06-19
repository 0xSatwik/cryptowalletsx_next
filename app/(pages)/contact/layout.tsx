import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | WalletsX',
  description: 'Get in touch with the WalletsX team for support, feedback, or collaboration opportunities.'
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
} 