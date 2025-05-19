'use client';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">About WalletsX</h1>
      
      <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            WalletsX is dedicated to providing comprehensive and user-friendly analytics across multiple blockchain networks. 
            Our platform enables users to track their wallet statistics, token holdings, and cross-chain activity in real-time, 
            making blockchain data accessible and meaningful for both newcomers and experienced users.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Features</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Multi-chain wallet statistics tracking</li>
            <li>Real-time balance monitoring across networks</li>
            <li>Protocol and chain interaction analysis</li>
            <li>Airdrop eligibility tracking</li>
            <li>Bulk wallet checking capabilities</li>
            <li>User-friendly statistics visualization</li>
            <li>Cross-chain transaction analysis</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Supported Networks</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Monad Chain</li>
            <li>LayerZero</li>
            <li>Linea Chain</li>
            <li>Soneium Chain</li>
            <li>Ink Chain</li>
            <li>Kaito Chain</li>
            <li>And many more across our tools!</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Commitment</h2>
          <p className="text-gray-700 leading-relaxed">
            We're committed to providing free, accessible tools that help users navigate the increasingly complex world of blockchain networks.
            Our focus is on delivering accurate data, beautiful visualizations, and insights that help you make informed decisions about your
            crypto activity and potential airdrop eligibility.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">The Team</h2>
          <p className="text-gray-700 leading-relaxed">
            WalletsX is built and maintained by a dedicated team of blockchain enthusiasts and developers with extensive experience
            in the Web3 ecosystem. We're passionate about blockchain technology and committed to creating tools that make the 
            multi-chain ecosystem more accessible and transparent for everyone.
          </p>
        </section>
      </div>
    </div>
  );
}