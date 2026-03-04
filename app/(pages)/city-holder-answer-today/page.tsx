import Link from 'next/link';
import type { Metadata } from 'next';
import AnswerDisplay from './AnswerDisplay';
import Solver from './Solver';
import { SITE_URL, getSeoDateInfo } from '@/app/utils/seo';

const PAGE_URL = `${SITE_URL}/city-holder-answer-today`;
const KEYWORDS = [
  'city holder answer today',
  'city holder answers',
  'city holder trivia answers',
  'city holder daily answers',
  'city holder solver',
  'city holder answer archive',
];

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  const { shortDate } = getSeoDateInfo();
  const title = `City Holder Answer Today for ${shortDate} | 10 Trivia Answers`;
  const description = `Get the City Holder answer today for ${shortDate}, review all 10 trivia answers, and use the City Holder solver to search archived questions faster.`;

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

export default function CityHolderAnswerTodayPage() {
  const { isoDate, shortDate, longDate } = getSeoDateInfo();

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${PAGE_URL}#faq`,
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How many answers are published on the City Holder answer page?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The page is designed around the standard City Holder set of 10 daily trivia answers and also provides archive access for older dates.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I look up past City Holder questions?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The archive controls and the search tool on this page let you move through previous dates and search older questions when you need a past answer.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does the City Holder solver do?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The City Holder solver searches the stored question archive so you can type part of a question or answer and quickly find the matching result.',
        },
      },
    ],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${PAGE_URL}#software`,
    name: 'City Holder Answer Solver',
    applicationCategory: 'WebApplication',
    applicationSubCategory: 'Trivia Answer Finder',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Daily City Holder answer lookup',
      'Archive access by date',
      'Question and answer search',
      'Quick reveal for all 10 trivia answers',
    ],
    description:
      'Free web tool for browsing daily City Holder trivia answers and searching archived questions.',
    url: PAGE_URL,
    mainEntityOfPage: {
      '@id': `${PAGE_URL}#collection`,
    },
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${PAGE_URL}#collection`,
    name: `City Holder Answer Today for ${shortDate}`,
    description:
      'Daily City Holder answer page with archived trivia answers and a built-in search tool.',
    url: PAGE_URL,
    dateModified: isoDate,
    inLanguage: 'en',
    mainEntity: {
      '@id': `${PAGE_URL}#software`,
    },
    about: {
      '@type': 'Thing',
      name: 'City Holder daily trivia',
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
        name: 'City Holder Answer Today',
        item: PAGE_URL,
      },
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${PAGE_URL}#howto`,
    name: 'How to use the City Holder answer page',
    description:
      'Quick steps for checking today\'s City Holder answers, opening the archive, and searching older questions.',
    totalTime: 'PT2M',
    tool: [
      {
        '@type': 'HowToTool',
        name: 'WalletsX City Holder answer page',
      },
    ],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Open the current day',
        text: 'View the current City Holder set and reveal the exact answer you need, or use the reveal-all button for the full list.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Use the archive calendar',
        text: 'If you need a previous day, open the calendar and choose the date you want to load.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Search older questions',
        text: 'Use the solver search box when you remember only part of a question or answer and want the closest historical match.',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
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

      <section className="max-w-4xl mx-auto px-4 pt-10 pb-8" aria-labelledby="city-holder-answer-title">
        <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 px-6 py-8 shadow-sm md:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-700">
            Updated for <time dateTime={isoDate}>{longDate}</time>
          </p>
          <h1 id="city-holder-answer-title" className="mt-2 text-3xl md:text-4xl font-black tracking-tight text-slate-900">
            City Holder Answer Today
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-700">
            This page is a utility hub for the daily City Holder game. You can review all 10 active answers, open the archive for older dates, and use the built-in <a href="#city-holder-solver" className="font-semibold text-violet-700 underline underline-offset-4">City Holder solver</a> to search past questions without manually digging through older entries.
          </p>
        </div>
      </section>

      <AnswerDisplay />
      <Solver />

      <section className="max-w-4xl mx-auto px-4 pb-16" aria-labelledby="city-holder-answer-guide">
        <div className="space-y-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 id="city-holder-answer-guide" className="text-2xl md:text-3xl font-black text-slate-900">
              How this City Holder page is structured
            </h2>
            <div className="mt-5 space-y-4 text-slate-700 leading-8">
              <p>
                City Holder is a daily trivia format, so the strongest version of this page is one that handles both immediate answers and older lookups. The live answer section is built for quick checking when you need the current set, while the archive controls help users move back to a previous day without leaving the page. That is a better experience than a simple text list because the page works for both "today" intent and archive intent.
              </p>
              <p>
                If you know the exact date, the archive is usually the fastest route. If you only remember part of a question, the search tool below is better because it can pull the matching result from older entries without forcing you to browse day by day.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-violet-100 bg-violet-50 p-8">
              <h2 className="text-2xl font-bold text-slate-900">Best way to use the archive</h2>
              <p className="mt-4 text-slate-700 leading-8">
                If you are looking for a past City Holder answer, start with the calendar in the answer panel above. That is the fastest way to jump directly to a known date. If you only remember part of the question, use the search tool below instead. The archive and search features together cover the two main user paths for this type of game page.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-8">
              <h2 className="text-2xl font-bold text-slate-900">Why the solver matters</h2>
              <p className="mt-4 text-slate-700 leading-8">
                A searchable solver increases the value of the page because it turns the archive into a practical tool. Instead of scrolling through multiple days, users can search a keyword, movie title, person name, or partial answer and land on the most relevant match. That keeps the page useful after the daily round has changed.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Related navigation</h2>
            <p className="mt-4 text-slate-700 leading-8">
              If you are also working on Binance daily puzzles, the <Link href="/binance-wotd-solver" className="font-semibold text-violet-700 underline underline-offset-4">Binance WOTD solver</Link> and <Link href="/binance-wotd-answer-today" className="font-semibold text-violet-700 underline underline-offset-4">Binance Word of the Day answer page</Link> are available as dedicated utility pages as well.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
