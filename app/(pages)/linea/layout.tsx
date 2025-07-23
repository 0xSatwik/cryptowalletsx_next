import { Metadata } from 'next';
import { metadata } from './metadata';

export { metadata };

export default function LineaStatsCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Additional SEO Meta Tags */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Linea Stats Checker",
            "description": "Comprehensive Linea Network wallet analyzer and stats checker. Check Linea wallet rank, activity, transaction history, and L2 analytics.",
            "url": "https://cryptowalletsx.com/linea",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "creator": {
              "@type": "Organization",
              "name": "CryptoWalletsX",
              "url": "https://cryptowalletsx.com"
            },
            "featureList": [
              "Linea Network wallet stats checking",
              "Linea rank analysis",
              "L2 transaction tracking",
              "Bridge analytics",
              "Portfolio monitoring",
              "On-chain activity analysis",
              "Wallet performance metrics",
              "Real-time blockchain data"
            ],
            "screenshot": "https://cryptowalletsx.com/og-linea-stats-checker.jpg",
            "softwareVersion": "1.0",
            "datePublished": "2025-01-23",
            "dateModified": "2025-01-23",
            "inLanguage": "en-US",
            "isAccessibleForFree": true,
            "keywords": "linea stats checker, linea network rank checker, linea stats, linea wallet rank, linea activity checker"
          })
        }}
      />

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is Linea Stats Checker?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Linea Stats Checker is a comprehensive wallet analyzer that provides detailed analytics for Linea Network addresses including L2 transactions, bridge activity, wallet rank, and on-chain metrics."
                }
              },
              {
                "@type": "Question",
                "name": "How do I check my Linea Network wallet rank?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Simply enter your Linea Network wallet address in our stats checker tool. It will analyze your L2 activity, bridge transactions, transaction volume, and provide comprehensive ranking metrics."
                }
              },
              {
                "@type": "Question",
                "name": "Is the Linea stats checker free to use?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, our Linea Network stats checker is completely free to use. You can analyze any Linea wallet address without any registration or fees."
                }
              }
            ]
          })
        }}
      />

      {children}
    </>
  );
}