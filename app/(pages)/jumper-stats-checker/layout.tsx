import { Metadata } from 'next';
import { metadata } from './metadata';

export { metadata };

export default function JumperStatsCheckerLayout({
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
            "name": "Jumper Stats Checker",
            "description": "Comprehensive Jumper Exchange wallet analyzer and stats checker. Check Jumper wallet rank, activity, transaction history, and bridge analytics.",
            "url": "https://cryptowalletsx.com/jumper-stats-checker",
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
              "Jumper Exchange wallet stats checking",
              "Jumper rank analysis",
              "Bridge transaction tracking",
              "Cross-chain DeFi analytics",
              "Portfolio monitoring",
              "On-chain activity analysis",
              "Wallet performance metrics",
              "Real-time blockchain data"
            ],
            "screenshot": "https://cryptowalletsx.com/og-jumper-stats-checker.jpg",
            "softwareVersion": "1.0",
            "datePublished": "2025-01-23",
            "dateModified": "2025-01-23",
            "inLanguage": "en-US",
            "isAccessibleForFree": true,
            "keywords": "jumper stats checker, jumper exchange rank checker, jumper stats, jumper wallet rank, jumper activity checker"
          })
        }}
      />
      
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://cryptowalletsx.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Web3 Tools",
                "item": "https://cryptowalletsx.com/web3-tools"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Jumper Stats Checker",
                "item": "https://cryptowalletsx.com/jumper-stats-checker"
              }
            ]
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
                "name": "What is Jumper Stats Checker?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Jumper Stats Checker is a comprehensive wallet analyzer that provides detailed analytics for Jumper Exchange addresses including bridge transactions, cross-chain DeFi activity, wallet rank, and on-chain metrics."
                }
              },
              {
                "@type": "Question", 
                "name": "How do I check my Jumper Exchange wallet rank?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Simply enter your wallet address in our Jumper stats checker tool. It will analyze your Jumper Exchange activity, bridge transactions, DeFi volume, and provide comprehensive ranking metrics."
                }
              },
              {
                "@type": "Question",
                "name": "Is the Jumper stats checker free to use?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, our Jumper Exchange stats checker is completely free to use. You can analyze any wallet address for Jumper activity without any registration or fees."
                }
              },
              {
                "@type": "Question",
                "name": "What data does the Jumper activity checker show?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our tool shows comprehensive wallet analytics including bridge transactions, cross-chain DeFi activity, transaction volume, wallet ranking, and detailed on-chain metrics across multiple networks."
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
