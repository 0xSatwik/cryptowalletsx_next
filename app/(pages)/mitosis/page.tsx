"use client";

import React, { useState, useMemo } from 'react';
import { Search, Loader2, Database, AlertTriangle, ExternalLink, ChevronDown, ChevronUp, Copy, CheckCircle, XCircle, Wallet, Dog, Coins, Share2, Twitter } from 'lucide-react';
import {
  Chip,
  Alert,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import LoadingButton from '@mui/lab/LoadingButton';

// Define our own MatrixPortfolioItem interface
interface MatrixPortfolioItem {
  asset: string;
  totalAssetAmount: string;
  mitoPoints: string;
  // Add other properties as needed
}

// Custom PortfolioItem component for this page
function PortfolioItem({ item }: { item: MatrixPortfolioItem }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium text-indigo-800">{item.asset}</div>
        <div className="text-sm text-indigo-600">
          {parseFloat(item.totalAssetAmount).toLocaleString(undefined, {maximumFractionDigits: 4})}
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium text-indigo-800">MITO Points</div>
        <div className="text-sm text-indigo-600">
          {parseFloat(item.mitoPoints).toLocaleString(undefined, {maximumFractionDigits: 2})}
        </div>
      </div>
    </div>
  );
}

// Array of Matrix API proxy URLs
const MATRIX_API_PROXIES = [
  'https://matrix-proxy.litebloggingpro.workers.dev',
  'https://matrix-proxy.mitomat.workers.dev'
];

// Array of Mitosis worker proxy URLs
const MITOSIS_WORKER_PROXIES = [
  
  'https://workermito.mitoapi.workers.dev',
  'https://workermito.mitov2.workers.dev',
  'https://workermito.mitov7.workers.dev'
];

// Add supported asset types for Expedition rankings
const EXPEDITION_ASSETS = ['ezETH', 'weETH', 'weETHs', 'unibtc', 'unieth', 'cmeth'];

// Morse Token and NFT constants
const MORSE_TOKEN_ADDRESS = '0xe591293151ffdadd5e06487087d9b0e2743de92e';
const MORSE_NFT_ADDRESS = '0x027DA47D6a5692c9b5cB64301A07d978cE3cB16c';
const THIRDWEB_API_BASE_URL = 'https://insight.thirdweb.com/v1/tokens';

// Load Alchemy API keys from environment variables
const ALCHEMY_API_KEYS = [
  process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_1 || '',
  process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_2 || '',
  process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_3 || '',
  process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_4 || '',
  process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_5 || '',
  process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_6 || '',
  process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_7 || '',
  process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_8 || '',
  process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_9 || '',
  process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_10 || '',
];

// Interface for Mitosis rank data
interface MitosisRankData {
  rank: number;
  address: string;
  mito_balance: number;
  wmito_balance: number;
  total_balance: number;
}

// Interface for Expedition ranking data
interface ExpeditionRankData {
  lastUpdatedAt: string;
  item: {
    rank: number;
    tier: number;
    xHandle?: string;
    address: string;
    amount: string;
    referralPoints: string;
    boost: number;
    totalPoints: string;
  };
  above100Item?: {
    rank: number;
    tier: number;
    amount: string;
    referralPoints: string;
    boost: number;
    totalPoints: string;
  };
  topGainer?: {
    rank: number;
    tier: number;
    amount: string;
    referralPoints: string;
    boost: number;
    totalPoints: string;
  };
  lastGainer?: {
    rank: number;
    tier: number;
    amount: string;
    referralPoints: string;
    boost: number;
    totalPoints: string;
  };
}

// Interface for Morse Token data
interface MorseTokenData {
  chain_id: number;
  token_address: string;
  balance: string;
}

// Interface for Morse NFT data from Alchemy API
interface MorseNFTData {
  contract: {
    address: string;
    name: string;
    symbol: string;
    totalSupply: string;
    tokenType: string;
    openSeaMetadata?: {
      floorPrice?: number;
      collectionName?: string;
      collectionSlug?: string;
      imageUrl?: string;
      description?: string;
      twitterUsername?: string;
      discordUrl?: string;
    };
  };
  tokenId: string;
  tokenType: string;
  name: string;
  description: string;
  image: {
    cachedUrl?: string;
    thumbnailUrl?: string;
    originalUrl?: string;
    pngUrl?: string;
    contentType?: string;
  };
  raw: {
    metadata: {
      attributes: {
        trait_type: string;
        value: string;
      }[];
      image_url?: string;
      id?: string;
    };
  };
  collection: {
    name: string;
    slug: string;
  };
}

// Interface for Alchemy NFT Response
interface AlchemyNFTResponse {
  ownedNfts: MorseNFTData[];
  totalCount: number;
  validAt: {
    blockNumber: number;
    blockTimestamp: string;
  };
  pageKey?: string;
}

// Interface for combined wallet results
interface WalletResult {
  address: string;
  // Game of Mito stats
  rankData: MitosisRankData | null;
  rankError: string | null;
  // Matrix portfolio data
  portfolioData: MatrixPortfolioItem[] | null;
  portfolioError: string | null;
  // Expedition ranking data
  expeditionData: Record<string, ExpeditionRankData | null>;
  expeditionErrors: Record<string, string | null>;
  // Morse token data
  morseTokenData: MorseTokenData | null;
  morseTokenError: string | null;
  // Morse NFT data
  morseNFTData: MorseNFTData[];
  morseNFTError: string | null;
  // UI state
  isExpanded: boolean;
  totalMitoPoints: number;
}

