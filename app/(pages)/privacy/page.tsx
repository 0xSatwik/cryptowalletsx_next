import Head from 'next/head';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | WalletsX - Multi-Chain Analytics Platform</title>
        <meta name="description" content="WalletsX Privacy Policy - Learn how we handle and protect your data across our multi-chain analytics tools." />
      </Head>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed">
              At WalletsX, we take your privacy seriously. This policy outlines how we collect, use, 
              and protect your information when you use our multi-chain analytics services and tools.
              Last updated: May 2024.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Public blockchain data from multiple networks including Monad, LayerZero, Linea, and others</li>
              <li>Wallet addresses provided by users for analysis</li>
              <li>Basic usage analytics to improve our service</li>
              <li>Cross-chain interaction data for protocol analysis</li>
              <li>Chain-specific statistics for various networks</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed">
              We only use the collected information to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mt-2">
              <li>Display multi-chain wallet statistics and activity</li>
              <li>Show protocol interactions and chain-specific metrics</li>
              <li>Provide airdrop eligibility information</li>
              <li>Improve our services and user experience</li>
              <li>Deliver cross-chain analytics and insights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate security measures to protect your information. All blockchain data we analyze 
              is publicly available on respective networks, and we do not store any private keys or sensitive 
              wallet information. Our multi-chain approach ensures transparent and secure analytics across networks.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed">
              Our tools may utilize third-party APIs and services to retrieve blockchain data. These services are chosen 
              with care to ensure data accuracy and reliability. We do not share any user-submitted information with these 
              services beyond what is necessary to provide our analytics functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this privacy policy from time to time as our tools and services evolve. We will notify users of any material 
              changes by posting the new privacy policy on this page. We encourage users to review our privacy policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this privacy policy or how we handle your data, please contact us:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mt-2">
              <li>Email: <a href="mailto:team@cryptowalletsx.com" className="text-blue-600 hover:text-blue-700">team@cryptowalletsx.com</a></li>
              <li>Telegram: <a href="https://t.me/cwxstats" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">@cwxstats</a></li>
              <li>Twitter: <a href="https://x.com/0xSatwik" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">@0xSatwik</a></li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}