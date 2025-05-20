import { Clock, User, Calendar, ArrowLeft, Tag, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import SocialShareButtons from '@/app/components/SocialShareButtons';

// Article metadata
const articleMetadata = {
  title: "How Monad Testnet Score is Calculated: Complete Guide",
  description: "Learn how the Monad Testnet wallet score is calculated, what factors contribute to your ranking, and how to optimize your on-chain activity for maximum points.",
  author: "WalletsX Team",
  date: "2025-06-15",
  readTime: "10 min read",
  tags: ["Monad", "Testnet", "Wallet Score", "Analytics", "Blockchain"],
  image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
};

// Export metadata for Next.js
export const metadata: Metadata = {
  title: "How Monad Testnet Score is Calculated | WalletsX",
  description: "Learn how the Monad Testnet wallet score is calculated, what factors contribute to your ranking, and how to optimize your on-chain activity for maximum points.",
  keywords: "Monad, Testnet, Wallet Score, Ranking, Blockchain, Analytics, Airdrop, Crypto",
  authors: [{ name: "WalletsX Team" }],
  alternates: {
    canonical: "https://cryptowalletsx.com/post/monad-testnet-score-calculation"
  }
};

export default function MonadScoreCalculationArticle() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Back to articles button */}
      <Link href="/post" className="inline-flex items-center mb-6 text-purple-600 hover:text-purple-800 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to all posts
      </Link>

      <article className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Article header - With gradient background */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 h-72 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="p-6 sm:p-8 text-white w-full">
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">{articleMetadata.title}</h1>
              <p className="text-white/90 text-lg max-w-3xl">{articleMetadata.description}</p>
            </div>
          </div>
        </div>

        {/* Article metadata */}
        <div className="border-b border-gray-200 px-6 py-4 flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <time dateTime={articleMetadata.date}>
              {new Date(articleMetadata.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
          <div className="flex items-center gap-1">
            <User size={16} />
            <span>{articleMetadata.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{articleMetadata.readTime}</span>
          </div>
          <div className="flex-grow"></div>
          <div className="flex items-center gap-2">
            <Share2 size={16} />
            <SocialShareButtons 
              title={articleMetadata.title}
              url="https://cryptowalletsx.com/post/monad-testnet-score-calculation" 
            />
          </div>
        </div>

        {/* Article content */}
        <div className="p-6 sm:p-8 prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-purple-800 mt-0">Understanding the Monad Testnet Score</h2>
          
          <p>
            The Monad Testnet wallet score is a comprehensive metric designed to evaluate your participation and activity on the Monad blockchain. This score helps users understand their engagement level and potentially positions them for future incentives or airdrops. In this article, we'll break down exactly how this score is calculated and what you can do to improve it.
          </p>
          
          <p>
            Our proprietary scoring algorithm analyzes multiple dimensions of on-chain activity, with each component carefully weighted to reward genuine, consistent participation rather than one-time or artificial interactions. We've recently updated our scoring system to better reflect valuable community contributions and long-term engagement.
          </p>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-6 my-8 rounded-r-lg">
            <h3 className="text-xl font-bold text-purple-800 mt-0 mb-3">Score Components at a Glance</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Transaction Activity</strong>: 0.01 points per transaction (capped at 500 transactions)</li>
              <li><strong>Consistency</strong>: Points for unique days, weeks, and months of activity</li>
              <li><strong>Volume</strong>: Tiered points based on MON transaction volume</li>
              <li><strong>Contract Interaction</strong>: Points for creating and interacting with contracts</li>
              <li><strong>Special NFT Bonuses</strong>: Substantial points for holding specific NFTs</li>
              <li><strong>Early User Bonus</strong>: 15 points for wallets active before February 26th, 2025</li>
              <li><strong>Inactivity Penalty</strong>: Deduction for extended periods of inactivity</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-purple-800">Detailed Breakdown of Score Components</h2>
          
          <h3 className="text-xl font-semibold text-gray-800">1. Transaction Activity (Up to 5 Points)</h3>
          
          <p>
            Each transaction on the Monad Testnet earns you 0.01 points, encouraging regular blockchain usage. To prevent manipulation by wallets with excessive transactions, we cap this component at 500 transactions (5 points maximum).
          </p>
          
          <div className="overflow-x-auto my-6">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-purple-50">
                <tr>
                  <th className="py-3 px-4 text-left text-purple-800 font-semibold border-b">Transactions</th>
                  <th className="py-3 px-4 text-left text-purple-800 font-semibold border-b">Points Earned</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4 border-b">50 transactions</td>
                  <td className="py-2 px-4 border-b">0.5 points</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">100 transactions</td>
                  <td className="py-2 px-4 border-b">1.0 points</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">250 transactions</td>
                  <td className="py-2 px-4 border-b">2.5 points</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">500+ transactions</td>
                  <td className="py-2 px-4 border-b">5.0 points (maximum)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-semibold text-gray-800">2. Consistency Metrics</h3>
          
          <p>
            Regular, consistent activity is valued more highly than sporadic bursts. Points are awarded based on the number of unique days, weeks, and months you've been active on the network:
          </p>
          
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li><strong>Unique Days</strong>: 0.1 points per unique day of activity</li>
            <li><strong>Unique Weeks</strong>: 0.25 points per unique week of activity</li>
            <li><strong>Unique Months</strong>: 0.5 points per unique month of activity</li>
          </ul>
          
          <p>
            This means a wallet that has been active for 10 unique days (1.0 points), across 4 unique weeks (1.0 points), and 2 unique months (1.0 points) would earn a total of 3.0 points from consistency metrics.
          </p>

          <h3 className="text-xl font-semibold text-gray-800">3. Volume-Based Points (Up to 1 Point)</h3>
          
          <p>
            The total volume of MON transferred in your transactions contributes to your score, with a tiered system that rewards higher volumes:
          </p>
          
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg my-6">
            <ul className="list-none space-y-3">
              <li className="flex items-center">
                <div className="bg-purple-200 text-purple-800 font-bold rounded-full h-8 w-8 flex items-center justify-center mr-3">1</div>
                <span><strong>0-100 MON</strong>: Up to 0.1 points (scaled linearly)</span>
              </li>
              <li className="flex items-center">
                <div className="bg-purple-300 text-purple-800 font-bold rounded-full h-8 w-8 flex items-center justify-center mr-3">2</div>
                <span><strong>100-200 MON</strong>: 0.1-0.2 points (scaled linearly)</span>
              </li>
              <li className="flex items-center">
                <div className="bg-purple-400 text-purple-800 font-bold rounded-full h-8 w-8 flex items-center justify-center mr-3">3</div>
                <span><strong>200-1000 MON</strong>: 0.2-1.0 points (scaled linearly)</span>
              </li>
              <li className="flex items-center">
                <div className="bg-purple-500 text-white font-bold rounded-full h-8 w-8 flex items-center justify-center mr-3">4</div>
                <span><strong>1000+ MON</strong>: 1.0 points (maximum)</span>
              </li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold text-gray-800">4. Contract Interaction Points</h3>
          
          <p>
            Creating and interacting with smart contracts demonstrates deeper engagement with the Monad ecosystem:
          </p>
          
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li><strong>Contract Creation</strong>: 0.025 points per contract created (capped at 20 contracts for a maximum of 0.5 points)</li>
            <li><strong>Contract Interaction</strong>: 0.03 points per unique contract interacted with (capped at 30 contracts for a maximum of 0.9 points)</li>
          </ul>
          
          <p>
            This rewards both developers who deploy contracts and users who engage with the Monad ecosystem's applications. Our updated scoring system now accurately counts total interaction counts rather than just unique contracts, providing a more comprehensive picture of your ecosystem engagement.
          </p>

          <h3 className="text-xl font-semibold text-gray-800">5. Special NFT Bonuses</h3>
          
          <p>
            Holding certain special NFTs can significantly boost your score with our newly updated bonus point values:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
            <div className="bg-white border border-purple-200 rounded-xl p-6 shadow-md">
              <h4 className="text-lg font-bold text-purple-800 mb-3">1 Million Nad NFT</h4>
              <p className="text-gray-700 mb-3">Holding this special NFT now adds a substantial 20-point bonus to your score!</p>
              <div className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full inline-flex items-center">
                +20 points
              </div>
            </div>
            <div className="bg-white border border-purple-200 rounded-xl p-6 shadow-md">
              <h4 className="text-lg font-bold text-purple-800 mb-3">Monad Cipher SBT</h4>
              <p className="text-gray-700 mb-3">Holding the Monad Games Cipher SBT now adds 20 points to your total score.</p>
              <div className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full inline-flex items-center">
                +20 points
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-800">6. Early User Bonus</h3>
          
          <p>
            We've added a significant bonus for early adopters who have been supporting the Monad ecosystem from the beginning:
          </p>
          
          <div className="bg-green-50 border-l-4 border-green-500 p-6 my-6 rounded-r-lg">
            <p className="text-green-800 font-medium">
              If your wallet had its first transaction before February 26th, 2025, you'll receive a 15-point early user bonus.
            </p>
          </div>
          
          <p>
            Our improved wallet age calculation now uses the earlier timestamp between first outgoing transaction and first incoming transaction, ensuring accurate identification of early users using data from multiple sources.
          </p>

          <h3 className="text-xl font-semibold text-gray-800">7. Inactivity Penalty</h3>
          
          <p>
            To encourage ongoing participation, an inactivity penalty is applied if your wallet hasn't had any transactions for 5 or more days:
          </p>
          
          <div className="bg-red-50 border-l-4 border-red-500 p-6 my-6 rounded-r-lg">
            <p className="text-red-800 font-medium">
              If your most recent transaction was 5 or more days ago, a 0.5 point penalty is applied to your total score.
            </p>
          </div>
          
          <p>
            This ensures that scores reflect current activity levels and encourages regular participation in the testnet.
          </p>

          <h2 className="text-2xl font-bold text-purple-800">Score Calculation Formula</h2>
          
          <p>
            The final score is calculated by combining all the components:
          </p>
          
          <div className="bg-gray-100 p-6 rounded-lg my-6 overflow-x-auto">
            <pre className="text-sm">
              Score = TransactionPoints + ActivityPoints + VolumePoints + ContractPoints + NFTBonuses + EarlyUserBonus - InactivityPenalty
            </pre>
            <p className="mt-4 text-gray-700">Where:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>TransactionPoints = min(totalTransactions, 500) * 0.01</li>
              <li>ActivityPoints = uniqueDays * 0.1 + uniqueWeeks * 0.25 + uniqueMonths * 0.5</li>
              <li>VolumePoints = calculated based on tiered volume system (max 1.0)</li>
              <li>ContractPoints = min(contractsCreated, 20) * 0.025 + min(contractsInteracted, 30) * 0.03</li>
              <li>NFTBonuses = (is1MillionNadHolder ? 20.0 : 0) + (isCipherSBTHolder ? 20.0 : 0)</li>
              <li>EarlyUserBonus = (firstTxBeforeFeb262025 ? 15.0 : 0)</li>
              <li>InactivityPenalty = daysSinceLastTx &gt;= 5 ? 0.5 : 0</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-purple-800">Strategies to Maximize Your Score</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6">
              <h4 className="text-lg font-bold text-purple-800 mb-3">1. Be Consistent</h4>
              <p>
                Rather than doing many transactions in a single day, spread your activity across different days, weeks, and months to maximize consistency points.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6">
              <h4 className="text-lg font-bold text-purple-800 mb-3">2. Interact with Contracts</h4>
              <p>
                Engage with different dApps and smart contracts on Monad to earn contract interaction points. More interactions with each contract count!
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6">
              <h4 className="text-lg font-bold text-purple-800 mb-3">3. Maintain Regular Activity</h4>
              <p>
                Avoid the inactivity penalty by making at least one transaction every 4 days.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6">
              <h4 className="text-lg font-bold text-purple-800 mb-3">4. Acquire Special NFTs</h4>
              <p>
                The 1 Million Nad NFT and Monad Cipher SBT now provide massive 20-point boosts each to your score.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-purple-800">Monitoring Your Score</h2>
          
          <p>
            You can track your Monad Testnet score in real-time using the <a href="/monad-testnet" className="text-purple-600 hover:text-purple-800 font-medium">WalletsX Monad Testnet Stats Checker</a>. This tool provides a comprehensive breakdown of all score components and offers personalized suggestions for improvement. Our system now features improved caching for high-volume wallets and API key rotation to ensure reliable performance.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-8 rounded-r-lg">
            <h4 className="text-lg font-bold text-blue-800 mb-2">Pro Tip</h4>
            <p className="text-blue-800">
              While high transaction counts contribute to your score, quality interactions like contract deployment and diverse contract usage often yield better results than simple transfers. Our updated calculation now properly accounts for all contract interactions.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-purple-800">Conclusion</h2>
          
          <p>
            The Monad Testnet score is designed to reward genuine, consistent participation in the ecosystem. By understanding how the score is calculated, you can optimize your on-chain activity to maximize your ranking. Remember that the scoring system values consistency, diversity of interactions, and long-term engagement over short bursts of activity.
          </p>
          
          <p>
            With our recent scoring updates emphasizing early adoption, NFT ownership, and true engagement metrics, the WalletsX scoring system provides the most comprehensive and accurate assessment of your contribution to the Monad ecosystem.
          </p>
          
          <div className="border-t border-gray-200 mt-8 pt-8">
            <p className="text-sm text-gray-600 italic">
              Last updated: June 15, 2025. This scoring system is subject to change as the Monad Testnet evolves. The WalletsX team will update this article with any significant changes to the scoring algorithm.
            </p>
          </div>
        </div>

        {/* Article tags */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {articleMetadata.tags.map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
              >
                <Tag size={14} className="mr-1" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Author section */}
        <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-xl mr-4">
              {articleMetadata.author.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{articleMetadata.author}</h3>
              <p className="text-sm text-gray-600">Blockchain analyst and crypto metrics specialist</p>
            </div>
          </div>
        </div>
      </article>

      {/* Back to articles button */}
      <div className="mt-8 text-center">
        <Link 
          href="/post" 
          className="inline-flex items-center px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all posts
        </Link>
      </div>
    </div>
  );
} 