export default function MitosisOverallStatsChecker() {
  const [inputAddress, setInputAddress] = useState('');
  const [walletResults, setWalletResults] = useState<WalletResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingWallet, setProcessingWallet] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ThirdWeb Client IDs - hardcoded for immediate use
  // In production, these should come from environment variables
  const THIRDWEB_CLIENT_IDS = [
    "af6c1c956101ed5a2218bfa53ce540bf", // Sample ID 1
    "5d583aa948496ca385514e6a23445d78", // Sample ID 2
    "32e88c7f213c9e10ae64e958e0c73b69"  // Sample ID 3
  ];

  // Function to check if an address is a valid Ethereum address
  const isValidEthAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // Function to get a random Matrix proxy URL
  const getRandomMatrixProxy = () => {
    const randomIndex = Math.floor(Math.random() * MATRIX_API_PROXIES.length);
    return MATRIX_API_PROXIES[randomIndex];
  };

  // Function to fetch Mitosis rank data from the API
  const fetchRankData = async (walletAddress: string) => {
    if (!isValidEthAddress(walletAddress)) {
      return {
        rankData: null,
        error: 'Invalid Ethereum address format'
      };
    }
    
    try {
      const response = await fetch(`https://mitorank.vercel.app/api/query-holder?address=${walletAddress}`);
      
      if (!response.ok) {
        // Handle 500 errors with a more user-friendly message
        if (response.status === 500) {
          return {
            rankData: null,
            error: 'You are not in the ranking list'
          };
        }
        
        throw new Error(`API responded with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        return {
          rankData: null,
          error: data.error || 'Wallet not found in rankings'
        };
      }
      
      return {
        rankData: data.data,
        error: null
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Also check for the 500 error message in the caught error
      if (errorMessage.includes('status 500')) {
        return {
          rankData: null,
          error: 'You are not in the ranking list'
        };
      }
      
      return {
        rankData: null,
        error: `Failed to fetch rank data: ${errorMessage}`
      };
    }
  };

  // Function to fetch Matrix portfolio data from the API
  const fetchPortfolioData = async (walletAddress: string) => {
    if (!isValidEthAddress(walletAddress)) {
      return {
        portfolioData: null,
        error: 'Invalid Ethereum address format'
      };
    }
    
    try {
      // Get a random Matrix proxy URL for each request
      const matrixProxy = getRandomMatrixProxy();
      const response = await fetch(`${matrixProxy}/theo/portfolio/${walletAddress}`);
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      const data = await response.json();
      return {
        portfolioData: Array.isArray(data) ? data : [],
        error: null
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        portfolioData: null,
        error: `Failed to fetch portfolio data: ${errorMessage}`
      };
    }
  };

  // Function to get a random worker proxy URL
  const getRandomWorkerProxy = () => {
    const randomIndex = Math.floor(Math.random() * MITOSIS_WORKER_PROXIES.length);
    return MITOSIS_WORKER_PROXIES[randomIndex];
  };

  // Function to fetch Expedition rank data from the API
  const fetchExpeditionRankData = async (walletAddress: string, asset: string) => {
    if (!isValidEthAddress(walletAddress)) {
      return {
        expeditionData: null,
        error: 'Invalid Ethereum address format'
      };
    }
    
    try {
      // Get a random worker proxy URL for each request
      const workerProxy = getRandomWorkerProxy();
      const response = await fetch(`${workerProxy}/expedition-rank?address=${walletAddress}&asset=${asset}`);
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        return {
          expeditionData: null,
          error: data.error
        };
      }
      
      return {
        expeditionData: data,
        error: null
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        expeditionData: null,
        error: `Failed to fetch expedition rank data: ${errorMessage}`
      };
    }
  };

  // Function to get a random client ID
  const getRandomClientId = () => {
    // Select a random client ID from the array
    const randomIndex = Math.floor(Math.random() * THIRDWEB_CLIENT_IDS.length);
    return THIRDWEB_CLIENT_IDS[randomIndex];
  };

  // Function to fetch Morse token data from the ThirdWeb API
  const fetchMorseTokenData = async (walletAddress: string) => {
    if (!isValidEthAddress(walletAddress)) {
      return {
        tokenData: null,
        error: 'Invalid Ethereum address format'
      };
    }

    try {
      // First approach: Check tokens held by the wallet using pagination
      // Starting from page 0, then jump to page 2 if needed
      let currentPage = 0;
      let hasMoreData = true;
      let morseToken = null;

      while (hasMoreData && !morseToken) {
        const clientId = getRandomClientId();
        // Correct format for fetching tokens held by wallet
        const url = `${THIRDWEB_API_BASE_URL}/erc20/${walletAddress}?chain=1&limit=100&page=${currentPage}&metadata=true&resolve_metadata_links=true&include_spam=false&clientId=${clientId}`;
        
        console.log(`Checking token holdings on page ${currentPage} with client ID: ${clientId}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          if (response.status === 404) {
            console.log(`Got 404 for page ${currentPage}, stopping pagination`);
            hasMoreData = false;
            break;
          }
          throw new Error(`API responded with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Received token data for page ${currentPage}:`, data.data ? data.data.length : 0, 'tokens');
        
        if (!data.data || data.data.length === 0) {
          console.log(`No tokens on page ${currentPage}, stopping pagination`);
          hasMoreData = false;
        } else {
          // Check if the MORSE token is in the results
          morseToken = data.data.find((token: MorseTokenData) => 
            token.token_address.toLowerCase() === MORSE_TOKEN_ADDRESS.toLowerCase()
          );
          
          if (morseToken) {
            console.log("Found Morse token in holdings:", morseToken);
            return {
              tokenData: morseToken,
              error: null
            };
          }
          
          // Special pagination: 0, 2, 3, 4, 5...
          if (currentPage === 0) {
            currentPage = 2; // Skip to page 2
          } else {
            currentPage++;
          }
        }
      }
      
      // Second approach: Direct balance check if not found through pagination
      if (!morseToken) {
        console.log("Trying direct token balance check");
        const clientId = getRandomClientId();
        const directUrl = `${THIRDWEB_API_BASE_URL}/erc20/${MORSE_TOKEN_ADDRESS}/balance?chain=1&wallet=${walletAddress}&clientId=${clientId}`;
        
        const directResponse = await fetch(directUrl);
        if (directResponse.ok) {
          const directData = await directResponse.json();
          
          if (directData && directData.data && parseFloat(directData.data.balance) > 0) {
            console.log("Found Morse token balance:", directData.data);
            const tokenData = {
              chain_id: 1,
              token_address: MORSE_TOKEN_ADDRESS,
              balance: directData.data.balance
            };
            return {
              tokenData,
              error: null
            };
          }
        }
      }
      
      // If we've checked both methods and found nothing
      return {
        tokenData: null,
        error: null // Not really an error, just doesn't hold the token
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("Error fetching Morse token:", errorMessage);
      return {
        tokenData: null,
        error: `Failed to fetch Morse token data: ${errorMessage}`
      };
    }
  };

  // Function to get a random Alchemy API key
  const getRandomAlchemyKey = () => {
    // Filter out empty keys
    const validKeys = ALCHEMY_API_KEYS.filter(key => key !== '');
    if (validKeys.length === 0) {
      return ''; // Return empty string if no valid keys
    }
    return validKeys[Math.floor(Math.random() * validKeys.length)];
  };

  // Function to fetch Morse NFT data using Alchemy API
  const fetchMorseNFTData = async (walletAddress: string) => {
    if (!isValidEthAddress(walletAddress)) {
      return {
        nftData: [],
        error: 'Invalid Ethereum address format'
      };
    }

    let apiKey = getRandomAlchemyKey();
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        // Use the Alchemy API to fetch Morse NFTs for the wallet
        const alchemyUrl = `https://eth-mainnet.g.alchemy.com/nft/v3/${apiKey}/getNFTsForOwner?owner=${walletAddress}&contractAddresses%5B%5D=${MORSE_NFT_ADDRESS}&withMetadata=true&pageSize=100`;
        
        console.log(`Fetching Morse NFT data with Alchemy API key, attempt ${retryCount + 1}`);
        
        const response = await fetch(alchemyUrl);
        
        if (!response.ok) {
          // If we get a 404 or 503 error, try again with another API key
          if ((response.status === 404 || response.status === 503) && retryCount < maxRetries - 1) {
            console.warn(`Got ${response.status} error, trying with another API key`);
            apiKey = getRandomAlchemyKey();
            retryCount++;
            continue;
          }
          
          throw new Error(`API responded with status ${response.status}`);
        }
        
        const data: AlchemyNFTResponse = await response.json();
        
        console.log(`Successfully fetched ${data.ownedNfts.length} Morse NFTs`);
        
        // No need to filter as we already specified the contract address in the API call
        return {
          nftData: data.ownedNfts,
          error: null
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error fetching Morse NFTs:", errorMessage);
        
        // Try again with another API key only if we haven't reached the max retries
        if (retryCount < maxRetries - 1) {
          apiKey = getRandomAlchemyKey();
          retryCount++;
          continue;
        }
        
        return {
          nftData: [],
          error: `Failed to fetch Morse NFT data: ${errorMessage}`
        };
      }
    }
    
    // This should never be reached as we return inside the loop,
    // but TypeScript requires a return statement
    return {
      nftData: [],
      error: 'Failed to fetch Morse NFT data after multiple attempts'
    };
  };

  // Update the processWallet function to fetch Expedition data
  const processWallet = async (address: string) => {
    setProcessingWallet(address);
    
    // Fetch Game of Mito, Matrix, and Morse data in parallel
    const [rankResult, portfolioResult, morseTokenResult, morseNFTResult] = await Promise.all([
      fetchRankData(address),
      fetchPortfolioData(address),
      fetchMorseTokenData(address),
      fetchMorseNFTData(address)
    ]);
    
    // Calculate total MITO points from Matrix data
    let totalMitoPoints = 0;
    let hasPositiveAmount = false;
    
    if (portfolioResult.portfolioData && portfolioResult.portfolioData.length > 0) {
      // Filter for items with positive Total Amount
      const validPortfolioItems = portfolioResult.portfolioData.filter(
        item => parseFloat(item.totalAssetAmount) > 0
      );
      
      // Calculate total MITO points only from valid items
      totalMitoPoints = validPortfolioItems.reduce(
        (sum, item) => sum + parseFloat(item.mitoPoints), 
        0
      );
      
      // Check if any portfolio item has a positive total amount
      hasPositiveAmount = validPortfolioItems.length > 0;
      
      // Update the portfolioData to only include valid items
      portfolioResult.portfolioData = validPortfolioItems;
    }
    
    // Fetch Expedition data for each asset type
    const expeditionPromises = EXPEDITION_ASSETS.map(asset => 
      fetchExpeditionRankData(address, asset)
    );
    
    const expeditionResults = await Promise.all(expeditionPromises);
    
    // Create a map of asset to expedition data and errors
    const expeditionData: Record<string, ExpeditionRankData | null> = {};
    const expeditionErrors: Record<string, string | null> = {};
    
    EXPEDITION_ASSETS.forEach((asset, index) => {
      expeditionData[asset] = expeditionResults[index].expeditionData;
      expeditionErrors[asset] = expeditionResults[index].error;
    });
    
    // Determine if the wallet has any Expedition ranking data
    const hasExpeditionData = Object.values(expeditionData).some(data => data !== null);
    
    // Determine if the wallet has any Morse data
    const hasMorseData = morseTokenResult.tokenData !== null || 
                         (morseNFTResult.nftData && morseNFTResult.nftData.length > 0);
    
    return {
      address,
      // Game of Mito rank data
      rankData: rankResult.rankData,
      rankError: rankResult.error,
      // Matrix portfolio data
      portfolioData: portfolioResult.portfolioData,
      portfolioError: portfolioResult.error,
      // Expedition ranking data
      expeditionData,
      expeditionErrors,
      // Morse token data
      morseTokenData: morseTokenResult.tokenData,
      morseTokenError: morseTokenResult.error,
      // Morse NFT data
      morseNFTData: morseNFTResult.nftData,
      morseNFTError: morseNFTResult.error,
      // Auto-expand wallets with any kind of data
      isExpanded: (rankResult.rankData && rankResult.rankData.rank > 0) || 
                  (totalMitoPoints > 0 && hasPositiveAmount) ||
                  hasExpeditionData ||
                  hasMorseData,
      totalMitoPoints
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowResults(false);
    
    if (!isValidEthAddress(inputAddress)) {
      setError('Invalid Ethereum address format');
      return;
    }
    
    setWalletResults([]);
    setIsProcessing(true);
    
    try {
      const result = await processWallet(inputAddress);
      setWalletResults([result]);
      setShowResults(true);
    } catch (err: any) {
      setError(`Error processing wallet: ${err.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setProcessingWallet('');
    }
  };

  // Toggle expansion of a wallet result
  const toggleExpand = (index: number) => {
    setWalletResults(prev => 
      prev.map((result, i) => 
        i === index ? { ...result, isExpanded: !result.isExpanded } : result
      )
    );
  };

  // Copy address to clipboard
  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address)
      .then(() => {
        setCopiedAddress(address);
        setTimeout(() => {
          setCopiedAddress(null);
        }, 2000);
      })
      .catch((error: unknown) => {
        console.error('Failed to copy address:', error);
        setError('Failed to copy to clipboard');
      });
  };

  // Function to generate Twitter share text
  const generateTwitterShareText = (walletResult: WalletResult) => {
    const baseUrl = window.location.origin;
    const lines = [];
    
    // Add wallet address (truncated)
   
    lines.push(`🔍 My #Mitosis Stats :`);
    
    // Add Game of Mito stats if available
    if (walletResult.rankData && walletResult.rankData.rank > 0) {
      lines.push(`\n🎮 Game of Mito: Rank #${walletResult.rankData.rank.toLocaleString()} with ${walletResult.rankData.total_balance.toLocaleString()} $MITO`);
    }
    
    // Add Matrix stats if available
    if (walletResult.portfolioData && walletResult.portfolioData.length > 0) {
      lines.push(`\n🔷 Matrix: ${walletResult.portfolioData.length} deposits (${walletResult.totalMitoPoints.toLocaleString(undefined, {maximumFractionDigits: 2})} pts)`);
    }
    
    // Add Expedition stats
    const expeditionEntries = Object.entries(walletResult.expeditionData)
      .filter(([_, data]) => data && data.item)
      .map(([asset, data]) => data && data.item && 
        `${asset}:  ${data.item.rank}`
      );
    
    if (expeditionEntries.length > 0) {
      lines.push(`\n🚀 Expedition ranks: ${expeditionEntries.join(' | ')}`);
    }
    
    // Add Morse Token info
    if (walletResult.morseTokenData) {
      const balance = (parseFloat(walletResult.morseTokenData.balance) / 1e18).toLocaleString(undefined, {maximumFractionDigits: 2});
      lines.push(`\n🪙 $MORSE: ${balance}`);
    }
    
    // Add Morse NFT info with floor price if available
    if (walletResult.morseNFTData && walletResult.morseNFTData.length > 0) {
      let nftText = `\n🐶 Morse NFTs: ${walletResult.morseNFTData.length}`;
      
      // Add floor price if available
      if (walletResult.morseNFTData[0]?.contract?.openSeaMetadata?.floorPrice) {
        nftText += ` (Floor: ${walletResult.morseNFTData[0].contract.openSeaMetadata.floorPrice} ETH)`;
      }
      
      lines.push(nftText);
    }
    
    // Add link to the tool
    lines.push(`\n\nCheck $MITO stats- ${baseUrl}/mitosis`);
    
    return encodeURIComponent(lines.join(''));
  };

  // Function to open Twitter share dialog
  const shareOnTwitter = (walletResult: WalletResult) => {
    const shareText = generateTwitterShareText(walletResult);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}`;
    window.open(twitterUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-3 py-6 sm:px-4 sm:py-8">
        {/* Enhanced Title Section */}
        <div className="text-center mb-10 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-5 z-0">
            <Wallet className="w-72 h-72 text-blue-800" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center mb-4">
              <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium">
                All-in-one Analytics
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 mb-4">
              Mitosis Wallet Stats
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Powerful analytics across <span className="font-semibold text-blue-600">Game of Mito</span>, 
              <span className="font-semibold text-indigo-600"> Matrix</span>, and
              <span className="font-semibold text-purple-600"> Expedition</span> platforms
            </p>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden transition-all duration-300 hover:shadow-blue-100">
            {/* Enhanced Submit Wallet Section */}
            <div className="p-6 sm:p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50">
              <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                <div className="text-center mb-7">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white mb-4 shadow-lg shadow-blue-200">
                    <Wallet className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter Your Wallet Address</h2>
                  <p className="text-gray-500 text-base mb-0">Check your comprehensive Mitosis stats across all platforms</p>
                </div>
                
                <div className="flex flex-col space-y-4">
                  <div className="relative">
                    <div className="relative bg-white rounded-xl overflow-hidden shadow-md border-2 border-blue-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <input
                        id="wallet-address"
                        type="text"
                        className="w-full pl-10 pr-10 py-4 bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400 text-base"
                        placeholder="0x..."
                        value={inputAddress}
                        onChange={(e) => setInputAddress(e.target.value)}
                        disabled={isProcessing}
                      />
                      {inputAddress && (
                        <button
                          type="button"
                          onClick={() => setInputAddress('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                          aria-label="Clear input"
                        >
                          <ClearIcon fontSize="small" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {error && (
                    <div className="mb-2">
                      <Alert 
                        severity="error" 
                        sx={{ 
                          backgroundColor: 'rgba(254, 226, 226, 0.6)', 
                          color: 'rgb(185, 28, 28)',
                          '.MuiAlert-icon': { color: 'rgb(185, 28, 28)' },
                          '&.MuiAlert-root': { borderRadius: '0.75rem' }
                        }}
                      >
                        {error}
                      </Alert>
                    </div>
                  )}
                  
                  <div className="flex justify-center mt-4">
                    <LoadingButton
                      type="submit"
                      loading={isProcessing}
                      loadingPosition="start"
                      startIcon={<Search className="h-5 w-5" />}
                      variant="contained"
                      disabled={!inputAddress.trim() || isProcessing}
                      sx={{
                        background: 'linear-gradient(90deg, rgb(59, 130, 246) 0%, rgb(79, 70, 229) 100%)',
                        '&:hover': { 
                          background: 'linear-gradient(90deg, rgb(37, 99, 235) 0%, rgb(67, 56, 202) 100%)',
                          transform: 'translateY(-2px)'
                        },
                        borderRadius: '12px',
                        padding: '12px 36px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        textTransform: 'none',
                        transition: 'all 0.3s',
                        boxShadow: '0 4px 14px -1px rgba(59, 130, 246, 0.5)',
                        '&:disabled': {
                          background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.6) 0%, rgba(79, 70, 229, 0.6) 100%)',
                          color: 'white'
                        }
                      }}
                    >
                      {isProcessing ? 'Processing...' : 'Check Wallet Stats'}
                    </LoadingButton>
                  </div>
                </div>
              </form>
            </div>
            
            {isProcessing && (
              <div className="flex flex-col items-center justify-center bg-blue-50 p-5 border-t border-blue-100">
                <div className="flex items-center space-x-3 mb-2">
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  <span className="text-blue-700 font-medium">Processing wallet data...</span>
                </div>
                <p className="text-sm text-blue-600">
                  Checking wallet: {processingWallet}
                </p>
              </div>
            )}

            {showResults && !isProcessing && walletResults.length > 0 && (
              <div className="border-t border-blue-100">
                <div className="p-5 sm:p-6">
                  {/* Wallet Summary Section - With better headings */}
                  <div className="mb-8">
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                          <Database className="h-5 w-5 text-blue-500 mr-2" />
                          Wallet Summary
                        </h2>
                        <Chip
                          label="Wallet Stats"
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: 'rgb(37, 99, 235)',
                            fontWeight: '500',
                            borderRadius: '9999px',
                            '.MuiChip-label': { px: 1.5 }
                          }}
                        />
                      </div>
                      <div className="h-1 w-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mt-2"></div>
                    </div>
                    
                    {/* Compact Rankings Summary */}
                    {walletResults.length > 0 && (
                      <div className="mb-6 grid grid-cols-1 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">                        
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {/* Game of Mito Rank */}
                            {walletResults[0].rankData && walletResults[0].rankData.rank > 0 && (
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200 shadow-sm">
                                <div className="flex items-center mb-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2 shadow-sm">
                                    <span className="text-xs font-bold">GoM</span>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-semibold text-blue-800">Game of Mito</h3>
                                    <p className="text-xs text-blue-600">Rank & MITO Balance</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-xl font-bold text-blue-800">
                                    #{walletResults[0].rankData.rank.toLocaleString()}
                                  </div>
                                  <div className="text-sm font-medium text-blue-700">
                                    {walletResults[0].rankData.total_balance.toLocaleString()} MITO
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Matrix Deposit Info */}
                            {walletResults[0].portfolioData && walletResults[0].portfolioData.length > 0 && (
                              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-3 border border-indigo-200 shadow-sm">
                                <div className="flex items-center mb-2">
                                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mr-2 shadow-sm">
                                    <span className="text-xs font-bold">MTX</span>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-semibold text-indigo-800">Matrix</h3>
                                    <p className="text-xs text-indigo-600">Deposits & MITO Points</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-xl font-bold text-indigo-800">
                                    {walletResults[0].portfolioData.length} deposits
                                  </div>
                                  <div className="text-sm font-medium text-indigo-700">
                                    {walletResults[0].totalMitoPoints.toLocaleString(undefined, {maximumFractionDigits: 2})} pts
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Expedition Ranks */}
                            {Object.entries(walletResults[0].expeditionData)
                              .filter(([_, data]) => data && data.item)
                              .map(([asset, data]) => data && data.item && (
                                <div key={asset} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200 shadow-sm">
                                  <div className="flex items-center mb-2">
                                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center mr-2 shadow-sm">
                                      <span className="text-xs font-bold">EXP</span>
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-semibold text-purple-800">{asset}</h3>
                                      <p className="text-xs text-purple-600">Tier {data.item.tier} Expedition</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="text-xl font-bold text-purple-800">
                                      #{data.item.rank.toLocaleString()}
                                    </div>
                                    <div className="text-sm font-medium text-purple-700">
                                      {parseFloat(data.item.totalPoints).toLocaleString(undefined, {maximumFractionDigits: 0})} pts
                                    </div>
                                  </div>
                                </div>
                            ))}
                            
                            {/* Morse Token Info */}
                            {walletResults[0].morseTokenData && (
                              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 border border-amber-200 shadow-sm">
                                <div className="flex items-center mb-2">
                                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center mr-2 shadow-sm">
                                    <Coins className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-semibold text-amber-800">MORSE Token</h3>
                                    <p className="text-xs text-amber-600">Balance</p>
                                  </div>
                                </div>
                                <div className="text-xl font-bold text-amber-800">
                                  {(parseFloat(walletResults[0].morseTokenData.balance) / 1e18).toLocaleString(undefined, {maximumFractionDigits: 4})} MORSE
                                </div>
                              </div>
                            )}
                            
                            {/* Morse NFT Info */}
                            {walletResults[0].morseNFTData && walletResults[0].morseNFTData.length > 0 && (
                              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 border border-amber-200 shadow-sm">
                                <div className="flex items-center mb-2">
                                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center mr-2 shadow-sm">
                                    <Dog className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-semibold text-amber-800">Morse NFTs</h3>
                                    <p className="text-xs text-amber-600">Collection</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-xl font-bold text-amber-800">
                                    {walletResults[0].morseNFTData.length} NFTs
                                  </div>
                                  {walletResults[0].morseNFTData[0]?.contract?.openSeaMetadata?.floorPrice && (
                                    <div className="text-sm font-medium text-amber-700">
                                      Floor Price: {walletResults[0].morseNFTData[0]?.contract?.openSeaMetadata?.floorPrice} ETH
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Twitter Share Button Section */}
                  {walletResults.length > 0 && (
                    <div className="mb-8">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl overflow-hidden shadow-lg border border-blue-400">
                        <div className="p-5 flex flex-col md:flex-row items-center justify-between">
                          <div className="text-white mb-4 md:mb-0">
                            <h3 className="text-xl font-bold mb-2 flex items-center">
                              <Share2 className="h-5 w-5 mr-2" />
                              Share Your Mitosis Stats
                            </h3>
                            <p className="text-blue-100 max-w-md">
                              Show off your Game of Mito rank, Matrix deposits, Expedition rankings, and Morse collection with the community!
                            </p>
                          </div>
                          
                          <button
                            onClick={() => shareOnTwitter(walletResults[0])}
                            className="bg-white hover:bg-blue-50 text-blue-600 px-6 py-3 rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-1 flex items-center font-bold"
                          >
                            <Twitter className="h-5 w-5 mr-2 text-[#1DA1F2]" />
                            Share on Twitter
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Wallet Details Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                          <Wallet className="h-5 w-5 text-blue-500 mr-2" />
                          Detailed Analytics
                        </h2>
                        <div className="h-1 w-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mt-2"></div>
                      </div>
                    </div>
                    
                    {/* Detailed sections */}
                    <div className="space-y-4">
                      {walletResults.map((result, index) => (
                        <div 
                          key={result.address} 
                          className="bg-white rounded-xl border border-blue-100 overflow-hidden transition-all duration-300 hover:shadow-md"
                        >
                          {/* Wallet header */}
                          <div 
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50"
                            onClick={() => toggleExpand(index)}
                          >
                            <div className="flex items-center mb-2 sm:mb-0">
                              <div className="mr-3">
                                {result.rankData && result.rankData.rank > 0 ? (
                                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                                    <span className="font-bold">
                                      {result.rankData.rank <= 9999 ? result.rankData.rank : '10k+'}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                                    <Wallet className="h-5 w-5 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              
                              <div>
                                <div className="flex items-center">
                                  <div className="font-medium text-gray-700 truncate max-w-[200px] sm:max-w-[300px]">
                                    {result.address}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(result.address);
                                    }}
                                    className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="Copy address"
                                  >
                                    {copiedAddress === result.address ? (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {result.rankData && result.rankData.rank > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      Rank: #{result.rankData.rank.toLocaleString()}
                                    </span>
                                  )}
                                  
                                  {result.rankData && result.rankData.total_balance > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                      {result.rankData.total_balance.toLocaleString()} MITO
                                    </span>
                                  )}
                                  
                                  {result.portfolioData && result.portfolioData.length > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                      {result.portfolioData.length} Matrix Deposits
                                    </span>
                                  )}
                                  
                                  {Object.values(result.expeditionData).some(data => data !== null && data.item) && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                      Expedition
                                    </span>
                                  )}

                                  {result.morseTokenData && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                      <Coins className="h-3 w-3 mr-1" />
                                      MORSE Token
                                    </span>
                                  )}
                                  
                                  {result.morseNFTData && result.morseNFTData.length > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                      <Dog className="h-3 w-3 mr-1" />
                                      {result.morseNFTData.length} NFTs
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between sm:justify-end mt-2 sm:mt-0">
                              <div className="flex sm:hidden flex-grow">
                                {/* Empty placeholder for mobile layout */}
                              </div>
                              <button 
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                aria-expanded={result.isExpanded}
                                aria-label={result.isExpanded ? "Collapse" : "Expand"}
                              >
                                {result.isExpanded ? (
                                  <ChevronUp className="h-5 w-5" />
                                ) : (
                                  <ChevronDown className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </div>
                          
                          {result.isExpanded && (
                            <div className="border-t border-blue-100 p-0">
                              <div className="space-y-0">
                                {/* Game of Mito Stats */}
                                {(result.rankData && result.rankData.rank > 0) ? (
                                  <div className="p-4 border-b border-blue-100">
                                    <div className="flex items-center mb-3">
                                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2 shadow-sm">
                                        <span className="text-xs font-bold">GoM</span>
                                      </div>
                                      <div>
                                        <h3 className="text-lg font-semibold text-blue-800">Game of Mito Stats</h3>
                                        <div className="h-1 w-16 bg-blue-400 rounded-full mt-1"></div>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <div className="text-sm text-blue-600 mb-1 font-medium">Rank</div>
                                        <div className="text-lg font-bold text-blue-800">
                                          #{result.rankData.rank.toLocaleString()}
                                        </div>
                                      </div>
                                      
                                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <div className="text-sm text-blue-600 mb-1 font-medium">MITO Balance</div>
                                        <div className="text-lg font-bold text-blue-800">
                                          {result.rankData.mito_balance.toLocaleString()}
                                        </div>
                                      </div>
                                      
                                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <div className="text-sm text-blue-600 mb-1 font-medium">wMITO Balance</div>
                                        <div className="text-lg font-bold text-blue-800">
                                          {result.rankData.wmito_balance.toLocaleString()}
                                        </div>
                                      </div>
                                      
                                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <div className="text-sm text-blue-600 mb-1 font-medium">Total Balance</div>
                                        <div className="text-lg font-bold text-blue-800">
                                          {result.rankData.total_balance.toLocaleString()}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : result.rankError ? (
                                  <div className="p-4 border-b border-blue-100">
                                    <div className="flex items-center mb-3">
                                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2 shadow-sm">
                                        <span className="text-xs font-bold">GoM</span>
                                      </div>
                                      <div>
                                        <h3 className="text-lg font-semibold text-blue-800">Game of Mito Stats</h3>
                                        <div className="h-1 w-16 bg-blue-400 rounded-full mt-1"></div>
                                      </div>
                                    </div>
                                    
                                    {result.rankError === 'You are not in the ranking list' ? (
                                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                        <div className="flex items-center text-amber-700">
                                          <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                                          <div>
                                            <p className="font-medium">Not in Game of Mito Rankings</p>
                                            <p className="text-sm mt-1">This wallet doesn't appear in the current Game of Mito rankings. You may need to acquire MITO tokens to participate.</p>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                        <div className="flex items-center text-red-700">
                                          <XCircle className="h-5 w-5 mr-2" />
                                          <div>{result.rankError}</div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : null}

                                {/* Matrix Portfolio Data */}
                                {result.portfolioData && result.portfolioData.length > 0 ? (
                                  <div className="p-4 border-b border-blue-100">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mr-2 shadow-sm">
                                          <span className="text-xs font-bold">MTX</span>
                                        </div>
                                        <div>
                                          <h3 className="text-lg font-semibold text-indigo-800">Matrix Portfolio</h3>
                                          <div className="h-1 w-16 bg-indigo-400 rounded-full mt-1"></div>
                                        </div>
                                      </div>
                                      <span className="text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full font-medium">
                                        {result.portfolioData.length} Deposits
                                      </span>
                                    </div>
                                    
                                    <div className="space-y-3 mt-3">
                                      {result.portfolioData.map((item, itemIndex) => (
                                        <div key={`${item.asset}-${itemIndex}`} className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                                          <PortfolioItem item={item} />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : result.portfolioError ? (
                                  <div className="bg-red-50 p-4 rounded-lg border-b border-blue-100">
                                    <div className="flex items-center text-red-700">
                                      <XCircle className="h-5 w-5 mr-2" />
                                      <div>{result.portfolioError}</div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-4 border-b border-blue-100">
                                    <div className="flex items-center mb-3">
                                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mr-2 shadow-sm">
                                        <span className="text-xs font-bold">MTX</span>
                                      </div>
                                      <div>
                                        <h3 className="text-lg font-semibold text-indigo-800">Matrix Portfolio</h3>
                                        <div className="h-1 w-16 bg-indigo-400 rounded-full mt-1"></div>
                                      </div>
                                    </div>
                                    
                                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                      <div className="flex items-center text-amber-700">
                                        <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                                        <div>
                                          <p className="font-medium">No Matrix Deposits Found</p>
                                          <p className="text-sm mt-1">This wallet has not deposited any assets in Matrix, or all deposits have zero value.</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Expedition Ranking Data */}
                                {Object.keys(result.expeditionData).length > 0 && (
                                  <div className="p-4">
                                    <div className="flex items-center mb-3">
                                      <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center mr-2 shadow-sm">
                                        <span className="text-xs font-bold">EXP</span>
                                      </div>
                                      <div>
                                        <h3 className="text-lg font-semibold text-purple-800">Expedition Rankings</h3>
                                        <div className="h-1 w-16 bg-purple-400 rounded-full mt-1"></div>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                      {EXPEDITION_ASSETS.map(asset => {
                                        const data = result.expeditionData[asset];
                                        const error = result.expeditionErrors[asset];
                                        
                                        return (
                                          <div key={asset} className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                            <div className="flex items-center justify-between mb-2">
                                              <div className="font-medium text-purple-800">{asset} Rankings</div>
                                              {data?.lastUpdatedAt && (
                                                <div className="text-xs text-purple-600">
                                                  Updated: {new Date(data.lastUpdatedAt).toLocaleDateString()}
                                                </div>
                                              )}
                                            </div>
                                            
                                            {error ? (
                                              <div className="text-red-600 text-sm">{error}</div>
                                            ) : data && data.item ? (
                                              <div>
                                                {/* Twitter handle displayed once at the top */}
                                                {data.item.xHandle && (
                                                  <div className="mb-4 p-2 bg-blue-100 rounded-md flex items-center text-blue-800">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
                                                      <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
                                                    </svg>
                                                    <a 
                                                      href={`https://twitter.com/${data.item.xHandle.replace('@', '')}`} 
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="font-medium hover:underline"
                                                    >
                                                      {data.item.xHandle}
                                                    </a>
                                                  </div>
                                                )}
                                                
                                                {/* Your wallet data */}
                                                <div className="bg-white p-3 rounded-lg shadow-sm border border-purple-100 mb-3">
                                                  <h4 className="font-medium text-purple-800 mb-2 pb-1 border-b border-purple-100">Your Stats</h4>
                                                  <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                      <div className="text-sm text-purple-600 font-medium">Rank</div>
                                                      <div className="text-xl font-bold text-purple-800">
                                                        #{data.item.rank.toLocaleString()}
                                                      </div>
                                                    </div>
                                                    
                                                    <div>
                                                      <div className="text-sm text-purple-600 font-medium">Tier</div>
                                                      <div className="text-xl font-bold text-purple-800">
                                                        {data.item.tier}
                                                      </div>
                                                    </div>
                                                    
                                                    <div className="col-span-2">
                                                      <div className="text-sm text-purple-600 font-medium">Total Points</div>
                                                      <div className="text-xl font-bold text-purple-800 truncate">
                                                        {parseFloat(data.item.totalPoints).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                      </div>
                                                    </div>
                                                    
                                                    <div className="col-span-2">
                                                      <div className="text-sm text-purple-600 font-medium">Boost</div>
                                                      <div className="text-xl font-bold text-purple-800">
                                                        {data.item.boost.toFixed(2)}x
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="text-gray-500">No data available</div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Morse Token and NFT Section */}
                                <div className="p-4 border-t border-blue-100">
                                  <div className="flex items-center mb-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center mr-2 shadow-sm">
                                      <Dog className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-semibold text-amber-800">Morse Collection</h3>
                                      <div className="h-1 w-16 bg-amber-400 rounded-full mt-1"></div>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                                    {/* Morse Token */}
                                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center">
                                          <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center mr-2 shadow-sm">
                                            <Coins className="h-4 w-4" />
                                          </div>
                                          <div className="font-medium text-amber-800">$MORSE Token</div>
                                        </div>
                                        <a
                                          href={`https://etherscan.io/token/${MORSE_TOKEN_ADDRESS}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-amber-600 flex items-center hover:text-amber-800"
                                        >
                                          View on Etherscan
                                          <ExternalLink className="ml-1 h-3 w-3" />
                                        </a>
                                      </div>

                                      {result.morseTokenError ? (
                                        <div className="text-red-600 text-sm">{result.morseTokenError}</div>
                                      ) : result.morseTokenData ? (
                                        <div className="bg-white p-3 rounded-lg shadow-sm border border-amber-100">
                                          <div className="flex flex-col">
                                            <div className="text-sm text-amber-600 font-medium">Balance</div>
                                            <div className="text-xl font-bold text-amber-800">
                                              {(parseFloat(result.morseTokenData.balance) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 4 })} MORSE
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="bg-white p-3 rounded-lg shadow-sm border border-amber-100 text-center">
                                          <div className="text-gray-500">No MORSE tokens found in this wallet</div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Morse NFTs */}
                                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center">
                                          <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center mr-2 shadow-sm">
                                            <Dog className="h-4 w-4" />
                                          </div>
                                          <div className="font-medium text-amber-800">Morse NFTs</div>
                                        </div>
                                        <a
                                          href={`https://opensea.io/collection/morse-lab`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-amber-600 flex items-center hover:text-amber-800"
                                        >
                                          View on OpenSea
                                          <ExternalLink className="ml-1 h-3 w-3" />
                                        </a>
                                      </div>

                                      {result.morseNFTError ? (
                                        <div className="text-red-600 text-sm">{result.morseNFTError}</div>
                                      ) : result.morseNFTData && result.morseNFTData.length > 0 ? (
                                        <div>
                                          <div className="bg-white p-3 rounded-lg shadow-sm border border-amber-100 mb-3">
                                            <div className="flex justify-between">
                                              <div className="text-center font-medium text-amber-800">
                                                {result.morseNFTData.length} Morse NFTs
                                              </div>
                                              {result.morseNFTData[0]?.contract?.totalSupply && (
                                                <div className="text-xs text-amber-600">
                                                  Total Supply: {parseInt(result.morseNFTData[0]?.contract?.totalSupply).toLocaleString()}
                                                </div>
                                              )}
                                              {result.morseNFTData[0]?.contract?.openSeaMetadata?.floorPrice && (
                                                <div className="text-xs text-amber-600">
                                                  Floor Price: {result.morseNFTData[0]?.contract?.openSeaMetadata?.floorPrice} ETH
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          
                                          <div className="grid grid-cols-1 gap-4">
                                            {result.morseNFTData.map((nft) => (
                                              <div key={nft.tokenId} className="bg-white rounded-lg overflow-hidden border border-amber-200 shadow-sm">
                                                <div className="flex flex-col md:flex-row">
                                                  {/* NFT Image */}
                                                  <div className="w-full md:w-1/3">
                                                    <div className="aspect-square relative overflow-hidden">
                                                      <img 
                                                        src={nft.image.pngUrl || nft.image.cachedUrl || nft.image.originalUrl} 
                                                        alt={nft.name}
                                                        className="w-full h-full object-cover"
                                                      />
                                                    </div>
                                                  </div>
                                                  
                                                  {/* NFT Details */}
                                                  <div className="w-full md:w-2/3 p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                      <div>
                                                        <h4 className="text-lg font-bold text-amber-800">{nft.name}</h4>
                                                        <p className="text-sm text-amber-600">Token ID: {nft.tokenId}</p>
                                                      </div>
                                                      <a 
                                                        href={`https://opensea.io/assets/ethereum/${MORSE_NFT_ADDRESS}/${nft.tokenId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-600 px-2 py-1 rounded-full flex items-center transition-colors"
                                                      >
                                                        View on OpenSea
                                                        <ExternalLink className="ml-1 h-3 w-3" />
                                                      </a>
                                                    </div>
                                                    
                                                    {/* Rarity Badge - Prominently Displayed */}
                                                    {nft.raw?.metadata?.attributes?.find(attr => attr.trait_type === "Rarity")?.value && (
                                                      <div className="mb-4">
                                                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                                          <span className="mr-1">⭐</span>
                                                          {nft.raw.metadata.attributes.find(attr => attr.trait_type === "Rarity")?.value}
                                                        </div>
                                                      </div>
                                                    )}
                                                    
                                                    {/* Attributes Grid */}
                                                    <div className="mt-4">
                                                      <h5 className="text-sm font-semibold text-gray-700 mb-2">Attributes</h5>
                                                      <div className="grid grid-cols-2 gap-2">
                                                        {nft.raw?.metadata?.attributes
                                                          ?.filter(attr => attr.trait_type !== "Rarity") // Skip Rarity, already displayed above
                                                          .map((attr, index) => (
                                                            <div 
                                                              key={index} 
                                                              className="bg-amber-50 rounded-md py-1 px-2 border border-amber-100"
                                                            >
                                                              <div className="text-xs text-amber-600 font-medium">{attr.trait_type}</div>
                                                              <div className="text-sm text-amber-800 font-semibold truncate">{attr.value}</div>
                                                            </div>
                                                        ))}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="bg-white p-3 rounded-lg shadow-sm border border-amber-100 text-center">
                                          <div className="text-gray-500">No Morse NFTs found in this wallet</div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Empty wallet message */}
                                {(!result.rankData || result.rankData.rank === 0) &&
                                 (!result.portfolioData || result.portfolioData.length === 0) &&
                                 (!Object.values(result.expeditionData).some(data => data !== null && data.item)) &&
                                 (!result.morseTokenData) &&
                                 (!result.morseNFTData || result.morseNFTData.length === 0) && (
                                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                    <p className="text-amber-700 text-center flex items-center justify-center">
                                      <AlertTriangle className="h-4 w-4 mr-2" />
                                      No data found for this wallet in any of the Mitosis systems
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Enhanced Footer Section */}
            <div className="p-4 sm:p-5 border-t border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm gap-3">
                <div className="text-blue-600 font-medium flex items-center">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Your Stats on X
                </div>
                <div className="flex gap-4">
                  <a 
                    href="/mitosis-rank" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full flex items-center hover:shadow-md transition-all duration-200"
                  >
                    Game of Mito
                    <ExternalLink className="ml-1.5 h-3 w-3" />
                  </a>
                  <a 
                    href="https://expedition.mitosis.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-full flex items-center hover:shadow-md transition-all duration-200"
                  >
                    Mitosis Expedition
                    <ExternalLink className="ml-1.5 h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 