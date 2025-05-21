'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader2, ExternalLink, Shield, CheckCircle2, XCircle, Twitter, Award, TrendingUp, Sparkles, Medal, HelpCircle, Filter, CalendarClock, Rocket, Zap } from 'lucide-react';

// Define badge type
interface Badge {
  name: string;
  contractAddress: string;
  symbol?: string;
  owned?: boolean;
  isSpecial?: boolean;
  tokenId?: string;
  imageUrl?: string;
}

// Define Blockscout API response types
interface BlockscoutTokenInstance {
  id: string;
  value: string;
  image_url?: string;
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
  };
}

interface BlockscoutToken {
  token: {
    address: string;
    name?: string;
    symbol?: string;
  };
  token_instances: BlockscoutTokenInstance[];
}

interface BlockscoutNftCollectionsResponse {
  items: BlockscoutToken[];
  next_page_params: any | null;
}

// Alchemy getNFTsForOwner response type
interface AlchemyNft {
  contract: {
    address: string;
  };
  tokenId: string;
  tokenType: string;
  image: {
    cachedUrl?: string;
    originalUrl?: string;
  };
}

interface AlchemyNftsResponse {
  ownedNfts: AlchemyNft[];
  totalCount: number;
}

// Special OG Badges
const ogBadges: Badge[] = [
  { 
    name: "OG Badge", 
    contractAddress: "0x2A21B17E366836e5FFB19bd47edB03b4b551C89d",
    tokenId: "0",
    isSpecial: true
  },
  { 
    name: "Premium OG Badge", 
    contractAddress: "0x2A21B17E366836e5FFB19bd47edB03b4b551C89d",
    tokenId: "1",
    isSpecial: true
  },
];

