import { Metadata } from 'next';
import { metadata } from './metadata';

export { metadata };

export default function FogoStatsCheckerLayout({
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
            "name": "Fogo Chain Stats Checker",
            "description": "Comprehensive Fogo Chain wallet analyzer and stats checker. Check FogoChain wallet rank, activity, transaction history, and on-chain analytics.",
            "url": "https://cryptowalletsx.com/fogo-stats-checker",
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
              "Fogo Chain wallet stats checking",
              "FogoChain rank analysis",
              "Transaction history tracking",
              "Staking rewards calculation",
              "Portfolio analytics",
              "On-chain activity monitoring",
              "Wallet performance metrics",
              "Real-time blockchain data"
            ],
            "screenshot": "https://cryptowalletsx.com/og-fogo-stats-checker.jpg",
            "softwareVersion": "1.0",
            "datePublished": "2025-01-23",
            "dateModified": "2025-01-23",
            "inLanguage": "en-US",
            "isAccessibleForFree": true,
            "keywords": "fogo chain stats checker, fogochain rank checker, fogo stats, fogochain wallet rank, fogochain activity checker"
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
                "name": "Fogo Chain Stats Checker",
                "item": "https://cryptowalletsx.com/fogo-stats-checker"
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
                "name": "What is Fogo Chain Stats Checker?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Fogo Chain Stats Checker is a comprehensive wallet analyzer that provides detailed analytics for FogoChain addresses including transaction history, staking rewards, wallet rank, and on-chain activity metrics."
                }
              },
              {
                "@type": "Question", 
                "name": "How do I check my FogoChain wallet rank?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Simply enter your FogoChain wallet address in our stats checker tool. It will analyze your wallet activity, transaction volume, staking history, and provide comprehensive ranking metrics."
                }
              },
              {
                "@type": "Question",
                "name": "Is the Fogo stats checker free to use?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, our FogoChain stats checker is completely free to use. You can analyze any Fogo wallet address without any registration or fees."
                }
              },
              {
                "@type": "Question",
                "name": "What data does the FogoChain activity checker show?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our tool shows comprehensive wallet analytics including FOGO balance, transaction history, staking rewards, unique activity periods, total volume, validator status, and detailed on-chain metrics."
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
