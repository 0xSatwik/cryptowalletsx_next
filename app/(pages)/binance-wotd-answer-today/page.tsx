import Link from 'next/link';
import type { Metadata } from 'next';
import AnswerDisplay from './AnswerDisplay';
import { SITE_URL, getBinanceDateInfo } from '@/app/utils/seo';

const PAGE_URL = `${SITE_URL}/binance-wotd-answer-today`;
const KEYWORDS = [
  'binance word of the day answer today',
  'binance wotd answer today',
  'binance word of the day answer',
  'binance wotd answers',
  'binance word of the day theme',
  'binance wodl answers today',
  'binance wotd solver',
];

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  const { ordinalLongDate } = getBinanceDateInfo();
  const title = `Binance Word of the Day Answer for ${ordinalLongDate}`;
  const description = `See the Binance Word of the Day answer for ${ordinalLongDate}, review all supported 3 to 8 letter answers, and jump to the Binance WOTD solver if you want guided hints instead of an instant reveal.`;

  return {
    title,
    description,
    keywords: KEYWORDS,
    alternates: {
      canonical: PAGE_URL,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: PAGE_URL,
      type: 'website',
      siteName: 'WalletsX',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function BinanceWodlAnswerTodayPage() {
  const { isoDate, ordinalLongDate } = getBinanceDateInfo();

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${PAGE_URL}#faq`,
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Where can I find the Binance Word of the Day answer today?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'This page publishes the current Binance Word of the Day answer set and groups the active words by length from 3 to 8 letters.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does Binance WOTD use different word lengths?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Binance WOTD commonly uses 3, 4, 5, 6, 7, and 8 letter puzzles depending on the active campaign or theme.',
        },
      },
      {
        '@type': 'Question',
        name: 'Should I use the answer page or the solver?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use the answer page when you want a direct reveal. Use the Binance WOTD solver when you want to work through the puzzle with hints based on your previous guesses.',
        },
      },
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${PAGE_URL}#collection`,
    name: `Binance Word of the Day Answer for ${ordinalLongDate}`,
    description:
      'Daily Binance WOTD answer page with grouped word lengths, updated answer content, and a direct link to the Binance WOTD solver.',
    url: PAGE_URL,
    dateModified: isoDate,
    inLanguage: 'en',
    about: {
      '@type': 'Thing',
      name: 'Binance Word of the Day',
    },
    isPartOf: {
      '@type': 'WebSite',
      name: 'WalletsX',
      url: SITE_URL,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${PAGE_URL}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Binance WOTD Answer Today',
        item: PAGE_URL,
      },
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${PAGE_URL}#howto`,
    name: 'How to use the Binance Word of the Day answer page',
    description:
      'Quick steps for matching the correct Binance WOTD answer by puzzle length before revealing the final word.',
    totalTime: 'PT1M',
    tool: [
      {
        '@type': 'HowToTool',
        name: 'WalletsX Binance Word of the Day answer page',
      },
    ],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Check the puzzle length',
        text: 'Confirm whether your Binance puzzle is 3, 4, 5, 6, 7, or 8 letters long before opening an answer card.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Reveal the matching section',
        text: 'Open only the card for the word length you need so you can compare the correct answer without scanning unrelated lengths.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Use the solver if you want hints',
        text: 'If you prefer guided elimination instead of a direct answer, switch to the Binance WOTD solver and narrow the list using your current guesses.',
      },
    ],
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${PAGE_URL}#wordlengths`,
    name: 'Supported Binance WOTD answer groups',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: 6,
    itemListElement: [3, 4, 5, 6, 7, 8].map((length, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${length}-letter Binance WOTD answer`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <section className="max-w-4xl mx-auto px-4 pt-10 pb-8" aria-labelledby="binance-wotd-answer-title">
        <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 px-6 py-8 shadow-sm md:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">
            Updated for <time dateTime={isoDate}>{ordinalLongDate}</time>
          </p>
          <h1 id="binance-wotd-answer-title" className="mt-2 text-3xl md:text-4xl font-black tracking-tight text-slate-900">
            Binance Word of the Day Answer for {ordinalLongDate}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-700">
            If you want the <strong>Binance Word of the Day answer today</strong>, this page is built for that exact intent. It gives you a fast route to the current answer set, organizes the live words by puzzle length, and helps you move to the <Link href="/binance-wotd-solver" className="font-semibold text-amber-700 underline underline-offset-4">Binance WOTD solver</Link> when you would rather use hints than a direct reveal.
          </p>
        </div>
      </section>

      <AnswerDisplay />

      <section className="max-w-4xl mx-auto px-4 pb-16" aria-labelledby="binance-wotd-answer-guide">
        <div className="space-y-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 id="binance-wotd-answer-guide" className="text-2xl md:text-3xl font-black text-slate-900">
              How this Binance WOTD answer page is meant to be used
            </h2>
            <div className="mt-5 space-y-4 text-slate-700 leading-8">
              <p>
                The search intent behind "binance word of the day answer today" is direct and urgent. Most visitors are already inside the Binance app, they have reached the daily puzzle, and they want the answer quickly enough to avoid wasting extra time or attempts. That is why the answer block on this page is focused on clarity first. The live widget above groups the current Binance WOTD words by length so you can match the exact puzzle you are seeing, whether you are solving a short three-letter round or a longer eight-letter version.
              </p>
              <p>
                This layout is built to be practical. Instead of forcing you to scan a long article, it keeps the active answers close to the top, groups them by length, and makes it easier to match the exact puzzle you are solving in Binance.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-8">
              <h2 className="text-2xl font-bold text-slate-900">Answer page vs. Binance WOTD solver</h2>
              <div className="mt-4 space-y-4 text-slate-700 leading-8">
                <p>
                  The answer page and the solver page work together, but they do not serve the same purpose. This answer page is for users who want the fastest possible reveal. If your only goal is to finish the daily task and move on, that is the shortest route. The <Link href="/binance-wotd-solver" className="font-semibold text-amber-700 underline underline-offset-4">Binance WOTD solver</Link> is better when you still want to play the puzzle, compare likely candidates, and preserve some challenge.
                </p>
                <p>
                  Keeping both pages separate also makes the experience clearer. This page is for fast answer checks, while the solver page is better when you want to work through the puzzle step by step.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-8">
              <h2 className="text-2xl font-bold text-slate-900">What to check before you reveal the answer</h2>
              <div className="mt-4 space-y-4 text-slate-700 leading-8">
                <p>
                  First, confirm the word length shown in your Binance puzzle. Binance campaigns can rotate between multiple word sizes, and the correct answer for a five-letter puzzle will obviously not match a seven-letter slot. Second, check the active theme or campaign name in the Binance app if it is visible. A theme can help you understand why a word fits and can reduce confusion when multiple crypto-related words look possible.
                </p>
                <p>
                  If you want to avoid a full spoiler, use the answer page only to validate the final stage. In that case, try a couple of guesses inside Binance, then switch to the solver for letter-by-letter narrowing before coming back here for confirmation.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              Common reasons players miss the correct Binance WOTD answer
            </h2>
            <div className="mt-5 space-y-4 text-slate-700 leading-8">
              <p>
                The most common mistake is checking the wrong word length. Binance can rotate between several puzzle sizes, so the answer for one slot will not match another. Before you reveal anything, make sure you are looking at the exact length that appears in your Binance puzzle.
              </p>
              <p>
                Another frequent issue is assuming the theme guarantees an obvious word. Even when the campaign topic looks clear, Binance often uses a less common but still valid crypto-related term. That is why it helps to use the answer list only after confirming the puzzle length and, if needed, comparing it with your earlier guesses.
              </p>
              <p>
                If you want a softer hint instead of a full spoiler, switch to the <Link href="/binance-wotd-solver" className="font-semibold text-amber-700 underline underline-offset-4">Binance WOTD solver</Link>. It lets you narrow down likely words before you reveal the final answer.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Quick usage checklist</h2>
            <ul className="mt-5 space-y-3 text-slate-700 leading-8">
              <li className="flex gap-3">
                <span className="font-bold text-emerald-600" aria-hidden="true">&#10003;</span>
                <span>Match the answer block to the exact Binance puzzle length you are solving.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-emerald-600" aria-hidden="true">&#10003;</span>
                <span>Use this page for a direct answer, and use the solver if you want guided hints first.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-emerald-600" aria-hidden="true">&#10003;</span>
                <span>Refresh the page if Binance changes the active theme or rotates the current answer set.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