// List of Soneium ecosystem badges
const ecosystemBadges: Badge[] = [
  { 
    name: "2P2E Ecosystem Badge", 
    contractAddress: "0x8918531fC73f2c9047f0163eA126EeD1B8EA2c63"
  },
  { 
    name: "Arkada Ecosystem Badge", 
    contractAddress: "0x391Dece93d18Fca922bF337C25Ee38BeA74Db63E"
  },
  { 
    name: "Biru Ecosystem Badge", 
    contractAddress: "0x44EEfAC1D5Db283B2dD99e226B864da271D82952"
  },
  { 
    name: "CONFT Ecosystem BADGE", 
    contractAddress: "0x7A475a650a4867577cf488E94ec023E593997fd6"
  },
  { 
    name: "CoPump Ecosystem Badge", 
    contractAddress: "0x39C5DfF4e39779492C3AE3898c8d5a0579fE684e"
  },
  { 
    name: "HandsNFT AI Ecosystem Badge", 
    contractAddress: "0x670113b4AE5416E1368669bE1cdcc918871827eA"
  },
  { 
    name: "NFTs2Me Ecosystem Badge", 
    contractAddress: "0x4591D540B692CBeD60Db7781B7683910f7a3BF8C"
  },
  
  { 
    name: "Quickswap Badge", 
    contractAddress: "0x5C0221a8c3eB5956b70cDC572fA0F6C952274f1A"
  },
  { 
    name: "Sake Ecosystem Badge", 
    contractAddress: "0x3a634e6f8C2bf2C5894722B908d99e3cF9C62eD3"
  },
  { 
    name: "SoneFi Ecosystem Badge", 
    contractAddress: "0x6DD843fe15dbFD41F001d448cb246ac8b65a6027"
  },
  { 
    name: "Sonova Ecosystem badge", 
    contractAddress: "0x4A33e2E308E5d9C0188d209F1bF443Ff7CfB4A31"
  },
  { 
    name: "Sonus Ecosystem Badge", 
    contractAddress: "0x066ABA7c3520e300113C0515FF41c084eE0c95Ea"
  },
  { 
    name: "SuperVol Ecosystem Badge", 
    contractAddress: "0x55E906C6Fb98894f05E1a7A533d77732B79a5414"
  },
  { 
    name: "SynStation Badge", 
    contractAddress: "0x0DEc30Af3551161606282a6bc1243526b6a3D1E9"
  },
  { 
    name: "UntitledBank Ecosystem badge", 
    contractAddress: "0xcf87B2d5Ab008D41159f6737E2a5b6a3Bc40b753"
  },
  { 
    name: "Velodrome Soneium Badge", 
    contractAddress: "0x2DCD9B33F0721000Dc1F8f84B804d4CFA23d7713"
  },
  { 
    name: "waveX Ecosystem Badge", 
    contractAddress: "0x4a3b67b339c272fAb639B0CAF3Ce7852B2Aa0833"
  },
  { 
    name: "Layer3 Soneium Badge", 
    contractAddress: "0x83A0C5D831E7869f4c710658CBD1b455Ba92ad00"
  },
  
  { 
    name: "Moon Medal Badge", 
    contractAddress: "0xeAF42993E44be62c9113161c0016821C6A540B92"
  },
  { 
    name: "KYO FINANCE Soneium Badge", 
    contractAddress: "0x11B2876C58cFb7501Db60d0112AF8A8EfEB0A81D"
  },
  { 
    name: "SONEX GOAT BADGE", 
    contractAddress: "0xAa6c38A85e5781bCc410693B52F64EfF1aFcd3c6"
  },
  { 
    name: "Owlto Soneium Badge", 
    contractAddress: "0x1eC6AACC79f3c4817d7fea2268e1c54C6b2662Fb"
  },
  { 
    name: "Orbiter Soneium Badge", 
    contractAddress: "0xc59f0D1B1b614d8446dDe1760fc3e6ae57bF9501"
  },
  { 
    name: "Fractal Visions Ecosystem Badge", 
    contractAddress: "0x1833e394D879D9b493cdb0fe754F304f2E9F23bf"
  },
  { 
    name: "Mithraeum Badge", 
    contractAddress: "0x9d83A657581A966aDf1c346dAfEe3EBe258EC26D"
  },
  { 
    name: "Omnihub Ecosystem Badge", 
    contractAddress: "0x7e058E9eeb81758F80049d0F2c1C1A7b47919697"
  },
  { 
    name: "XSTAR Soneium Badge", 
    contractAddress: "0x690B97980877b5d7915E89E6D0Cb9748A8bdAB8d"
  },
  { 
    name: "Posse Badge", 
    contractAddress: "0x890a19A1Dd75AAEcc4eDFce4685bb59C8ABEe78A"
  },
  { 
    name: "Unemeta Badge", 
    contractAddress: "0xCA707D22E248740aDaA9C63580F7A35201B18d30"
  },
  { 
    name: "Arcas Games Badge", 
    contractAddress: "0x9a4cC369A91AE5e8cBd99163a2eAC5b7957879dB"
  }
];

// Function to get Alchemy API keys in a sequential manner
const getNextAlchemyKey = (() => {
  let currentKeyIndex = 0;
  const keys = [
    process.env.VITE_ALCHEMY_API_KEY_1,
    process.env.VITE_ALCHEMY_API_KEY_2,
    process.env.VITE_ALCHEMY_API_KEY_3,
    process.env.VITE_ALCHEMY_API_KEY_4,
    process.env.VITE_ALCHEMY_API_KEY_5,
    process.env.VITE_ALCHEMY_API_KEY_6,
    process.env.VITE_ALCHEMY_API_KEY_7,
    process.env.VITE_ALCHEMY_API_KEY_8,
    process.env.VITE_ALCHEMY_API_KEY_9,
    process.env.VITE_ALCHEMY_API_KEY_10
  ].filter(key => !!key); // Filter out any undefined keys
  
  return () => {
    if (keys.length === 0) return null;
    const key = keys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % keys.length; // Move to next key and wrap around
    return key;
  };
})();

