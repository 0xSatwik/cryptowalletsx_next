import { Metadata } from 'next';
import { metadata } from './metadata';

export { metadata };

export default function PharosStatsCheckerLayout({
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
            "name": "Pharos Stats Checker",
            "description": "Comprehensive Pharos Testnet wallet analyzer and stats checker. Check Pharos wallet rank, activity, transaction history, and testnet analytics.",
            "url": "https://cryptowalletsx.com/pharos-stats-checker",
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
              "Pharos Testnet wallet stats checking",
              "Pharos rank analysis",
              "Testnet transaction tracking",
              "Validator activity analytics",
              "Portfolio monitoring",
              "On-chain activity analysis",
              "Wallet performance metrics",
              "Real-time testnet data"
            ],
            "screenshot": "https://cryptowalletsx.com/og-pharos-stats-checker.jpg",
            "softwareVersion": "1.0",
            "datePublished": "2025-01-23",
            "dateModified": "2025-01-23",
            "inLanguage": "en-US",
            "isAccessibleForFree": true,
            "keywords": "pharos stats checker, pharos testnet rank checker, pharos stats, pharos wallet rank, pharos activity checker"
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
                "name": "What is Pharos Stats Checker?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Pharos Stats Checker is a comprehensive wallet analyzer that provides detailed analytics for Pharos Testnet addresses including testnet transactions, validator activity, wallet rank, and on-chain metrics."
                }
              },
              {
                "@type": "Question",
                "name": "How do I check my Pharos Testnet wallet rank?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Simply enter your Pharos Testnet wallet address in our stats checker tool. It will analyze your testnet activity, validator participation, transaction volume, and provide comprehensive ranking metrics."
                }
              },
              {
                "@type": "Question",
                "name": "Is the Pharos stats checker free to use?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, our Pharos Testnet stats checker is completely free to use. You can analyze any Pharos wallet address without any registration or fees."
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