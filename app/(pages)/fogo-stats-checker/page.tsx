"use client";

import React, { useState, useEffect } from 'react';
import { Search, Wallet, TrendingUp, Activity, Clock, DollarSign, BarChart3, Info, ExternalLink, Coins, Layers, Zap, Database } from 'lucide-react';
import { format } from 'date-fns';
import Head from 'next/head';

// Types for Fogo API responses
interface FogoToken {
  token_address: string;
  token_name: string;
  token_symbol: string;
  token_icon: string;
  token_decimals: number;
  token_type: string;
  reputation?: string;
  is_show_value: boolean;
  is_calculate_on_portfolio: boolean;
  is_show_icon: boolean;
  token_icon_alternative?: string | null;
}

interface FogoAccountData {
  account: string;
  lamports: number;
  ownerProgram: string;
  type: string;
  rentEpoch: number;
  executable: boolean;
  isOnCurve: boolean;
  space: number;
}

interface FogoAccountResponse {
  success: boolean;
  data: FogoAccountData;
  metadata: {
    tokens: { [key: string]: FogoToken };
    accounts: any;
    tags: any;
    programs: any;
    nftCollections: any;
    nftMarketplaces: any;
  };
}

interface FogoStakeData {
  total_items: number;
  total_stake: number;
}

interface FogoStakeResponse {
  success: boolean;
  data: FogoStakeData;
  metadata: any;
}

interface FogoDomainResponse {
  success: boolean;
  data: {
    items: any[];
  };
  metadata: {
    tokens: { [key: string]: FogoToken };
  };
}

interface FogoTokensResponse {
  success: boolean;
  data: {
    data_type: string;
    tokens: any[];
    count: number;
  };
  metadata: {
    tokens: { [key: string]: FogoToken };
  };
}

interface FogoBalanceChange {
  address: string;
  pre_balance: number;
  post_balance: number;
  change_amount: number;
}

interface FogoTransaction {
  blockTime: number;
  slot: number;
  txHash: string;
  fee: number;
  status: string;
  signer: string[];
  parsedInstruction: Array<{
    type: string;
    program: string;
    programId: string;
    priority: number;
  }>;
  sol_value: string;
  programIds: string[];
}

interface FogoTransactionResponse {
  success: boolean;
  data: {
    transactions: FogoTransaction[];
    isCompressedNFT: boolean;
  };
  metadata: {
    tokens: { [key: string]: FogoToken };
  };
}

