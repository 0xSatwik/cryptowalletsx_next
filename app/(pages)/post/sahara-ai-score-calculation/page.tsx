import { Clock, User, Calendar, ArrowLeft, Tag, Share2, TrendingUp, Zap, Cpu, Coins, Gift, Eye, FileText } from 'lucide-react';
import Link from '@/app/components/Link';
import { Metadata } from 'next';
import SocialShareButtons from '@/app/components/SocialShareButtons';

// Article metadata
const articleMetadata = {
  title: "Sahara AI Testnet Score: Unveiling the Calculation Method",
  description: "Discover how your Sahara AI Testnet wallet score is calculated. This guide explains all contributing factors, from transactions and volume to contract interactions and wallet age.",
  author: "WalletsX Team",
  date: "2024-07-27", // Assuming current date for creation
  readTime: "8 min read",
  tags: ["Sahara AI", "Testnet", "Wallet Score", "SAHARA", "Blockchain Analytics", "Crypto Score"],
  image: "https://images.unsplash.com/photo-1639755982994-8825056a25c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" // Placeholder image, replace if needed
};

// Export metadata for Next.js
export const metadata: Metadata = {
  title: `${articleMetadata.title} | WalletsX`,
  description: articleMetadata.description,
  keywords: articleMetadata.tags.join(", "),
  authors: [{ name: articleMetadata.author }],
  alternates: {
    canonical: "https://cryptowalletsx.com/post/sahara-ai-score-calculation"
  },
  openGraph: {
    title: `${articleMetadata.title} | WalletsX`,
    description: articleMetadata.description,
    url: "https://cryptowalletsx.com/post/sahara-ai-score-calculation",
    images: [
      {
        url: articleMetadata.image,
        width: 1200,
        height: 630,
        alt: articleMetadata.title,
      },
    ],
    locale: 'en_US',
    type: 'article',
    publishedTime: articleMetadata.date,
    authors: [articleMetadata.author],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${articleMetadata.title} | WalletsX`,
    description: articleMetadata.description,
    images: [articleMetadata.image],
    creator: '@cryptowalletsx',
  },
};

export default function SaharaAiScoreCalculationArticle() {
  const CHAIN_NAME = "Sahara AI Testnet";
  const TOKEN_SYMBOL = "$SAHARA";

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Link href="/post" className="inline-flex items-center mb-8 text-green-600 hover:text-green-800 transition-colors group">
        <ArrowLeft className="mr-2 h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
        Back to all posts
      </Link>

      <article className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div className="relative">
          <img src={articleMetadata.image} alt={articleMetadata.title} className="w-full h-56 sm:h-72 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 drop-shadow-md">{articleMetadata.title}</h1>
          </div>
        </div>

        <div className="border-b border-gray-200 px-6 py-4 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-500 items-center">
          <div className="flex items-center gap-1.5">
            <User size={16} />
            <span>{articleMetadata.author}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={16} />
            <time dateTime={articleMetadata.date}>
              {new Date(articleMetadata.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={16} />
            <span>{articleMetadata.readTime}</span>
          </div>
          <div className="flex-grow"></div>
          <div className="flex items-center gap-2">
            <Share2 size={16} className="text-gray-600" />
            <SocialShareButtons
              title={articleMetadata.title}
              url={`https://cryptowalletsx.com/post/sahara-ai-score-calculation`}
            />
          </div>
        </div>

        <div className="p-6 sm:p-8 prose prose-lg max-w-none prose-headings:text-green-700 prose-a:text-green-600 hover:prose-a:text-green-700 prose-strong:text-gray-700">
          <p className="lead text-xl text-gray-600">
            The {CHAIN_NAME} is buzzing with activity, and understanding how your engagement translates into a quantifiable score is key. This guide breaks down the WalletsX scoring system for {TOKEN_SYMBOL} wallets, helping you optimize your on-chain presence.
          </p>

          <h2 className="flex items-center"><TrendingUp size={28} className="mr-3 text-green-600" />Understanding Your Score</h2>
          <p>
            Our scoring algorithm is designed to reward genuine and consistent participation on the {CHAIN_NAME}. It considers a variety of on-chain metrics, each weighted to reflect meaningful contributions to the ecosystem.
          </p>

          <div className="bg-green-50 border-l-4 border-green-500 p-6 my-8 rounded-r-lg shadow-sm">
            <h3 className="text-xl font-semibold text-green-800 mt-0 mb-4 flex items-center"><Zap size={22} className="mr-2" />Core Scoring Components:</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li><strong>Transaction Points</strong>: Based on the number of transactions.</li>
              <li><strong>Activity Consistency</strong>: Rewards for unique days, weeks, and months of activity.</li>
              <li><strong>Wallet Age Bonus</strong>: Extra points for wallets active for over three months.</li>
              <li><strong>Contract Engagement</strong>: Points for interacting with and deploying smart contracts.</li>
              <li><strong>Volume Score</strong>: Reflects the total {TOKEN_SYMBOL} volume transacted.</li>
            </ul>
          </div>

          <h2>Detailed Score Calculation</h2>

          <h3 className="flex items-center"><FileText size={22} className="mr-2 text-green-600" />1. Transaction Points (Max: 100 Points)</h3>
          <p>
            Each transaction you make on the {CHAIN_NAME} contributes to your score. This encourages regular use of the network.
          </p>
          <ul className="list-disc pl-5 space-y-1 mb-4 text-gray-700">
            <li>Points per transaction: <strong>0.1 points</strong></li>
            <li>Maximum points from transactions: <strong>100 points</strong> (i.e., capped at 1,000 transactions)</li>
          </ul>
          <p><em>Example: 500 transactions would yield 50 points.</em></p>

          <h3 className="flex items-center"><Calendar size={22} className="mr-2 text-green-600" />2. Activity Consistency (No Cap)</h3>
          <p>
            Sustained engagement is key. We reward activity spread over time:
          </p>
          <ul className="list-disc pl-5 space-y-1 mb-4 text-gray-700">
            <li>Unique Days Active: <strong>0.5 points</strong> per day</li>
            <li>Unique Weeks Active: <strong>0.7 points</strong> per week</li>
            <li>Unique Months Active: <strong>1.0 point</strong> per month</li>
          </ul>
          <p><em>Example: Activity on 10 unique days (5 pts), 4 unique weeks (2.8 pts), and 2 unique months (2 pts) totals 9.8 consistency points.</em></p>

          <h3 className="flex items-center"><Gift size={22} className="mr-2 text-green-600" />3. Wallet Age Bonus (5 Points)</h3>
          <p>
            Long-term participants receive a special bonus:
          </p>
          <ul className="list-disc pl-5 space-y-1 mb-4 text-gray-700">
            <li>If your wallet's first transaction (either sent or received) was more than 3 months ago: <strong>+5 points</strong></li>
          </ul>

          <h3 className="flex items-center"><Cpu size={22} className="mr-2 text-green-600" />4. Contract Engagement</h3>
          <p>
            Interacting with the {CHAIN_NAME} ecosystem's smart contracts is a vital activity:
          </p>
          <ul className="list-disc pl-5 space-y-1 mb-4 text-gray-700">
            <li><strong>Unique Contract Interactions</strong>: <strong>0.5 points</strong> per unique contract interacted with.
              <ul><li>Maximum points: <strong>50 points</strong> (i.e., capped at 100 unique contracts).</li></ul>
            </li>
            <li><strong>Contract Deployments</strong>: <strong>0.5 points</strong> per contract deployed.
              <ul><li>Maximum points: <strong>5 points</strong> (i.e., capped at 10 deployed contracts).</li></ul>
            </li>
          </ul>

          <h3 className="flex items-center"><Coins size={22} className="mr-2 text-green-600" />5. Volume Score (Max: 1000 Points)</h3>
          <p>
            The total volume of {TOKEN_SYMBOL} moved by your wallet also contributes significantly:
          </p>
          <ul className="list-disc pl-5 space-y-1 mb-4 text-gray-700">
            <li>Points per 1 {TOKEN_SYMBOL} of volume: <strong>0.01 points</strong></li>
            <li>Maximum points from volume: <strong>1000 points</strong> (i.e., capped at 100,000 {TOKEN_SYMBOL} volume)</li>
          </ul>
          <p><em>Example: A total volume of 5,000 {TOKEN_SYMBOL} would yield 50 points.</em></p>

          <h2 className="flex items-center"><TrendingUp size={28} className="mr-3 text-green-600" />Score Calculation Formula Summary</h2>
          <div className="bg-gray-100 p-6 rounded-lg my-6 shadow-inner overflow-x-auto">
            <pre className="text-sm whitespace-pre-wrap break-words">{
              `Score = 
  MIN(TotalTransactions * 0.1, 100) +
  (UniqueDays * 0.5) +
  (UniqueWeeks * 0.7) +
  (UniqueMonths * 1.0) +
  (IsWalletOlderThan3Months ? 5 : 0) +
  MIN(UniqueContractsInteracted * 0.5, 50) +
  MIN(ContractsDeployed * 0.5, 5) +
  MIN(TotalVolumeInSahara * 0.01, 1000)`
            }</pre>
          </div>

          <h2 className="flex items-center"><Eye size={28} className="mr-3 text-green-600" />Monitoring Your Score</h2>
          <p>
            Stay updated on your {CHAIN_NAME} performance by using the <Link href="/sahara-ai-stats-checker">WalletsX {CHAIN_NAME} Stats Checker</Link>.
            Our tool provides a detailed breakdown of your score components, helping you identify areas for improvement. We regularly update our platform to ensure accuracy and provide the best insights into your on-chain activity.
          </p>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 my-8 rounded-r-lg shadow-sm">
            <h4 className="text-lg font-semibold text-yellow-800 mt-0 mb-2">Important Note:</h4>
            <p className="text-yellow-700">
              This scoring system is specific to the WalletsX {CHAIN_NAME} Stats Checker and is designed for informational and engagement purposes. Scoring methodologies can vary across different platforms and may be subject to change as the {CHAIN_NAME} evolves.
            </p>
          </div>

          <h2>Conclusion</h2>
          <p>
            Understanding the WalletsX {CHAIN_NAME} score can help you tailor your testnet activities for better engagement. By focusing on consistent transactions, diverse contract interactions, responsible volume, and long-term participation, you can effectively enhance your on-chain footprint.
          </p>

          <div className="border-t border-gray-200 mt-10 pt-8">
            <p className="text-sm text-gray-500 italic">
              Last updated: {new Date(articleMetadata.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. The WalletsX team will strive to keep this guide current with any significant adjustments to the scoring algorithm.
            </p>
          </div>
        </div>

        <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
          <h3 className="text-md font-semibold text-gray-700 mb-3">Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {articleMetadata.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200 shadow-sm"
              >
                <Tag size={14} className="mr-1.5" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>

      <div className="mt-10 text-center">
        <Link
          href="/post"
          className="inline-flex items-center px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
          <ArrowLeft className="mr-2 h-5 w-5" />
          View All Blog Posts
        </Link>
      </div>
    </div>
  );
} 