// Helper function to highlight search term in badge names
function highlightText(text: string, searchTerm: string) {
  if (!searchTerm) return text;
  
  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
  return (
    <React.Fragment>
      {parts.map((part, i) => 
        part.toLowerCase() === searchTerm.toLowerCase() ? 
          <span key={i} className="bg-yellow-200 font-medium px-0.5 rounded">{part}</span> : 
          part
      )}
    </React.Fragment>
  );
}

// Function to truncate address
function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function SoneiumBadgeChecker() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [ogBadgesList, setOgBadgesList] = useState<Badge[]>(ogBadges);
  const [ecosystemBadgesList, setEcosystemBadgesList] = useState<Badge[]>(ecosystemBadges);
  const [activeTab, setActiveTab] = useState<'all' | 'owned' | 'notOwned'>('all');
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Check all badges in a single API call
  const checkAllBadges = async (walletAddress: string) => {
    // Select one API key for this user's request
    const apiKey = getNextAlchemyKey();
    if (!apiKey) {
      console.error('No Alchemy API keys available');
      throw new Error('API key configuration error');
    }
    
    // Prepare contract addresses for query
    const contractAddresses = [
      ...ogBadges.map(badge => badge.contractAddress),
      ...ecosystemBadges.map(badge => badge.contractAddress)
    ];
    
    // Build the URL with all contract addresses
    let url = `https://soneium-mainnet.g.alchemy.com/nft/v3/${apiKey}/getNFTsForOwner?owner=${walletAddress}&withMetadata=true`;
    contractAddresses.forEach(address => {
      url += `&contractAddresses%5B%5D=${address}`;
    });
    
    try {
      const options = { method: 'GET', headers: { accept: 'application/json' } };
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      const data: AlchemyNftsResponse = await response.json();
      
      // Process the response to determine which badges are owned
      const ownedNfts = new Map<string, AlchemyNft>();
      
      // Group NFTs by contract address
      data.ownedNfts.forEach(nft => {
        const key = nft.tokenType === 'ERC1155' 
          ? `${nft.contract.address.toLowerCase()}-${nft.tokenId}`  // For ERC1155, include token ID
          : nft.contract.address.toLowerCase();                    // For ERC721, just use the contract address
        ownedNfts.set(key, nft);
      });
      
      // Update OG badges
      const updatedOgBadges = ogBadges.map(badge => {
        const key = `${badge.contractAddress.toLowerCase()}-${badge.tokenId}`;
        const ownedNft = ownedNfts.get(key);
        return {
          ...badge,
          owned: !!ownedNft,
          imageUrl: ownedNft?.image?.cachedUrl || ownedNft?.image?.originalUrl
        };
      });
      
      // Update ecosystem badges
      const updatedEcosystemBadges = ecosystemBadges.map(badge => {
        const ownedNft = ownedNfts.get(badge.contractAddress.toLowerCase());
        return {
          ...badge,
          owned: !!ownedNft,
          imageUrl: ownedNft?.image?.cachedUrl || ownedNft?.image?.originalUrl
        };
      });
      
      return { updatedOgBadges, updatedEcosystemBadges };
    } catch (err) {
      console.error('Error checking badges:', err);
      throw err;
    }
  };

  // Check all badges when address is submitted
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || loading) return;

    setLoading(true);
    setError(null);
    
    try {
      // Use the new optimized method to check all badges at once
      const { updatedOgBadges, updatedEcosystemBadges } = await checkAllBadges(address);
      
      setOgBadgesList(updatedOgBadges);
      setEcosystemBadgesList(updatedEcosystemBadges);
    } catch (error) {
      console.error('Error checking badges:', error);
      setError('Failed to check badge ownership. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter badges based on active tab and search term
  const filteredOgBadges = ogBadgesList.filter(badge => {
    if (activeTab === 'all') return true;
    if (activeTab === 'owned') return badge.owned === true;
    if (activeTab === 'notOwned') return badge.owned === false;
    return true;
  });
  
  const filteredEcosystemBadges = ecosystemBadgesList.filter(badge => {
    // First filter by tab
    let includeByTab = true;
    if (activeTab === 'owned') includeByTab = badge.owned === true;
    if (activeTab === 'notOwned') includeByTab = badge.owned === false;
    
    // Then filter by search term if one exists
    const matchesSearch = searchTerm.trim() === '' || 
      badge.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return includeByTab && matchesSearch;
  });

  // Create share tweet text
  const createTweetText = () => {
    const badgeCount = ecosystemBadgesList.filter(badge => badge.owned === true).length;
    const percentage = Math.round((badgeCount / ecosystemBadgesList.length) * 100);
    const ogBadgeCount = ogBadgesList.filter(badge => badge.owned === true).length;
    
    let tweetText = `🏆 Soneium Badge Collection Status 🏆\n\n`;
    
    if (ogBadgeCount > 0) {
      tweetText += `🌟 ${ogBadgeCount}/2 OG Badges - Official Soneium Holder!\n\n`;
    }
    
    tweetText += `✅ ${badgeCount}/${ecosystemBadgesList.length} ecosystem badges collected (${percentage}%)\n\n`;
    tweetText += `Check your own Soneium badges at cryptowalletsx.com\n\n`;
    tweetText += `@soneium #SoneiumNetwork #Sony #blockchain`;
    
    return tweetText;
  };

  // Function to render the badge status label
  const renderBadgeStatus = (badge: Badge) => {
    // If badge status hasn't been checked yet (before form submission)
    if (badge.owned === undefined) {
      return (
        <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
          Not checked
        </span>
      );
    }
    
    // If badge status has been checked
    return (
      <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
        badge.owned 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {badge.owned ? 'Holding' : 'You missed it'}
      </span>
    );
  };

  // Render badge image if available
  const renderBadgeImage = (badge: Badge) => {
    if (badge.imageUrl) {
      return (
        <div className="mb-3 mt-2">
          <img 
            src={badge.imageUrl} 
            alt={badge.name} 
            className="max-h-40 rounded-md object-contain mx-auto shadow-md" 
          />
        </div>
      );
    }
    return null;
  };

  // Reset search when changing tabs
  useEffect(() => {
    setSearchTerm('');
  }, [activeTab]);

  return (
    <React.Fragment>
      {/* Simplified background with inline style instead of Tailwind class for pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-80"></div>
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600"></div>
        <div 
          className="absolute inset-0 opacity-[0.15]" 
          style={{ 
            backgroundImage: 'radial-gradient(#9C92AC 1px, transparent 1px)', 
            backgroundSize: '20px 20px' 
          }}
        ></div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 pb-16 relative">
        <div className="text-center mb-8 sm:mb-10 pt-6 sm:pt-10">
          <div className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium mb-3 shadow-sm">
            Soneium Network
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-700 mb-3">
            Soneium Badge Checker
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto text-lg">
            Check which Soneium OG badges and ecosystem badges you own in your collection
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Soneium OG checker</span>
            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">Ecosystem badge checker</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Badge verification tool</span>
          </div>
        </div>

        <div className="bg-white/90 rounded-xl shadow-xl border border-gray-100 p-6 mb-8 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter EVM address to check Soneium badges"
                  className="w-full px-4 py-3.5 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white outline-none transition-all duration-200 shadow-sm"
                  aria-label="Wallet address input for Soneium Badge Checker"
                />
                <Search className="absolute right-3 top-4 text-gray-400" size={20} />
              </div>
              <button
                type="submit"
                disabled={loading || !address.trim()}
                className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
              >
                {loading ? (
                  <><Loader2 className="animate-spin" size={20} /> Checking...</>
                ) : (
                  'Check Soneium Badges'
                )}
              </button>
            </div>
          </form>

          {/* Badge Summary - Moved to top */}
          {address && !loading && (ecosystemBadgesList.some(badge => badge.owned === true) || ogBadgesList.some(badge => badge.owned === true)) && (
            <div className="max-w-2xl mx-auto mb-6">
              <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-100 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full text-white shadow-md">
                      <Medal className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                      <p className="font-bold text-indigo-900 text-xl">Badge Collection Summary</p>
                  </div>
                  
                  {/* Twitter Share Button */}
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#1DA1F2] to-[#0c85d0] text-white py-2.5 px-4 rounded-lg hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <Twitter size={18} />
                    <span className="font-medium">Share</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    {ogBadgesList.some(badge => badge.owned === true) && (
                      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full">
                            <Award className="text-white" size={20} />
                          </div>
                          <div>
                            <p className="text-amber-800 font-semibold">OG Badge Collection</p>
                            <p className="text-amber-700">
                              <span className="font-bold text-xl">{ogBadgesList.filter(badge => badge.owned === true).length}/2</span> OG Badges
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full">
                          <Shield className="text-white" size={20} />
                        </div>
                        <div>
                          <p className="text-emerald-800 font-semibold">Ecosystem Badges</p>
                          <p className="text-emerald-700">
                            <span className="font-bold text-xl">{ecosystemBadgesList.filter(badge => badge.owned === true).length}/{ecosystemBadgesList.length}</span>
                            <span className="ml-2 text-sm">({Math.round((ecosystemBadgesList.filter(badge => badge.owned === true).length / ecosystemBadgesList.length) * 100)}%)</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-3">
              <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>{error}</div>
            </div>
          )}

          {/* Enhanced Tabs */}
          <div className="mb-6 max-w-2xl mx-auto">
            <div className="flex border border-purple-100 rounded-lg overflow-hidden shadow-sm bg-white">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-3.5 px-4 text-center font-medium text-sm transition-all duration-200 ${
                  activeTab === 'all' 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
                    : 'bg-white text-gray-500 hover:bg-purple-50'
                }`}
              >
                All Badges
              </button>
              <button
                onClick={() => setActiveTab('owned')}
                className={`flex-1 py-3.5 px-4 text-center font-medium text-sm transition-all duration-200 ${
                  activeTab === 'owned' 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
                    : 'bg-white text-gray-500 hover:bg-purple-50'
                }`}
              >
                Owned
              </button>
              <button
                onClick={() => setActiveTab('notOwned')}
                className={`flex-1 py-3.5 px-4 text-center font-medium text-sm transition-all duration-200 ${
                  activeTab === 'notOwned' 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
                    : 'bg-white text-gray-500 hover:bg-purple-50'
                }`}
              >
                Not Owned
              </button>
            </div>
          </div>
        </div>

        {/* Badge lists */}
        <div className="space-y-8">
          {/* OG Badges section */}
          {address && !loading && filteredOgBadges.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full shadow-md">
                  <Sparkles className="text-white" size={22} />
                </div>
                <h2 className="text-2xl font-bold text-amber-800">OG Badges</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 mb-4">
                {filteredOgBadges.map((badge) => (
                  <div 
                    key={badge.contractAddress + (badge.tokenId || '')}
                    className={`p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border ${
                      badge.owned === undefined
                        ? 'bg-white/90 border-gray-100 hover:border-gray-200'
                        : badge.owned
                          ? 'bg-gradient-to-br from-amber-50 to-white border-amber-200 hover:border-amber-300' 
                          : 'bg-gradient-to-br from-red-50 to-white border-red-100 hover:border-red-200'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-4">
                      {renderBadgeImage(badge)}
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className={`p-3 rounded-full shadow-md ${
                            badge.owned === undefined
                              ? 'bg-gray-100'
                              : badge.owned
                                ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white'
                                : 'bg-gradient-to-br from-red-400 to-rose-500 text-white'
                          }`}>
                            {badge.owned === undefined ? (
                              <HelpCircle size={22} className="text-gray-500" />
                            ) : badge.owned ? (
                              <CheckCircle2 size={22} className="text-white" />
                            ) : (
                              <XCircle size={22} className="text-white" />
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className={`font-bold text-lg ${badge.owned ? 'text-amber-800' : 'text-gray-700'}`}>
                            {badge.name}
                            {badge.tokenId && <span className="ml-1 text-xs font-normal text-gray-500">(ID: {badge.tokenId})</span>}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="text-sm text-gray-500">{truncateAddress(badge.contractAddress)}</span>
                            {renderBadgeStatus(badge)}
                          </div>
                        </div>
                        
                        <a
                          href={`https://soneium.blockscout.com/token/${badge.contractAddress}${badge.tokenId ? '/instance/' + badge.tokenId : ''}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-amber-600 hover:text-amber-700 flex items-center gap-1 group bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-lg transition-all duration-200 border border-amber-100 mt-2 sm:mt-0"
                        >
                          <span className="text-sm font-medium">View on Explorer</span>
                          <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Ecosystem Badges section with search */}
          {address && !loading && (
            <div className="bg-white/90 rounded-xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full shadow-md">
                    <TrendingUp className="text-white" size={22} />
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-800">Ecosystem Badges</h2>
                </div>
                
                {/* Search input for ecosystem badges */}
                <div className="relative w-full sm:w-auto flex-1 sm:max-w-xs">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search badge name..."
                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white outline-none transition-all shadow-sm text-sm"
                  />
                  <Filter className="absolute right-3 top-2.5 text-gray-400" size={18} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {filteredEcosystemBadges.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 col-span-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                    <Shield size={48} className="text-gray-300 mb-3" />
                    <p className="text-lg font-medium">No ecosystem badges found</p>
                    {searchTerm && (
                      <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                    )}
                  </div>
                ) : (
                  filteredEcosystemBadges.map((badge) => (
                    <div 
                      key={badge.contractAddress}
                      className={`p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border ${
                        badge.owned === undefined
                          ? 'bg-white/90 border-gray-100 hover:border-gray-200'
                          : badge.owned
                            ? 'bg-gradient-to-br from-green-50 to-white border-green-100 hover:border-green-200'
                            : 'bg-gradient-to-br from-red-50 to-white border-red-100 hover:border-red-200'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-4">
                        {renderBadgeImage(badge)}
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className={`p-3 rounded-full shadow-md ${
                              badge.owned === undefined
                                ? 'bg-gray-100'
                                : badge.owned
                                  ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
                                  : 'bg-gradient-to-br from-red-400 to-rose-500 text-white'
                            }`}>
                              {badge.owned === undefined ? (
                                <HelpCircle size={22} className="text-gray-500" />
                              ) : badge.owned ? (
                                <CheckCircle2 size={22} className="text-white" />
                              ) : (
                                <XCircle size={22} className="text-white" />
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h3 className={`font-semibold text-lg ${badge.owned ? 'text-emerald-800' : 'text-gray-800'}`}>
                              {searchTerm ? highlightText(badge.name, searchTerm) : badge.name}
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className="text-sm text-gray-500">{truncateAddress(badge.contractAddress)}</span>
                              {renderBadgeStatus(badge)}
                            </div>
                          </div>
                          
                          <a
                            href={`https://soneium.blockscout.com/token/${badge.contractAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg transition-all duration-200 border border-emerald-100 mt-2 sm:mt-0"
                          >
                            <span className="text-sm font-medium">View on Explorer</span>
                            <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Information about Soneium Ecosystem Badges */}
        <div className="mt-12 bg-white/90 rounded-xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-md">
              <Shield className="text-white" size={22} />
            </div>
            <h2 className="text-2xl font-bold text-indigo-800">What Are Soneium Ecosystem Badges?</h2>
          </div>
          
          <div className="prose prose-indigo max-w-none">
            <p className="text-gray-700 leading-relaxed">
              These aren't just NFTs—they're Soulbound Badges, locked to your wallet as proof of your impact in the Soneium world. 
              Issued by top-tier dApps, each badge celebrates your moves in DeFi, NFTs, gaming, and beyond.
            </p>
            
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-5 my-6 border border-indigo-100">
              <h3 className="flex items-center text-xl font-bold text-indigo-800 mb-3">
                <Rocket className="mr-2 text-indigo-600" size={22} />
                Score Yours Now
              </h3>
              
              <p className="text-gray-700 mb-3 flex items-start">
                <CalendarClock className="text-indigo-500 mr-2 flex-shrink-0 mt-1" size={18} />
                <span>From March 7–31, 2025, join the action with dApps like:</span>
              </p>
              
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 pl-8">
                <li className="text-indigo-700 font-medium">2P2E</li>
                <li className="text-indigo-700 font-medium">Sake Finance</li>
                <li className="text-indigo-700 font-medium">Quickswap</li>
                <li className="text-indigo-700 font-medium">Evermoon</li>
                <li className="text-indigo-700 font-medium">Sonus Exchange</li>
                <li className="text-indigo-700 font-medium">...and more!</li>
              </ul>
              
              <p className="text-gray-700">
                Each has its own challenge—swap tokens, mint NFTs, or flex your voting power. 
                Snapshot hits April 1, 2025, with badges dropping by April 15, 2025. 
                Check project channels for the latest rules.
              </p>
            </div>
            
            <h3 className="flex items-center text-xl font-bold text-indigo-800 mb-3">
              <Zap className="mr-2 text-indigo-600" size={22} />
              Why Grab These Badges?
            </h3>
            
            <p className="text-gray-700 leading-relaxed">
              They're your permanent mark on Soneium's rise—plus, whispers of airdrop perks for multi-badge holders 
              are heating up (no promises yet!).
            </p>
            
            <div className="mt-6 bg-white rounded-lg p-5 border border-indigo-100 mb-6">
              <h3 className="text-xl font-bold text-indigo-800 mb-4">Complete List of Soneium Ecosystem Badges</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">2P2E Ecosystem Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">Arkada Ecosystem Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">Biru Ecosystem Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">CONFT Ecosystem BADGE</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">CoPump Ecosystem Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">HandsNFT AI Ecosystem Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">NFTs2Me Ecosystem Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">Quickswap Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">Sake Ecosystem Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">SoneFi Ecosystem Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">Sonova Ecosystem Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">Sonus Ecosystem Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">SuperVol Ecosystem Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">SynStation Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">UntitledBank Ecosystem Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">Velodrome Soneium Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">waveX Ecosystem Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">Layer3 Soneium Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">Moon Medal Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">KYO FINANCE Soneium Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">SONEX GOAT BADGE</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">Owlto Soneium Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">Orbiter Soneium Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">Fractal Visions Ecosystem Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">Mithraeum Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">Omnihub Ecosystem Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">XSTAR Soneium Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">Posse Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">Unemeta Badge</div>
                <div className="bg-indigo-50 rounded-lg p-3 text-indigo-700">Arcas Games Badge</div>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://soneium.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-center px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md flex items-center justify-center gap-2"
              >
                <span>Learn More about Soneium</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Share Your Badge Collection</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200 mb-4 whitespace-pre-wrap text-sm text-gray-700">
              {createTweetText()}
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(createTweetText());
                  alert("Tweet text copied to clipboard!");
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
              >
                Copy Text
              </button>
              
              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(createTweetText())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#1DA1F2] hover:bg-[#0c85d0] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Twitter size={18} />
                Share on Twitter
              </a>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
} 