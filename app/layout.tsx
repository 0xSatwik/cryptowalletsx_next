import './globals.css';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePageWrapper from './components/layout/HomePageWrapper';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | WalletsX',
    default: 'WalletsX - Crypto Wallet Analytics',
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
      <head>
        {/* Google Analytics (gtag.js) */}
        <Script 
          strategy="afterInteractive" 
          src="https://www.googletagmanager.com/gtag/js?id=G-CS1FC8P6WF" 
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-CS1FC8P6WF');
            `,
          }}
        />

        {/* Google AdSense */}
        <Script 
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8421191784631095"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
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