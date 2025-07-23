import { Metadata } from 'next';
import { metadata } from './metadata';

export { metadata };

export default function LayerZeroStatsCheckerLayout({
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
            "name": "LayerZero Stats Checker",
            "description": "Comprehensive LayerZero wallet analyzer and stats checker. Check LayerZero wallet rank, activity, transaction history, and omnichain analytics.",
            "url": "https://cryptowalletsx.com/layerzero-stats",
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
              "LayerZero wallet stats checking",
              "LayerZero rank analysis",
              "Omnichain transaction tracking",
              "Cross-chain analytics",
              "Portfolio monitoring",
              "On-chain activity analysis",
              "Wallet performance metrics",
              "Real-time blockchain data"
            ],
            "screenshot": "https://cryptowalletsx.com/og-layerzero-stats-checker.jpg",
            "softwareVersion": "1.0",
            "datePublished": "2025-01-23",
            "dateModified": "2025-01-23",
            "inLanguage": "en-US",
            "isAccessibleForFree": true,
            "keywords": "layerzero stats checker, layerzero rank checker, layerzero stats, layerzero wallet rank, layerzero activity checker"
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
                "name": "What is LayerZero Stats Checker?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "LayerZero Stats Checker is a comprehensive wallet analyzer that provides detailed analytics for LayerZero protocol addresses including omnichain transactions, cross-chain activity, wallet rank, and on-chain metrics."
                }
              },
              {
                "@type": "Question",
                "name": "How do I check my LayerZero wallet rank?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Simply enter your wallet address in our LayerZero stats checker tool. It will analyze your LayerZero protocol activity, omnichain transactions, cross-chain volume, and provide comprehensive ranking metrics."
                }
              },
              {
                "@type": "Question",
                "name": "Is the LayerZero stats checker free to use?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, our LayerZero stats checker is completely free to use. You can analyze any wallet address for LayerZero activity without any registration or fees."
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