import type { Metadata } from 'next';
import Solver from './Solver';

export const metadata: Metadata = {
    title: 'Binance Word of the Day (WOTD) Solver - Get Daily Answers',
    description: 'Use our free Binance WOTD Solver to find the Word of the Day answer. Supports 3-8 letter words, Hard Mode, and Most Likely answer suggestions.',
    keywords: 'binance wotd solver, binance word of the day answer, binance wotd answers, crypto wordle solver, binance word list',
    openGraph: {
        title: 'Binance WOTD Solver | WalletsX',
        description: 'Get today\'s Binance Word of the Day answer instantly with our advanced solver.',
    }
};

// SoftwareApplication Schema
const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Binance WOTD Solver",
    "applicationCategory": "WebApplication",
    "operatingSystem": "Any",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
    },
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "150"
    },
    "description": "Free online tool to solve the Binance Word of the Day puzzle. Supports 3-8 letter words, Hard Mode, and Most Likely answer suggestions.",
    "url": "https://cryptowalletsx.com/binance-wotd-solver"
};

// FAQPage Schema
const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "What is the Binance Word of the Day (WOTD)?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Binance Word of the Day is a daily word puzzle game offered by Binance where users guess a crypto-related word to earn rewards. It's similar to Wordle but focused on cryptocurrency terminology."
            }
        },
        {
            "@type": "Question",
            "name": "How does this WOTD Solver work?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Enter your guesses and mark each letter as Green (correct position), Yellow (wrong position), or Grey (not in word). The solver analyzes remaining possibilities and suggests the best next guesses to help you find the answer."
            }
        },
        {
            "@type": "Question",
            "name": "What word lengths are supported?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "The solver supports words from 3 to 8 letters long, covering all possible Binance WOTD puzzle variations."
            }
        },
        {
            "@type": "Question",
            "name": "What is Hard Mode?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Hard Mode is an option that requires any revealed hints (green and yellow letters) to be used in subsequent guesses. This makes the puzzle more challenging but helps narrow down answers faster."
            }
        },
        {
            "@type": "Question",
            "name": "What is the difference between All Words and Most Likely?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "\"Most Likely\" shows only common words that are likely to be puzzle answers, while \"All Words\" includes the full dictionary of valid guesses including obscure words."
            }
        }
    ]
};

export default function BinanceWotdPage() {
    return (
        <>
            {/* SoftwareApplication Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
            />
            {/* FAQPage Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <Solver />
        </>
    );
}
