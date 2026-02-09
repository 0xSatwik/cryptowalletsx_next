import type { Metadata } from 'next';
import AnswerDisplay from './AnswerDisplay';
import Solver from './Solver';

// Generate dynamic date for SEO
const today = new Date();
const day = today.getDate();
const getOrdinalSuffix = (d: number) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
};
const monthName = today.toLocaleDateString('en-US', { month: 'long' });
const year = today.getFullYear();
const formattedDate = `${day}${getOrdinalSuffix(day)} ${monthName}, ${year}`;

export const metadata: Metadata = {
    title: `City Holder Answer Today ${formattedDate} | All 10 Trivia Answers`,
    description: `Get all 10 correct City Holder answers for ${formattedDate}. Daily updated trivia answers with archive access to all previous days. 100% verified City Holder answers.`,
    keywords: 'city holder answer today, city holder answers, city holder trivia, city holder game, city holder daily answers, city holder solver',
    openGraph: {
        title: `City Holder Answer Today ${formattedDate}`,
        description: `All 10 correct City Holder trivia answers for ${formattedDate}. Includes full answer archive and question solver.`,
        url: 'https://cryptowalletsx.com/city-holder-answer-today',
        type: 'article',
    }
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "What is City Holder?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "City Holder is a popular trivia game where players answer 10 daily questions on various topics. Each day features a different theme with questions about movies, music, history, and pop culture."
            }
        },
        {
            "@type": "Question",
            "name": "How many questions are in City Holder?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "City Holder features 10 trivia questions per day. Each question has 4 multiple choice options with one correct answer."
            }
        },
        {
            "@type": "Question",
            "name": "How do I find old City Holder answers?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can access the archive by clicking the Calendar button on this page. Select any past date to view all 10 questions and answers from that day."
            }
        },
        {
            "@type": "Question",
            "name": "Are these City Holder answers verified?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! All City Holder answers on this page are 100% verified. We update daily and maintain an archive of all past answers."
            }
        }
    ]
};

const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "City Holder Answer Solver",
    "applicationCategory": "WebApplication",
    "operatingSystem": "Any",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
    },
    "description": "Free online tool to find City Holder trivia answers. Search any question to get the correct answer instantly."
};

export default function CityHolderAnswerTodayPage() {
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
            <AnswerDisplay />
            <Solver />

            {/* SEO Content Section */}
            <section className="max-w-4xl mx-auto px-4 pb-16">
                {/* What is City Holder */}
                <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        What is City Holder?
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        <strong>City Holder</strong> is an exciting daily trivia game that tests your knowledge across a wide range of topics.
                        Each day, players answer 10 multiple-choice questions on themes ranging from movies and music to history and pop culture.
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                        The game updates daily with new questions and themes. Our page provides <strong>100% verified answers</strong> updated
                        every day, plus access to our complete archive of all past questions and answers!
                    </p>
                </div>

                {/* How to Use */}
                <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-200 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        How to Use This Page
                    </h2>
                    <ol className="list-decimal list-inside space-y-3 text-slate-700">
                        <li><strong>View Today&apos;s Answers</strong> &mdash; Click &quot;Reveal Answer&quot; on any question to see the correct answer</li>
                        <li><strong>Access Archive</strong> &mdash; Click the Calendar button to browse answers from any previous day</li>
                        <li><strong>Search Questions</strong> &mdash; Use the Solver below to search for any question and find its answer</li>
                        <li><strong>Reveal All</strong> &mdash; Click &quot;Reveal All&quot; to show all 10 answers at once</li>
                    </ol>
                </div>

                {/* Why Use This Page */}
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        Why Use Our City Holder Answers?
                    </h2>
                    <ul className="space-y-3 text-slate-700">
                        <li className="flex items-start gap-3">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span><strong>100% Verified</strong> &mdash; All answers are confirmed and tested before publishing</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span><strong>Daily Updates</strong> &mdash; Fresh answers every day, available as soon as the new questions go live</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span><strong>Complete Archive</strong> &mdash; Access answers from any past day using our calendar</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span><strong>Powerful Solver</strong> &mdash; Can&apos;t find a question? Search our database of all past questions</span>
                        </li>
                    </ul>
                </div>
            </section>
        </>
    );
}