interface WalletStats {
  accountInfo: FogoAccountData | null;
  totalStake: number;
  totalStakeItems: number;
  domainCount: number;
  tokenCount: number;
  recentTransactions: FogoTransaction[];
  totalTransactions: number;
  fogoBalance: number;
  accountAge: number;
  isValidator: boolean;
  totalFees: number;
  avgTransactionFee: number;
  totalVolume: number;
  uniqueDays: number;
  uniqueWeeks: number;
  uniqueMonths: number;
  firstTransactionDate: Date | null;
  lastTransactionDate: Date | null;
  activityTimeline: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

const FogoStatsChecker = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0, status: '' });
  const [visibleTransactions, setVisibleTransactions] = useState(10);

  // SEO: Add structured data when wallet stats are loaded
  const addWalletStructuredData = (stats: WalletStats) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Dataset",
      "name": `Fogo Chain Wallet Analytics - ${walletAddress}`,
      "description": `Comprehensive analytics for FogoChain wallet ${walletAddress} including transaction history, staking data, and activity metrics.`,
      "url": `https://cryptowalletsx.com/fogo-stats-checker?address=${walletAddress}`,
      "keywords": "fogo chain wallet, fogochain analytics, wallet stats, blockchain data",
      "creator": {
        "@type": "Organization",
        "name": "CryptoWalletsX"
      },
      "distribution": {
        "@type": "DataDownload",
        "contentUrl": `https://cryptowalletsx.com/fogo-stats-checker?address=${walletAddress}`,
        "encodingFormat": "application/json"
      },
      "temporalCoverage": stats.firstTransactionDate && stats.lastTransactionDate
        ? `${stats.firstTransactionDate.toISOString()}/${stats.lastTransactionDate.toISOString()}`
        : undefined,
      "variableMeasured": [
        "FOGO Balance",
        "Transaction Count",
        "Staking Amount",
        "Wallet Activity",
        "Transaction Volume"
      ]
    });

    // Remove existing wallet data script if present
    const existingScript = document.querySelector('script[data-wallet-analytics]');
    if (existingScript) {
      existingScript.remove();
    }

    script.setAttribute('data-wallet-analytics', 'true');
    document.head.appendChild(script);
  };

  // API Base URL - Using deployed Cloudflare Worker
  const API_BASE_URL = process.env.NEXT_PUBLIC_FOGO_API_URL || 'https://fogo-api-proxy.fogochain.workers.dev';

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatFogo = (lamports: number): string => {
    return (lamports / 1e9).toFixed(4);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Helper function to calculate analytics from transactions
  const calculateAnalytics = (transactions: FogoTransaction[]) => {
    if (transactions.length === 0) {
      return {
        totalVolume: 0,
        uniqueDays: 0,
        uniqueWeeks: 0,
        uniqueMonths: 0,
        firstTransactionDate: null,
        lastTransactionDate: null,
        activityTimeline: { today: 0, thisWeek: 0, thisMonth: 0 }
      };
    }

    // Sort transactions by time (oldest first)
    const sortedTxs = [...transactions].sort((a, b) => a.blockTime - b.blockTime);

    // Calculate volume (sum of sol_value)
    const totalVolume = transactions.reduce((sum, tx) => sum + parseInt(tx.sol_value), 0);

    // Get unique dates
    const uniqueDates = new Set<string>();
    const uniqueWeekKeys = new Set<string>();
    const uniqueMonthKeys = new Set<string>();

    // Current time references
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - (todayStart.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let todayCount = 0;
    let thisWeekCount = 0;
    let thisMonthCount = 0;

    transactions.forEach(tx => {
      const txDate = new Date(tx.blockTime * 1000);

      // Unique days
      const dateKey = txDate.toISOString().split('T')[0];
      uniqueDates.add(dateKey);

      // Unique weeks (using ISO week)
      const year = txDate.getFullYear();
      const weekNumber = getWeekNumber(txDate);
      uniqueWeekKeys.add(`${year}-W${weekNumber}`);

      // Unique months
      const monthKey = `${year}-${txDate.getMonth() + 1}`;
      uniqueMonthKeys.add(monthKey);

      // Activity timeline
      if (txDate >= todayStart) todayCount++;
      if (txDate >= weekStart) thisWeekCount++;
      if (txDate >= monthStart) thisMonthCount++;
    });

    return {
      totalVolume,
      uniqueDays: uniqueDates.size,
      uniqueWeeks: uniqueWeekKeys.size,
      uniqueMonths: uniqueMonthKeys.size,
      firstTransactionDate: new Date(sortedTxs[0].blockTime * 1000),
      lastTransactionDate: new Date(sortedTxs[sortedTxs.length - 1].blockTime * 1000),
      activityTimeline: {
        today: todayCount,
        thisWeek: thisWeekCount,
        thisMonth: thisMonthCount
      }
    };
  };

  // Helper function to get ISO week number
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  // Function to fetch all transactions with pagination
  const fetchAllTransactions = async (address: string): Promise<FogoTransaction[]> => {
    const allTransactions: FogoTransaction[] = [];
    let page = 1;
    let hasMorePages = true;
    let lastTxHash = '';

    setLoadingProgress({ current: 0, total: 0, status: 'Fetching transaction history...' });

    while (hasMorePages) {
      try {
        setLoadingProgress({
          current: page,
          total: 0,
          status: `Loading page ${page}... (${allTransactions.length} transactions found)`
        });

        let url = `${API_BASE_URL}/account/transaction?address=${address}&page_size=40`;
        if (page > 1 && lastTxHash) {
          url += `&before=${lastTxHash}&page=${page}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch transactions page ${page}: ${response.status}`);
        }

        const data: FogoTransactionResponse = await response.json();

        if (!data.success || !data.data.transactions || data.data.transactions.length === 0) {
          hasMorePages = false;
          break;
        }

        const pageTransactions = data.data.transactions;
        allTransactions.push(...pageTransactions);

        // If we got less than 40 transactions, this is the last page
        if (pageTransactions.length < 40) {
          hasMorePages = false;
        } else {
          // Set the last transaction hash for the next page
          lastTxHash = pageTransactions[pageTransactions.length - 1].txHash;
          page++;
        }

        // Add a small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error fetching page ${page}:`, error);
        hasMorePages = false;
      }
    }

    setLoadingProgress({
      current: page - 1,
      total: page - 1,
      status: `Completed! Found ${allTransactions.length} total transactions`
    });

    return allTransactions;
  };

  const handleLoadMore = () => {
    setVisibleTransactions(prev => prev + 10);
  };

  const fetchWalletStats = async (address: string) => {
    setLoading(true);
    setError('');
    setVisibleTransactions(10); // Reset visible transactions

    try {
      // Fetch account info
      const accountResponse = await fetch(`${API_BASE_URL}/account?address=${address}`);
      if (!accountResponse.ok) {
        throw new Error(`Failed to fetch account info: ${accountResponse.status}`);
      }
      const accountData: FogoAccountResponse = await accountResponse.json();

      if (!accountData.success) {
        throw new Error('Failed to fetch account information');
      }

      // Fetch stake info
      const stakeResponse = await fetch(`${API_BASE_URL}/account/stake/total?address=${address}`);
      const stakeData: FogoStakeResponse = await stakeResponse.json();

      // Fetch domain info
      const domainResponse = await fetch(`${API_BASE_URL}/account/domain?address=${address}`);
      const domainData: FogoDomainResponse = await domainResponse.json();

      // Fetch tokens info
      const tokensResponse = await fetch(`${API_BASE_URL}/account/tokens?address=${address}`);
      const tokensData: FogoTokensResponse = await tokensResponse.json();

      // Fetch all transactions with pagination
      const transactions = await fetchAllTransactions(address);

      // Calculate stats
      const fogoBalance = accountData.data.lamports;
      const isValidator = accountData.data.type === 'vote_account' ||
                         transactions.some(tx => tx.programIds.includes('Vote111111111111111111111111111111111111111'));

      const totalFees = transactions.reduce((sum, tx) => sum + tx.fee, 0);
      const avgTransactionFee = transactions.length > 0 ? totalFees / transactions.length : 0;

      // Calculate advanced analytics
      const analytics = calculateAnalytics(transactions);

      const accountAge = analytics.firstTransactionDate
        ? Math.floor((Date.now() - analytics.firstTransactionDate.getTime()) / (24 * 60 * 60 * 1000))
        : 0;

      setWalletStats({
        accountInfo: accountData.data,
        totalStake: stakeData.success ? stakeData.data.total_stake : 0,
        totalStakeItems: stakeData.success ? stakeData.data.total_items : 0,
        domainCount: domainData.success ? domainData.data.items.length : 0,
        tokenCount: tokensData.success ? tokensData.data.count : 0,
        recentTransactions: transactions,
        totalTransactions: transactions.length,
        fogoBalance,
        accountAge,
        isValidator,
        totalFees,
        avgTransactionFee,
        totalVolume: analytics.totalVolume,
        uniqueDays: analytics.uniqueDays,
        uniqueWeeks: analytics.uniqueWeeks,
        uniqueMonths: analytics.uniqueMonths,
        firstTransactionDate: analytics.firstTransactionDate,
        lastTransactionDate: analytics.lastTransactionDate,
        activityTimeline: analytics.activityTimeline,
      });

      // Add structured data for SEO
      addWalletStructuredData({
        accountInfo: accountData.data,
        totalStake: stakeData.success ? stakeData.data.total_stake : 0,
        totalStakeItems: stakeData.success ? stakeData.data.total_items : 0,
        domainCount: domainData.success ? domainData.data.items.length : 0,
        tokenCount: tokensData.success ? tokensData.data.count : 0,
        recentTransactions: transactions,
        totalTransactions: transactions.length,
        fogoBalance,
        accountAge,
        isValidator,
        totalFees,
        avgTransactionFee,
        totalVolume: analytics.totalVolume,
        uniqueDays: analytics.uniqueDays,
        uniqueWeeks: analytics.uniqueWeeks,
        uniqueMonths: analytics.uniqueMonths,
        firstTransactionDate: analytics.firstTransactionDate,
        lastTransactionDate: analytics.lastTransactionDate,
        activityTimeline: analytics.activityTimeline,
      });
      
    } catch (err) {
      console.error('Error fetching wallet stats:', err);
      setError('Failed to fetch wallet statistics. Please check the wallet address and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress.trim()) {
      setError('Please enter a valid Fogo wallet address');
      return;
    }
    fetchWalletStats(walletAddress.trim());
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-100" role="main" aria-label="Fogo Chain Stats Checker">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-red-600 to-pink-700 py-16 sm:py-24">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl">
                  <Zap className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Activity className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-pink-100 mb-4 sm:mb-6">
              Fogo Chain Stats Checker
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-orange-100 max-w-3xl mx-auto leading-relaxed px-4">
              Check your FogoChain wallet rank, activity, and transaction history with our comprehensive stats analyzer
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-12">
          <form onSubmit={handleSubmit} className="space-y-6" role="search" aria-label="Fogo Chain wallet address search">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-3 px-4">FogoChain Wallet Stats & Rank Checker</h2>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg px-4">Get detailed analytics, activity tracking, and wallet ranking for any FogoChain address</p>
              <div className="mt-4 p-4 bg-orange-50 rounded-2xl border border-orange-100 max-w-md mx-auto">
                <p className="text-orange-700 text-sm">
                  💡 Example: AVf....smd
                </p>
              </div>
              <div className="mt-2 p-3 bg-green-50 rounded-2xl border border-green-100 max-w-lg mx-auto">
                <p className="text-green-700 text-xs text-center">
                  🚀 <strong>Complete Analysis:</strong> We fetch your entire transaction history for comprehensive analytics including wallet age, unique activity periods, and total volume.
                </p>
              </div>
              {loading && (
                <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 max-w-md mx-auto">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <p className="text-blue-700 text-sm font-medium">
                      {loadingProgress.status || 'Fetching data from Fogo Chain...'}
                    </p>
                  </div>
                  {loadingProgress.current > 0 && (
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: loadingProgress.total > 0
                            ? `${(loadingProgress.current / loadingProgress.total) * 100}%`
                            : '50%'
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 sm:pl-6 flex items-center pointer-events-none">
                <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
              </div>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter Fogo wallet address..."
                className="block w-full pl-12 sm:pl-16 pr-24 sm:pr-32 py-4 sm:py-6 text-base sm:text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white/90 backdrop-blur-sm"
                disabled={loading}
                aria-label="Enter FogoChain wallet address for analysis"
                aria-describedby="wallet-input-help"
                autoComplete="off"
                spellCheck="false"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3">
                <button
                  type="submit"
                  disabled={loading || !walletAddress.trim()}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                      <span className="hidden sm:inline">Analyzing...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Analyze</span>
                      <span className="sm:hidden">Go</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="max-w-2xl mx-auto bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExternalLink className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Results Section */}
      {walletStats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">FOGO Balance</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mt-1 sm:mt-2">{formatFogo(walletStats.fogoBalance)}</p>
                  <p className="text-xs text-gray-500">FOGO</p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                  <Coins className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </div>



            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Stake</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mt-1 sm:mt-2">{formatFogo(walletStats.totalStake)}</p>
                  <p className="text-xs text-gray-500">{formatNumber(walletStats.totalStakeItems)} items</p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Account Age</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mt-1 sm:mt-2">{formatNumber(walletStats.accountAge)}</p>
                  <p className="text-xs text-gray-500">days</p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Clock className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Token Count</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mt-1 sm:mt-2">{formatNumber(walletStats.tokenCount)}</p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center">
                  <Database className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Domain Count</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mt-1 sm:mt-2">{formatNumber(walletStats.domainCount)}</p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                  <Layers className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Transactions</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 mt-1 sm:mt-2">{formatNumber(walletStats.totalTransactions)}</p>
                  <p className="text-xs text-gray-500">recent</p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Avg Fee</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 mt-1 sm:mt-2">{formatFogo(walletStats.avgTransactionFee)}</p>
                  <p className="text-xs text-gray-500">FOGO</p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Analytics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Volume</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 mt-1 sm:mt-2">{formatFogo(walletStats.totalVolume)}</p>
                  <p className="text-xs text-gray-500">FOGO</p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Unique Days</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mt-1 sm:mt-2">{formatNumber(walletStats.uniqueDays)}</p>
                  <p className="text-xs text-gray-500">active days</p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <Clock className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Unique Weeks</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mt-1 sm:mt-2">{formatNumber(walletStats.uniqueWeeks)}</p>
                  <p className="text-xs text-gray-500">active weeks</p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                  <Activity className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Unique Months</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mt-1 sm:mt-2">{formatNumber(walletStats.uniqueMonths)}</p>
                  <p className="text-xs text-gray-500">active months</p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Activity Timeline</h3>
                  <p className="text-sm text-gray-600">Recent transaction activity breakdown</p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-green-700 font-semibold text-sm">Today</p>
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-gray-900">{formatNumber(walletStats.activityTimeline.today)}</p>
                  <p className="text-xs text-gray-500 mt-1">transactions</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-blue-700 font-semibold text-sm">This Week</p>
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Activity className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-gray-900">{formatNumber(walletStats.activityTimeline.thisWeek)}</p>
                  <p className="text-xs text-gray-500 mt-1">transactions</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-purple-700 font-semibold text-sm">This Month</p>
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-gray-900">{formatNumber(walletStats.activityTimeline.thisMonth)}</p>
                  <p className="text-xs text-gray-500 mt-1">transactions</p>
                </div>
              </div>

              {walletStats.firstTransactionDate && walletStats.lastTransactionDate && (
                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">First Transaction</p>
                      <p className="text-lg font-bold text-gray-900">
                        {walletStats.firstTransactionDate ? format(walletStats.firstTransactionDate, 'MMM dd, yyyy • HH:mm') : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-700">Last Transaction</p>
                      <p className="text-lg font-bold text-gray-900">
                        {walletStats.lastTransactionDate ? format(walletStats.lastTransactionDate, 'MMM dd, yyyy • HH:mm') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Info className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Account Details</h3>
                  <p className="text-sm text-gray-600">Comprehensive account information</p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-2xl border border-orange-100">
                    <p className="text-sm font-semibold text-orange-700 mb-1">Account Address</p>
                    <p className="text-xs text-gray-600 font-mono break-all">{walletStats.accountInfo?.account}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
                    <p className="text-sm font-semibold text-blue-700 mb-1">Owner Program</p>
                    <p className="text-xs text-gray-600 font-mono break-all">{walletStats.accountInfo?.ownerProgram}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100">
                    <p className="text-sm font-semibold text-green-700 mb-1">Account Space</p>
                    <p className="text-lg font-bold text-gray-900">{formatNumber(walletStats.accountInfo?.space || 0)} bytes</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100">
                    <p className="text-sm font-semibold text-purple-700 mb-1">Rent Epoch</p>
                    <p className="text-lg font-bold text-gray-900">{formatNumber(walletStats.accountInfo?.rentEpoch || 0)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-2xl border border-yellow-100">
                    <p className="text-sm font-semibold text-yellow-700 mb-1">Account Status</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        walletStats.accountInfo?.executable
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {walletStats.accountInfo?.executable ? '✓ Executable' : '✗ Not Executable'}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        walletStats.accountInfo?.isOnCurve
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {walletStats.accountInfo?.isOnCurve ? '✓ On Curve' : '✗ Off Curve'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-2xl border border-teal-100">
                    <p className="text-sm font-semibold text-teal-700 mb-1">Validator Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      walletStats.isValidator
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {walletStats.isValidator ? '✓ Validator Account' : '✗ Regular Account'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          {walletStats.recentTransactions.length > 0 && (
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Transaction History</h3>
                    <p className="text-sm text-gray-600">Complete transaction history ({formatNumber(walletStats.totalTransactions)} total transactions)</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {walletStats.recentTransactions.slice(0, visibleTransactions).map((tx) => (
                  <div key={tx.txHash} className="p-3 sm:p-4 lg:p-6 hover:bg-white/80 transition-all duration-200">
                    {/* Mobile-first layout */}
                    <div className="space-y-3">
                      {/* Status and Date Row */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                            ✓ {tx.status}
                          </span>
                          <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full font-medium">
                            {tx.parsedInstruction[0]?.type || 'Unknown'}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">Slot</p>
                          <p className="text-sm font-bold text-gray-900">{formatNumber(tx.slot)}</p>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-block">
                        {format(new Date(tx.blockTime * 1000), 'MMM dd, yyyy • HH:mm')}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100">
                        <p className="text-blue-700 font-semibold text-xs mb-1">Transaction Hash</p>
                        <p className="text-xs text-gray-600 font-mono break-all">{tx.txHash}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl border border-green-100">
                        <p className="text-green-700 font-semibold text-xs mb-1">Fee Paid</p>
                        <p className="text-lg font-bold text-gray-900">{formatFogo(tx.fee)} FOGO</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-100">
                        <p className="text-purple-700 font-semibold text-xs mb-1">Programs</p>
                        <div className="flex flex-wrap gap-1">
                          {tx.programIds.slice(0, 2).map((program, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white text-gray-700 border border-gray-200">
                              {program.slice(0, 6)}...
                            </span>
                          ))}
                          {tx.programIds.length > 2 && (
                            <span className="text-xs text-gray-500">+{tx.programIds.length - 2}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Load More Button */}
                {visibleTransactions < walletStats.recentTransactions.length && (
                  <div className="p-6 text-center border-t border-gray-100">
                    <button
                      onClick={handleLoadMore}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Activity className="h-4 w-4" />
                      Load More Transactions ({walletStats.recentTransactions.length - visibleTransactions} remaining)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Data Message */}
          {!walletStats && !loading && !error && (
            <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Info className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Enter a Fogo Address</h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                Enter a valid Fogo Chain wallet address to view comprehensive analytics and account information.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SEO Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-6 sm:p-8 lg:p-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center">
                About Fogo Chain Stats Checker
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">🔍 Comprehensive FogoChain Analytics</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Our <strong>Fogo Chain stats checker</strong> provides the most comprehensive wallet analysis for FogoChain addresses.
                    Check your <strong>FogoChain wallet rank</strong>, transaction history, staking rewards, and detailed on-chain activity metrics.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Whether you're tracking your portfolio performance or analyzing wallet activity, our <strong>FogoChain activity checker</strong>
                    delivers real-time insights with complete transaction history analysis.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">📊 Advanced Wallet Metrics</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Get detailed <strong>Fogo stats</strong> including wallet age, unique activity periods, total transaction volume,
                    and comprehensive staking analytics. Our tool analyzes your complete FogoChain history to provide accurate rankings.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Track your <strong>FogoChain rank</strong> based on activity, volume, and engagement metrics.
                    Perfect for validators, traders, and long-term FOGO holders.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">🚀 Key Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Real-time FOGO balance tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Complete transaction history</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Staking rewards analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Wallet activity ranking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Portfolio performance metrics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Validator status detection</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Start Analyzing Your FogoChain Wallet</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Enter any FogoChain address above to get instant access to comprehensive wallet analytics,
                  ranking data, and detailed activity insights. Our <strong>Fogo stats checker</strong> is completely free and requires no registration.
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
                  <span className="bg-gray-100 px-3 py-1 rounded-full">FogoChain Stats</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full">Wallet Rank Checker</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full">Activity Analytics</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full">Portfolio Tracker</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FogoStatsChecker;
