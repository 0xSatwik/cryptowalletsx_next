"use client";

import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Search, Loader2, ExternalLink, Wallet, Clock, ArrowRightLeft, Coins, Frame, Boxes, Twitter, Calendar, ChevronDown, ChevronUp, Building2, Users, ChevronRight, Clock3, Image, ArrowRight } from 'lucide-react';
import { fetchMonadTestnetStats } from '../../../lib/monadTestnet';
import type { MonadTestnetStats as BaseMonadTestnetStats, ERC1155Token, ERC20Token, ERC721NFT } from '../../../lib/monadTestnet';
import { formatUnits, JsonRpcProvider } from 'ethers';

// Extend the MonadTestnetStats type to include nativeBalance
interface MonadTestnetStats extends BaseMonadTestnetStats {
  nativeBalance?: string;
}

// Add a helper function to calculate wallet age
function calculateWalletAge(stats: MonadTestnetStats): { days: number; creationDate: string } {
  if (!stats.transactions || stats.transactions.length === 0) {
    return { days: 0, creationDate: 'N/A' };
  }
  
  // Find the earliest transaction timestamp
  const earliestTimestamp = stats.transactions.reduce((earliest, tx) => {
    return tx.block_timestamp < earliest ? tx.block_timestamp : earliest;
  }, Number.MAX_SAFE_INTEGER);
  
  if (earliestTimestamp === Number.MAX_SAFE_INTEGER) {
    return { days: 0, creationDate: 'N/A' };
  }
  
  const earliestDate = new Date(earliestTimestamp * 1000);
  const now = new Date();
  const days = Math.floor((now.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    days,
    creationDate: earliestDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };
}

// Update the wallet score calculation function
function calculateWalletScore(stats: MonadTestnetStats): number {
  if (!stats) return 0;
  
  // Use the pre-calculated scores from the updated stats object
  return stats.score;
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatBalance(balance: string, decimals: number = 18): string {
  try {
    // Convert hex to decimal if it's a hex string
    if (balance.startsWith('0x')) {
      balance = BigInt(balance).toString();
    }
    
    // Handle string inputs that might be decimal numbers
    if (balance.includes('.')) {
      const [integerPart, decimalPart] = balance.split('.');
      const paddedDecimal = decimalPart.padEnd(decimals, '0').slice(0, decimals);
      const fullNumber = integerPart + paddedDecimal;
      const value = BigInt(fullNumber);
      const divisor = BigInt(10 ** decimals);
      return (Number(value) / Number(divisor)).toFixed(4);
    }

    // Handle regular string inputs
    const value = BigInt(balance);
    const divisor = BigInt(10 ** decimals);
    const quotient = value / divisor;
    const remainder = value % divisor;
    const paddedRemainder = remainder.toString().padStart(decimals, '0');
    const fullNumber = `${quotient}.${paddedRemainder}`;
    return Number(fullNumber).toFixed(4);
  } catch (error) {
    console.error('Error formatting balance:', error);
    return '0.0000';
  }
}

// Replace the getNativeBalance function with a more robust implementation
function getNativeBalance(stats: MonadTestnetStats): string {
  // Get the balance from the stats if available
  if (stats && stats.nativeBalance) {
    return formatBalance(stats.nativeBalance);
  }
  return "0";
}

function getRpcTransactionCount(stats: MonadTestnetStats): number {
  // Return the total transactions count as a fallback
  return stats.totalTransactions;
}

function getActivityByDay(stats: MonadTestnetStats): number {
  return stats.activityByDay;
}

function MonadTestnetStats() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [stats, setStats] = useState<MonadTestnetStats | null>(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const [showContracts, setShowContracts] = useState(false);
  const [showInteractions, setShowInteractions] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const [showERC721, setShowERC721] = useState(false);
  const [showERC1155, setShowERC1155] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionPage, setTransactionPage] = useState(1);
  const transactionsPerPage = 20;
  const [tokens, setTokens] = useState<ERC20Token[]>([]);
  const [nfts, setNfts] = useState<ERC721NFT[]>([]);
  const [erc1155Tokens, setErc1155Tokens] = useState<ERC1155Token[]>([]);
  const [nftPage, setNftPage] = useState(1);
  const nftsPerPage = 10;
  const [erc1155Page, setErc1155Page] = useState(1);
  const erc1155PerPage = 10;
  const [walletBalance, setWalletBalance] = useState<string>("0");
  
  // Add ref for search section scrolling
  const searchSectionRef = useRef<HTMLDivElement>(null);
  
  // Function to scroll to search section
  const scrollToSearchSection = () => {
    searchSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || loading) return;

    setLoading(true);
    setLoadingStatus('Initializing...');
    setError(null);
    setStats(null); // Reset stats when starting a new search
    setWalletBalance("0"); // Reset balance
    
    try {
      // Create a callback to update loading status
      const statusCallback = (status: string) => {
        console.log("Status update:", status);
        setLoadingStatus(status);
      };
      
      // Fetch the native balance using ethers.js
      statusCallback('Fetching wallet balance...');
      let formattedBalance = "0";
      try {
        const provider = new JsonRpcProvider('https://testnet-rpc.monad.xyz');
        const balance = await provider.getBalance(address);
        formattedBalance = formatBalance(balance.toString());
        setWalletBalance(formattedBalance);
      } catch (balanceError) {
        console.error('Error fetching balance:', balanceError);
      }
      
      // Pass the status callback to the fetch function
      statusCallback('Fetching wallet stats...');
      const statsData = await fetchMonadTestnetStats(address, statusCallback) as MonadTestnetStats;
      
      // Add the balance to the stats object
      statsData.nativeBalance = formattedBalance;
      
      setStats(statsData);
      setTransactionPage(1); // Reset transaction page when loading new data
      setNftPage(1); // Reset NFT page when loading new data
      setErc1155Page(1); // Reset ERC1155 page when loading new data
      
      // Set token data directly from the stats
      setTokens(statsData.tokens || []);
      setNfts(statsData.nfts || []);
      setErc1155Tokens(statsData.erc1155Tokens || []);
      
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      setError(error.message || 'An error occurred while fetching data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTweetUrl = () => {
    if (!stats) return '';
    
    // Check if user is an early user
    const earliestTx = stats.transactions && stats.transactions.length > 0 
      ? stats.transactions.reduce((earliest, tx) => tx.block_timestamp < earliest.block_timestamp ? tx : earliest, stats.transactions[0])
      : null;
      
    const earliestTxDate = earliestTx ? new Date(earliestTx.block_timestamp * 1000) : null;
    const cutoffDate = new Date('2025-02-26T23:59:00Z'); // February 26th, 2025, 11:59pm UTC
    const isEarlyUser = earliestTxDate && earliestTxDate < cutoffDate;
    
    const score = calculateWalletScore(stats).toFixed(2);
    
    // Check if the user holds 1 million NAD tokens
    const is1MillionNadHolder = stats.tokens.some(token => 
      token.symbol?.toLowerCase() === 'nad' && 
      parseFloat(token.balance) >= 1000000
    );
    
    // Check if the user holds the second NFT
    const isSecondNftHolder = stats.nfts.some(nft => 
      nft.token_address?.toLowerCase() === '0x1234567890abcdef1234567890abcdef12345678'
    );
    
    let text = `🚀 Just checked my wallet stats on Monad Testnet!\n\n` +
      `🏆 Wallet Score: ${score}\n` +
      `💰 ${getNativeBalance(stats)} MON\n` +
      `📊 ${stats.totalTransactions.toLocaleString()} total transactions\n` +
      `💸 ${parseFloat(stats.totalVolume).toFixed(2)} MON volume\n`;
      
    // Add badges
    if (is1MillionNadHolder) {
      text += `✅ 1 Million Nad Holder\n`;
    }
    
    if (isSecondNftHolder) {
      text += `✅ Monad Cipher SBT Holder\n`;
    }
    
    if (isEarlyUser) {
      text += `⏰ Early Monad User (since ${earliestTxDate!.toLocaleDateString()})\n`;
    }
    
    // Add blank line and website
    text += `\nCheck your stats - cryptowalletsx.com/monad-testnet\n\n` +
      `#Monad #MonadTestnet #Airdrop $MON`;
    
    return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
  };

  // Get total contract interactions
  const getTotalInteractions = () => {
    if (!stats) return 0;
    return stats.contractsInteracted.addresses.reduce((sum: number, contract: string) => sum + 1, 0);
  };

  // Get last transaction hash and date
  const getLastTransaction = () => {
    if (!stats || !stats.transactions || stats.transactions.length === 0) return { hash: null, date: 'N/A' };
    
    // Find the latest transaction by timestamp
    const latestTx = stats.transactions.reduce((latest: any, current: any) => {
      return current.block_timestamp > latest.block_timestamp ? current : latest;
    }, stats.transactions[0]);
    
    return { 
      hash: latestTx.hash,
      date: new Date(latestTx.block_timestamp * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  };

  // Get paginated transactions
  const getPaginatedTransactions = () => {
    if (!stats || !stats.transactions) return [];
    const startIndex = (transactionPage - 1) * transactionsPerPage;
    return stats.transactions.slice(startIndex, startIndex + transactionsPerPage);
  };

  // Load more transactions
  const loadMoreTransactions = () => {
    setTransactionPage(prev => prev + 1);
  };

  // Check if there are more transactions to load
  const hasMoreTransactions = () => {
    if (!stats || !stats.transactions) return false;
    return transactionPage * transactionsPerPage < stats.transactions.length;
  };

  // Get paginated NFTs
  const getPaginatedNFTs = () => {
    if (!nfts) return [];
    const startIndex = 0;
    const endIndex = nftPage * nftsPerPage;
    return nfts.slice(startIndex, endIndex);
  };

  // Load more NFTs
  const loadMoreNFTs = () => {
    setNftPage(prev => prev + 1);
  };

  // Check if there are more NFTs to load
  const hasMoreNFTs = () => {
    if (!nfts) return false;
    return nftPage * nftsPerPage < nfts.length;
  };

  // Handle NFT image error
  const handleNftImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/walletsxnft.webp'; // Ensure this path matches the file in public folder
    e.currentTarget.onerror = null; // Prevent infinite loop if fallback also fails
  };

  // Get paginated ERC1155 tokens
  const getPaginatedERC1155 = () => {
    if (!stats) return [];
    return stats.erc1155Tokens.slice(0, erc1155Page * 6);
  };

  // Load more ERC1155 tokens
  const loadMoreERC1155 = () => {
    setErc1155Page(prev => prev + 1);
  };

  // Check if there are more ERC1155 tokens to load
  const hasMoreERC1155 = () => {
    if (!stats) return false;
    return erc1155Page * 6 < stats.erc1155Tokens.length;
  };

  return (
    <>
      <Head>
        <title>Monad Testnet Stats Checker | Check Monad Rank & Wallet Status</title>
        <meta 
          name="description" 
          content="Analyze your wallet rank on Monad Testnet. Use our Monad Checker for free stats, transaction history, and ranking. Check wallet status and activity score." 
        />
        <meta 
          name="keywords" 
          content="Monad Testnet rank checker, monad stats checker, monad testnet stats, check monad rank, monad wallet checker, monad transaction checker, monad testnet ranking, monad wallet stats" 
        />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cryptowalletsx.com/monad-testnet-stats" />
        <meta property="og:title" content="Monad Testnet Stats & Wallet Checker | Transaction Analysis Tool" />
        <meta property="og:description" content="Check your Monad wallet status, rank, and transaction history. Free Monad Testnet stats checker with detailed activity scoring." />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://cryptowalletsx.com/monad-testnet-stats" />
        <meta name="twitter:title" content="Monad Testnet Stats & Wallet Checker | Transaction Analysis Tool" />
        <meta name="twitter:description" content="Check your Monad wallet status, rank, and transaction history. Free Monad Testnet stats checker with detailed activity scoring." />
        
        {/* Structured data for rich results */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Monad Testnet Stats Checker",
            "url": "https://cryptowalletsx.com/monad-testnet-stats",
            "description": "Comprehensive tool for checking Monad wallet status, testnet rank, and transaction history with detailed analytics",
            "applicationCategory": "Web Tool",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "215",
              "bestRating": "5",
              "worstRating": "1"
            },
            "operatingSystem": "Any",
            "author": {
              "@type": "Organization",
              "name": "WalletsX"
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://cryptowalletsx.com/monad-testnet-stats?address={wallet_address}"
              },
              "query-input": "required name=wallet_address"
            }
          }
        `}</script>
      </Head>

      <div className="max-w-5xl mx-auto px-2 sm:px-6">
        <h1 className="text-4xl font-extrabold text-center text-purple-800 mb-4 bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">Monad Testnet Stats Checker</h1>
        <p className="text-center text-gray-600 mb-6 max-w-3xl mx-auto">Check your wallet activity, rank and performance on Monad Testnet. The ultimate Monad rank checker, Monad activity checker and Monad stats tracker to monitor your testnet participation.</p>

        {/* MegaETH Promotion Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="flex flex-col md:flex-row items-center">
            <div className="p-6 md:p-8 flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">🌟 Now Live on MegaETH! 🌟</h2>
              <p className="text-blue-100 mb-4">Check your wallet stats, transaction history, and score on MegaETH. Get insights into your on-chain activity and wallet performance.</p>
              <Link href="/megaeth" className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-blue-700 font-medium hover:bg-blue-50 transition-colors">
                Check Your MegaETH Stats Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div className="w-full md:w-1/3 p-6 flex justify-center items-center bg-blue-700/50">
              <Wallet size={80} className="text-white opacity-75" />
            </div>
          </div>
        </div>

        <div ref={searchSectionRef} className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-purple-100 bg-gradient-to-br from-white to-purple-50">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Wallet className="text-purple-500" size={20} />
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your Monad wallet address"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all shadow-sm hover:shadow-md"
                  aria-label="Wallet address input"
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <Search className="text-purple-400" size={18} />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-md"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                <span>{loading ? 'Analyzing...' : 'Check Stats'}</span>
              </button>
            </div>

            {loading && loadingStatus && (
              <div className="mt-4 text-center text-sm text-gray-700 bg-purple-50 p-4 rounded-xl border border-purple-100 animate-pulse">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin text-purple-600" size={18} />
                  <span className="font-medium">{loadingStatus}</span>
                </div>
                <div className="mt-3 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${loadingStatus.includes('Fetching pages') ? 
                        parseInt(loadingStatus.split('of')[0].split('pages')[1].trim().split('-')[1] || '0') / 
                        parseInt(loadingStatus.split('of')[1].trim().split('...')[0] || '20') * 100 : 
                        loadingStatus.includes('Found') ? '100' : '30'}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Tips for increasing wallet score - Shows when no results are displayed */}
            {!stats && !loading && (
              <div className="max-w-3xl mx-auto mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 shadow-md border border-purple-100">
                <h3 className="text-2xl font-bold text-center text-purple-800 mb-5 flex items-center justify-center">
                  <span className="mr-2">✨</span> Boost Your Monad Wallet Score <span className="ml-2">✨</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition-all hover:translate-y-[-2px] border border-purple-50 transform duration-200">
                    <div className="flex items-center mb-3">
                      <div className="p-2.5 bg-purple-100 rounded-lg mr-3">
                        <Calendar className="text-purple-600" size={22} />
                      </div>
                      <h4 className="font-semibold text-purple-800 text-lg">Daily Activity</h4>
                    </div>
                    <p className="text-gray-600">Interact with the testnet regularly. Each active day adds 0.1 points to your score!</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition-all hover:translate-y-[-2px] border border-indigo-50 transform duration-200">
                    <div className="flex items-center mb-3">
                      <div className="p-2.5 bg-indigo-100 rounded-lg mr-3">
                        <ArrowRightLeft className="text-indigo-600" size={22} />
                      </div>
                      <h4 className="font-semibold text-indigo-800 text-lg">Transaction Volume</h4>
                    </div>
                    <p className="text-gray-600">More transactions means higher scores. Each transaction adds 0.01 points (up to 500 transactions max)!</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition-all hover:translate-y-[-2px] border border-pink-50 transform duration-200">
                    <div className="flex items-center mb-3">
                      <div className="p-2.5 bg-pink-100 rounded-lg mr-3">
                        <Building2 className="text-pink-600" size={22} />
                      </div>
                      <h4 className="font-semibold text-pink-800 text-lg">Create Contracts</h4>
                    </div>
                    <p className="text-gray-600">Deploy smart contracts to earn 0.025 points per contract (up to 20 contracts). Interact with contracts for 0.03 points each!</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition-all hover:translate-y-[-2px] border border-amber-50 transform duration-200">
                    <div className="flex items-center mb-3">
                      <div className="p-2.5 bg-amber-100 rounded-lg mr-3">
                        <Image className="text-amber-600" size={22} />
                      </div>
                      <h4 className="font-semibold text-amber-800 text-lg">Hold 1 Million Nad</h4>
                    </div>
                    <p className="text-gray-600">The coveted 1 Million Nad NFT gives you a full 1.0 point bonus! Hold this special NFT to boost your score.</p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {stats && (
          <div className="space-y-6 mb-8">
            {/* Wallet Stats Overview */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10">
                <Wallet size={180} strokeWidth={1} />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 relative z-10">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-1">Wallet Stats</h2>
                  <p className="text-purple-100 max-w-md">{truncateAddress(address)}</p>
                </div>

                <div className="mt-3 sm:mt-0">
                  <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg shadow-inner">
                    <Clock3 size={18} className="mr-2" />
                    <span className="text-sm font-medium">
                      Account Age: {calculateWalletAge(stats).days} days
                      <span className="block text-xs text-purple-200">First activity: {calculateWalletAge(stats).creationDate}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Score Card */}
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-5 mb-6 shadow-lg border border-white/20 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  {/* Score section with rank */}
                  <div>
                    <p className="text-purple-100 font-medium mb-1">Wallet Score</p>
                    <div className="flex items-baseline">
                      <h3 className="text-4xl sm:text-5xl font-bold">{calculateWalletScore(stats).toFixed(2)}</h3>
                    </div>
                    <div className="mt-2 flex flex-col sm:flex-row gap-2">
                      <a 
                        href="/how-monad-stats-score-works" 
                        target="_blank"
                        className="text-white/90 hover:text-white text-sm font-medium flex items-center bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <span>How Monad Score Works</span>
                        <ArrowRight size={14} className="ml-1" />
                      </a>
                      <a 
                        href="https://t.me/cryptowalletsx" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/90 hover:text-white text-sm font-medium flex items-center bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <span>Join Our Telegram</span>
                        <ExternalLink size={14} className="ml-1" />
                      </a>
                    </div>
                  </div>
                  
                  {stats.transactions && stats.transactions.length > 0 && (
                    <div className="flex flex-col text-sm bg-white/10 rounded-lg p-3">
                      <span className="text-purple-100">First Activity</span>
                      <a
                        href={`https://testnet.monadexplorer.com/tx/${stats.transactions[0].hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-purple-200 transition-colors inline-flex items-center mt-1"
                      >
                        {truncateAddress(stats.transactions[0].hash)}
                        <ExternalLink size={12} className="ml-1" />
                      </a>
                      <span className="text-white font-medium mt-1">
                        {new Date(stats.transactions[0].block_timestamp * 1000).toLocaleDateString()}
                      </span>
                      <span className="text-purple-200 text-xs mt-1">
                        {calculateWalletAge(stats).days} days ago
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 1 Million Nad Holder Badge */}
              <div className="mb-4">
                {stats && (() => {
                  // Check if the user holds 1 million NAD tokens
                  const is1MillionNadHolder = stats.tokens.some(token => 
                    token.symbol?.toLowerCase() === 'nad' && 
                    parseFloat(token.balance) >= 1000000
                  );
                  
                  return is1MillionNadHolder ? (
                  <div className="bg-green-600 backdrop-blur-sm rounded-xl p-4 border border-green-500 shadow-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-3 bg-white/15 rounded-xl mr-4 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white stroke-current">
                          <path d="M20 6L9 17L4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">1 Million Nad Holder</p>
                        <p className="text-white/90 text-sm">Congratulations! You've earned +1.0 bonus points!</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex">
                      <Image className="text-white" size={24} />
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-red-600/80 to-red-500/80 backdrop-blur-sm rounded-xl p-4 border border-red-300/20 shadow-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-3 bg-white/15 rounded-xl mr-4 relative">
                        <Image className="text-white/70" size={24} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-200 stroke-current">
                            <path d="M18 6L6 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 6L18 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">Not a 1 Million Nad Holder</p>
                        <p className="text-white/90 text-sm">Get this NFT to earn +1.0 bonus points!</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex">
                      <span className="text-3xl">❌</span>
                    </div>
                  </div>
                  );
                })()}
              </div>
              
              {/* Second NFT Holder Badge */}
              <div className="mb-4">
                {stats && (() => {
                  // Check if the user holds the second NFT
                  const isSecondNftHolder = stats.nfts.some(nft => 
                    nft.token_address?.toLowerCase() === '0x1234567890abcdef1234567890abcdef12345678'
                  );
                  
                  return isSecondNftHolder ? (
                  <div className="bg-green-600 backdrop-blur-sm rounded-xl p-4 border border-green-500 shadow-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-3 bg-white/15 rounded-xl mr-4 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white stroke-current">
                          <path d="M20 6L9 17L4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">Monad Games Cipher SBT Holder</p>
                        <p className="text-white/90 text-sm">Congratulations! You're holding the Monad Games Cipher SBT</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex">
                      <Image className="text-white" size={24} />
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-red-600/80 to-red-500/80 backdrop-blur-sm rounded-xl p-4 border border-red-300/20 shadow-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-3 bg-white/15 rounded-xl mr-4 relative">
                        <Image className="text-white/70" size={24} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-200 stroke-current">
                            <path d="M18 6L6 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 6L18 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">Not a Monad Games Cipher SBT Holder</p>
                        <p className="text-white/90 text-sm">You don't own the second special NFT yet.</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex">
                      <span className="text-3xl">❌</span>
                    </div>
                  </div>
                  );
                })()}
              </div>
              
              {/* Early User Badge */}
              <div className="mb-4">
                {stats && (() => {
                  // Use the earliest transaction timestamp instead of firstSeen
                  const earliestTx = stats.transactions && stats.transactions.length > 0 
                    ? stats.transactions.reduce((earliest, tx) => tx.block_timestamp < earliest.block_timestamp ? tx : earliest, stats.transactions[0])
                    : null;
                    
                  const earliestTxDate = earliestTx ? new Date(earliestTx.block_timestamp * 1000) : null;
                  const cutoffDate = new Date('2025-02-26T23:59:00Z'); // February 26th, 2025, 11:59pm UTC
                  const isEarlyUser = earliestTxDate && earliestTxDate < cutoffDate;
                  
                  if (!earliestTxDate) {
                    return null; // Don't show the badge if we can't determine first transaction
                  }
                  
                  return isEarlyUser ? (
                    <div className="bg-green-600 backdrop-blur-sm rounded-xl p-4 border border-green-500 shadow-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-3 bg-white/15 rounded-xl mr-4 flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white stroke-current">
                            <path d="M20 6L9 17L4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">Early Monad User</p>
                          <p className="text-white/90 text-sm">Congratulations! First transaction on {earliestTxDate.toLocaleDateString()} - before Feb 26th, 2025 cutoff</p>
                        </div>
                      </div>
                      <div className="hidden sm:flex">
                        <Clock className="text-white" size={24} />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-red-600/80 to-red-500/80 backdrop-blur-sm rounded-xl p-4 border border-red-300/20 shadow-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-3 bg-white/15 rounded-xl mr-4 relative">
                          <Clock className="text-white/70" size={24} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-200 stroke-current">
                              <path d="M18 6L6 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M6 6L18 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">Not an Early User</p>
                          <p className="text-white/90 text-sm">First transaction on {earliestTxDate.toLocaleDateString()} - after Feb 26th, 2025 cutoff</p>
                        </div>
                      </div>
                      <div className="hidden sm:flex">
                        <span className="text-3xl">❌</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              {/* Row 1: Balance and Last Transaction */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Balance Card */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 flex items-center gap-4 border border-white/20 transform transition-transform hover:translate-y-[-2px]">
                  <div className="p-3 bg-white/15 rounded-xl">
                    <Wallet className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Balance</p>
                    <p className="text-xl font-bold">{walletBalance} MON</p>
                  </div>
                </div>

                {/* Last Transaction Card */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 flex items-center gap-4 border border-white/20 transform transition-transform hover:translate-y-[-2px]">
                  <div className="p-3 bg-white/15 rounded-xl">
                    <Clock className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Last Activity</p>
                    <p className="text-xl font-bold">{getLastTransaction().date}</p>
                    {getLastTransaction().hash && (
                      <a
                        href={`https://testnet.monadexplorer.com/tx/${getLastTransaction().hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-100 hover:text-white text-xs inline-flex items-center"
                      >
                        View Transaction
                        <ExternalLink size={12} className="ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 3: Volume and Transactions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Total Volume */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 flex items-center gap-4 border border-white/20 transform transition-transform hover:translate-y-[-2px]">
                  <div className="p-3 bg-white/15 rounded-xl">
                    <Coins className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Volume</p>
                    <p className="text-xl font-bold">{stats && parseFloat(stats.totalVolume).toFixed(2)} MON</p>
                  </div>
                </div>

                {/* Total Transactions */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 flex items-center gap-4 border border-white/20 transform transition-transform hover:translate-y-[-2px]">
                  <div className="p-3 bg-white/15 rounded-xl">
                    <ArrowRightLeft className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Transactions</p>
                    <p className="text-xl font-bold">{getRpcTransactionCount(stats)}</p>
                  </div>
                </div>
              </div>

              {/* Row 4: Activity Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 transform transition-transform hover:translate-y-[-2px]">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/15 rounded-xl">
                      <Calendar className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Unique Days</p>
                      <p className="text-xl font-bold">{stats?.activityByDay}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 transform transition-transform hover:translate-y-[-2px]">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/15 rounded-xl">
                      <Frame className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Unique Weeks</p>
                      <p className="text-xl font-bold">{stats?.activityByWeek}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 transform transition-transform hover:translate-y-[-2px]">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/15 rounded-xl">
                      <Boxes className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Unique Months</p>
                      <p className="text-xl font-bold">{stats?.activityByMonth}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Share Section - Added Above Contracts */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 bg-gradient-to-br from-white to-indigo-50">
              <div className="flex flex-col items-center gap-4">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Share Your Stats</h3>
                  <p className="text-gray-600 max-w-md mx-auto">Show off your Monad Testnet activity and ranking!</p>
                </div>
                
                <a
                  href={getTweetUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium transition-all transform hover:scale-105 hover:shadow-lg shadow-md"
                >
                  <Twitter size={22} />
                  <span className="font-medium">Share on X</span>
                </a>
              </div>
            </div>

            {/* Contracts Created */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Building2 className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Contracts Created</h2>
                    <p className="text-gray-600">
                      {stats.contractsCreated.total} contracts
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowContracts(!showContracts)}
                  className="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg text-purple-700 transition-colors"
                >
                  {showContracts ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                </button>
              </div>

              {showContracts && (
                <div className="overflow-x-auto rounded-xl border border-gray-100 shadow">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contract</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.contractsCreated.addresses.map((contract: string) => (
                        <tr key={contract} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <a
                                href={`https://testnet.monadexplorer.com/address/${contract}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-purple-600 hover:text-purple-800"
                              >
                                <span className="hidden sm:inline">{contract}</span>
                                <span className="sm:hidden">{truncateAddress(contract)}</span>
                                <ExternalLink size={14} className="inline-block ml-1 opacity-70" />
                              </a>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stats.contractsCreated.timestamps[contract] ? new Date(stats.contractsCreated.timestamps[contract] * 1000).toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {showContracts && stats.contractsCreated.addresses.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-gray-500">No contracts created by this address</p>
                </div>
              )}
            </div>

            {/* Contracts Interacted */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Contracts Interacted</h2>
                    <p className="text-gray-600">
                      {stats.contractsInteracted.total} unique contracts with {getTotalInteractions()} interactions 
                      {stats.totalTransactions > stats.transactions?.length ? 
                        ` (based on ${stats.transactions?.length || 0} of ${stats.totalTransactions} total transactions)` : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInteractions(!showInteractions)}
                  className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-700 transition-colors"
                >
                  {showInteractions ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                </button>
              </div>

              {showInteractions && (
                <div className="overflow-x-auto rounded-xl border border-gray-100 shadow">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contract</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Interactions</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Interaction</th>
                      </tr>
                    </thead>
                
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.contractsInteracted.addresses.map((contract: string) => (
                        <tr key={contract} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <a
                                href={`https://testnet.monadexplorer.com/address/${contract}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 hover:text-blue-800"
                              >
                                <span className="hidden sm:inline">{contract}</span>
                                <span className="sm:hidden">{truncateAddress(contract)}</span>
                                <ExternalLink size={14} className="inline-block ml-1 opacity-70" />
                              </a>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stats.contractsInteracted.interactionCounts[contract]?.toLocaleString() || '0'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stats.contractsInteracted.timestamps[contract] ? new Date(stats.contractsInteracted.timestamps[contract] * 1000).toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {showInteractions && stats.contractsInteracted.addresses.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-gray-500">No contract interactions from this address</p>
                </div>
              )}
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <ArrowRightLeft className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
                    <p className="text-gray-600">
                      {stats.totalTransactions > stats.transactions?.length ? 
                        `Showing ${stats.transactions?.length || 0} of ${stats.totalTransactions} total transactions` : 
                        `${stats.transactions?.length || 0} transactions`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTransactions(!showTransactions)}
                  className="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg text-purple-700 transition-colors"
                >
                  {showTransactions ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                </button>
              </div>

              {showTransactions && stats.transactions && stats.transactions.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-gray-100 shadow">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hash</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Value</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gas Fee</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getPaginatedTransactions().map((tx: any) => (
                        <tr key={tx.hash} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <a
                              href={`https://testnet.monadexplorer.com/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-800 font-medium flex items-center"
                            >
                              {truncateAddress(tx.hash)}
                              <ExternalLink size={14} className="ml-1 opacity-70" />
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium">
                              {tx.function_selector ? 
                                (tx.function_selector.length > 2 ? tx.function_selector.substring(0, 10) : 'Transfer') 
                                : 'Transfer'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            {formatBalance(tx.value)} MON
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {(() => {
                              // Calculate gas fee from gas_used and effective_gas_price
                              const gasFee = (tx.gas_used * parseFloat(tx.effective_gas_price)) / 1e18;
                              return gasFee.toFixed(6);
                            })()} MON
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {new Date(tx.block_timestamp * 1000).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {hasMoreTransactions() && (
                    <div className="text-center pt-6 pb-2">
                      <button
                        onClick={loadMoreTransactions}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-indigo-600 transition-colors shadow-sm"
                      >
                        Load More <ChevronRight size={18} />
                      </button>
                      <p className="text-sm text-gray-500 mt-3">
                        Showing {Math.min(transactionPage * transactionsPerPage, stats.transactions.length)} of {stats.transactions.length} transactions
                      </p>
                    </div>
                  )}
                </div>
              )}

              {showTransactions && (!stats.transactions || stats.transactions.length === 0) && (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-gray-500">No transactions found for this address</p>
                </div>
              )}
            </div>

            {/* Tokens Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Coins className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Tokens</h2>
                    <p className="text-gray-600">
                      {tokens.length} ERC20 tokens
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTokens(!showTokens)}
                  className="p-2 bg-green-100 hover:bg-green-200 rounded-lg text-green-700 transition-colors"
                >
                  {showTokens ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                </button>
              </div>

              {showTokens && tokens.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-gray-100 shadow">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Token</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Balance</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tokens.map((token) => (
                        <tr key={token.token_address} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-700 rounded-full mr-3 font-bold">
                                {token.symbol ? token.symbol.charAt(0) : 'T'}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{token.name || 'Unknown Token'}</div>
                                <div className="text-xs text-gray-500">{token.symbol}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatUnits(token.balance, token.decimals)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <a
                              href={`https://testnet.monadexplorer.com/token/${token.token_address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                            >
                              View <ExternalLink size={14} />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {showTokens && tokens.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-gray-500">No tokens found for this address</p>
                </div>
              )}
            </div>

            {/* ERC721 Tokens Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-pink-100 rounded-xl">
                    <Image className="text-pink-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">ERC721 Tokens</h2>
                    <p className="text-gray-600">
                      {nfts.length} NFTs
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowERC721(!showERC721)}
                  className="p-2 bg-pink-100 hover:bg-pink-200 rounded-lg text-pink-700 transition-colors"
                >
                  {showERC721 ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                </button>
              </div>

              {showERC721 && nfts.length > 0 && (
                <React.Fragment>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getPaginatedNFTs().map((nft) => (
                      <div key={`${nft.token_address}-${nft.token_id}`} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:translate-y-[-3px] duration-300 overflow-hidden border border-gray-100">
                        <div className="aspect-square bg-gray-100 overflow-hidden relative">
                          {(nft.image_url || nft?.extra_metadata?.image_url) && (
                            <img
                              src={nft.image_url || nft?.extra_metadata?.image_url || ''}
                              alt={nft.name || 'NFT'}
                              onError={handleNftImageError}
                              className="w-full h-full object-cover"
                            />
                          )}
                          {!nft.image_url && !nft?.extra_metadata?.image_url && (
                            <img
                              src="/walletsxnft.webp"
                              alt="Fallback NFT Image"
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute top-3 right-3">
                            <div className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-md">
                              #{nft.token_id}
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg mb-1 text-gray-900">
                            {nft.name || `#${nft.token_id}`}
                          </h3>
                          {nft.collection?.name && (
                            <p className="text-sm text-gray-600 mb-3">
                              {nft.collection?.name}
                            </p>
                          )}
                          {nft.contract && (
                            <div className="flex justify-end">
                              <a
                                href={`https://testnet.monadexplorer.com/nft/${nft.token_address}/${nft.token_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors text-sm"
                              >
                                View on Explorer <ExternalLink size={14} />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {nfts.length > 0 && hasMoreNFTs() && (
                    <div className="text-center mt-8">
                      <button
                        onClick={loadMoreNFTs}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-rose-600 transition-colors shadow-sm"
                      >
                        Load More NFTs <ChevronRight size={18} />
                      </button>
                      <p className="text-sm text-gray-500 mt-3">
                        Showing {Math.min(nftPage * nftsPerPage, nfts.length)} of {nfts.length} ERC721 Tokens
                      </p>
                    </div>
                  )}
                </React.Fragment>
              )}
              
              {showERC721 && nfts.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-gray-500">No ERC721 tokens found for this address</p>
                </div>
              )}
            </div>

            {/* ERC1155 Tokens Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <Boxes className="text-indigo-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">ERC1155 Tokens</h2>
                    <p className="text-gray-600">
                      {erc1155Tokens.length} tokens
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowERC1155(!showERC1155)}
                  className="p-2 bg-indigo-100 hover:bg-indigo-200 rounded-lg text-indigo-700 transition-colors"
                >
                  {showERC1155 ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                </button>
              </div>

              {showERC1155 && erc1155Tokens.length > 0 && (
                <React.Fragment>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getPaginatedERC1155().map((token) => (
                      <div key={`${token.token_address}-${token.token_id}`} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:translate-y-[-3px] duration-300 overflow-hidden border border-gray-100">
                        <div className="aspect-square bg-gray-100 overflow-hidden relative">
                          {token.metadata_url && (
                            <img
                              src={token.metadata_url}
                              alt={token.contract?.name || `Token #${token.token_id}`}
                              className="w-full h-full object-cover"
                              onError={handleNftImageError}
                            />
                          )}
                          {!token.metadata_url && (
                            <img
                              src="/walletsxnft.webp"
                              alt="Fallback ERC1155 Image"
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute top-3 right-3">
                            <div className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-md">
                              #{token.token_id}
                            </div>
                          </div>
                          <div className="absolute bottom-3 left-3">
                            <div className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg">
                              Balance: {token.balance}
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg mb-1 text-gray-900">
                            {token.contract?.name || `Token #${token.token_id}`}
                          </h3>
                          {token.collection?.name && (
                            <p className="text-sm text-gray-600 mb-3">
                              {token.collection.name}
                            </p>
                          )}
                          <div className="flex justify-end">
                            <a
                              href={`https://testnet.monadexplorer.com/nft/${token.token_address}/${token.token_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm"
                            >
                              View on Explorer <ExternalLink size={14} />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {erc1155Tokens.length > 0 && hasMoreERC1155() && (
                    <div className="text-center mt-8">
                      <button
                        onClick={loadMoreERC1155}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-blue-600 transition-colors shadow-sm"
                      >
                        Load More ERC1155 Tokens <ChevronRight size={18} />
                      </button>
                      <p className="text-sm text-gray-500 mt-3">
                        Showing {Math.min(erc1155Page * erc1155PerPage, erc1155Tokens.length)} of {erc1155Tokens.length} ERC1155 Tokens
                      </p>
                    </div>
                  )}
                </React.Fragment>
              )}
              
              {showERC1155 && erc1155Tokens.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-gray-500">No ERC1155 tokens found for this address</p>
                </div>
              )}
            </div>
            
            {/* Tips for increasing wallet score - Shows below results */}
            <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 shadow-lg border border-purple-100">
              <h3 className="text-2xl font-bold text-center text-purple-800 mb-6 flex items-center justify-center">
                <span className="mr-2">🚀</span> Level Up Your Monad Score <span className="ml-2">🚀</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all hover:translate-y-[-2px] transform duration-200 border border-purple-50">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl mr-3">
                      <Calendar className="text-purple-600" size={22} />
                    </div>
                    <h4 className="font-semibold text-purple-800 text-lg">Consistency Matters</h4>
                  </div>
                  <p className="text-gray-600">Be active across multiple weeks and months. Each unique day adds 0.1 points, each week adds 0.25 points, and each month adds 0.5 points!</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all hover:translate-y-[-2px] transform duration-200 border border-indigo-50">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-indigo-100 rounded-xl mr-3">
                      <Users className="text-indigo-600" size={22} />
                    </div>
                    <h4 className="font-semibold text-indigo-800 text-lg">Contract Interactions</h4>
                  </div>
                  <p className="text-gray-600">Create and interact with different contracts. Each contract creation adds 0.025 points and each unique contract interaction adds 0.03 points!</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all hover:translate-y-[-2px] transform duration-200 border border-amber-50">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-amber-100 rounded-xl mr-3">
                      <Image className="text-amber-600" size={22} />
                    </div>
                    <h4 className="font-semibold text-amber-800 text-lg">Collect NFTs</h4>
                  </div>
                  <p className="text-gray-600">Each unique NFT contract adds 0.025 points to your score. Get the 1 Million Nad NFT for a massive 1.0 point bonus!</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all hover:translate-y-[-2px] transform duration-200 border border-red-50">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-red-100 rounded-xl mr-3">
                      <Clock className="text-red-600" size={22} />
                    </div>
                    <h4 className="font-semibold text-red-800 text-lg">Stay Active</h4>
                  </div>
                  <p className="text-gray-600">Don't go inactive for 5+ days or you'll lose 0.5 points! Regular transactions (0.01 points each) help maintain activity.</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all hover:translate-y-[-2px] transform duration-200 border border-green-50">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-green-100 rounded-xl mr-3">
                      <Coins className="text-green-600" size={22} />
                    </div>
                    <h4 className="font-semibold text-green-800 text-lg">Volume Matters</h4>
                  </div>
                  <p className="text-gray-600">Transferring MON adds points: 0.1 points for 100 MON, 0.2 points for 200 MON, and max 1 point for 1000+ MON volume!</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all hover:translate-y-[-2px] transform duration-200 border border-pink-50">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-pink-100 rounded-xl mr-3">
                      <Boxes className="text-pink-600" size={22} />
                    </div>
                    <h4 className="font-semibold text-pink-800 text-lg">Diversify Activity</h4>
                  </div>
                  <p className="text-gray-600">Try different types of transactions and interactions. A diverse portfolio of activities will maximize your wallet score!</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-center mt-6 mb-12">
        <button
          onClick={scrollToSearchSection}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150"
        >
          Get started now and watch your wallet score grow! 🚀
        </button>
      </div>
      
      {/* Enhanced Feature Section with High CPC Keywords */}
      <div className="max-w-4xl mx-auto px-4 py-10 bg-gradient-to-b from-white to-purple-50 rounded-2xl shadow-lg mb-16">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-800 to-indigo-700 mb-8">
          The Ultimate Analytics for Monad Blockchain
        </h2>
        
        <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto mb-10 font-light leading-relaxed">
          Monad combines the security of <span className="font-semibold text-indigo-700">Bitcoin</span> with the programmability of <span className="font-semibold text-indigo-700">Ethereum</span>, 
          delivering a revolutionary <span className="font-semibold text-indigo-700">blockchain</span> experience with 10,000 TPS.
        </p>
        
        {/* Feature Cards Row 1 */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 border-t-4 border-purple-600">
            <div className="flex items-start mb-4">
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-3 rounded-lg text-white mr-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Comprehensive Wallet Scoring</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our proprietary algorithm analyzes your on-chain activity to calculate your Monad score, similar to how 
                  <span className="font-medium text-indigo-700"> EVM & other chains like Solana , Bitcoin</span> wallets are ranked in the cryptocurrency ecosystem.
                </p>
              </div>
            </div>
            <ul className="ml-4 space-y-2">
              <li className="flex items-center">
                <span className="bg-purple-100 text-purple-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">Score Points</span>
                Earn points based on transaction frequency and volume
              </li>
              <li className="flex items-center">
                <span className="bg-purple-100 text-purple-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">Activity Tracking</span>
                Daily, weekly, and monthly activity metrics
              </li>
            </ul>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 border-t-4 border-indigo-600">
            <div className="flex items-start mb-4">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-3 rounded-lg text-white mr-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Smart Contract Analysis</h3>
                <p className="text-gray-700 leading-relaxed">
                  Track your smart contract interactions with granular detail, leveraging the 
                  <span className="font-medium text-indigo-700"> Ethereum</span>-compatible features of Monad's architecture.
                </p>
              </div>
            </div>
            <ul className="ml-4 space-y-2">
              <li className="flex items-center">
                <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">Contract Creation</span>
                View all contracts you've deployed with timestamps
              </li>
              <li className="flex items-center">
                <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">Interaction Metrics</span>
                Detailed logs of contract interactions and frequency
              </li>
            </ul>
          </div>
        </div>
        
        {/* Feature Cards Row 2 */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 border-t-4 border-blue-600">
            <div className="flex items-start mb-4">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-3 rounded-lg text-white mr-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Digital Asset Portfolio</h3>
                <p className="text-gray-700 leading-relaxed">
                  Visualize your entire Monad token portfolio in one place, similar to leading 
                  <span className="font-medium text-indigo-700"> crypto</span> portfolio trackers for major chains.
                </p>
              </div>
            </div>
            <ul className="ml-4 space-y-2">
              <li className="flex items-center">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">ERC20 Tracking</span>
                Complete inventory of all your fungible tokens
              </li>
              <li className="flex items-center">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">NFT Gallery</span>
                Visual display of ERC721 and ERC1155 assets with metadata
              </li>
            </ul>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 border-t-4 border-cyan-600">
            <div className="flex items-start mb-4">
              <div className="bg-gradient-to-br from-cyan-600 to-teal-600 p-3 rounded-lg text-white mr-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Transaction History</h3>
                <p className="text-gray-700 leading-relaxed">
                  Audit your full transaction history with detailed analytics leveraging the transparency of 
                  <span className="font-medium text-indigo-700"> blockchain</span> technology.
                </p>
              </div>
            </div>
            <ul className="ml-4 space-y-2">
              <li className="flex items-center">
                <span className="bg-cyan-100 text-cyan-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">Volume Analysis</span>
                Track MON volume and transaction patterns over time
              </li>
              <li className="flex items-center">
                <span className="bg-cyan-100 text-cyan-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">Gas Efficiency</span>
                Monitor gas usage and optimize for efficiency
              </li>
            </ul>
          </div>
        </div>
        
        {/* Monad Technology Section */}
        <div className="bg-white p-8 rounded-xl shadow-md mb-12 border-l-4 border-purple-600">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Why Monad Is the Future of Blockchain</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Monad combines <span className="font-medium text-indigo-700">Ethereum</span> compatibility with groundbreaking performance innovations, 
                achieving what other Layer 1 <span className="font-medium text-indigo-700">blockchain</span> platforms couldn't:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>10,000 TPS throughput (faster than most payment processors)</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>1-second block times with single-slot finality</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>100% EVM compatibility for seamless deployment</span>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Monad Testnet is currently live, featuring revolutionary technology similar to what transformed 
                <span className="font-medium text-indigo-700"> Bitcoin</span> and <span className="font-medium text-indigo-700">crypto</span> markets:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>MonadBFT: Next-generation consensus mechanism</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Parallel execution for unparalleled scalability</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Deferred execution for faster block production</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MonadTestnetStats;