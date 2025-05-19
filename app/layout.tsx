import './globals.css';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePageWrapper from './components/layout/HomePageWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Wallets.X0',
    default: 'Wallets.X0 - Crypto Wallet Analytics',
  },
  description: 'Comprehensive analytics for your crypto wallets across multiple platforms and ecosystems.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="mt-4">
            <HomePageWrapper>
              {children}
            </HomePageWrapper>
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
} 