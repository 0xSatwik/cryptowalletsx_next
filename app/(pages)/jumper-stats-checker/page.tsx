"use client";

import React, { useState, useEffect } from 'react';
import { Search, Wallet, TrendingUp, Activity, Clock, DollarSign, BarChart3, Info, ExternalLink, ArrowRight, Zap } from 'lucide-react';
import { format } from 'date-fns';

// Types for Jumper API responses
interface JumperToken {
  address: string;
  chainId: number;
  symbol: string;
  decimals: number;
  name: string;
  coinKey: string;
  logoURI: string;
  priceUSD: string;
}

interface JumperTransfer {
  transactionId: string;
  sending: {
    txHash: string;
    txLink: string;
    token: JumperToken;
    chainId: number;
    amountUSD: string;
    amount: string;
    timestamp: number;
  };
  receiving: {
    txHash: string;
    txLink: string;
    token: JumperToken;
    chainId: number;
    amountUSD: string;
    amount: string;
    timestamp: number;
  };
  lifiExplorerLink: string;
  fromAddress: string;
  toAddress: string;
  tool: string;
  status: string;
  substatus: string;
  substatusMessage: string;
  metadata: {
    integrator: string;
  };
}

interface JumperChain {
  key: string;
  chainType: string;
  name: string;
  coin: string;
  id: number;
  mainnet: boolean;
  logoURI: string;
  nativeToken: JumperToken;
}

interface JumperStatsData {
  transfers: JumperTransfer[];
}

interface JumperChainsData {
  chains: JumperChain[];
}

interface WalletStats {
  totalTransactions: number;
  totalVolumeUSD: number;
  uniqueChains: number;
  uniqueDays: number;
  uniqueWeeks: number;
  uniqueMonths: number;
  walletAge: number;
  firstTransactionDate: Date | null;
  lastTransactionDate: Date | null;
  transactions: JumperTransfer[];
  chainUsage: { [chainId: number]: { count: number; volumeUSD: number; name: string; logoURI: string } };
  activityTimeline: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  uniqueTimeline: {
    uniqueDays: number;
    uniqueWeeks: number;
    uniqueMonths: number;
  };
}

const JumperStatsChecker = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chains, setChains] = useState<{ [id: number]: JumperChain }>({});

  // Fetch chains data on component mount
  useEffect(() => {
    const fetchChains = async () => {
      try {
        const response = await fetch('https://li.quest/v1/chains?chainTypes=EVM%2CSVM&integrator=jumper.exchange');
        const data: JumperChainsData = await response.json();
        
        const chainsMap: { [id: number]: JumperChain } = {};
        data.chains.forEach(chain => {
          chainsMap[chain.id] = chain;
        });
        setChains(chainsMap);
      } catch (err) {
        console.error('Failed to fetch chains:', err);
      }
    };

    fetchChains();
  }, []);

  const getChainName = (chainId: number): string => {
    return chains[chainId]?.name || `Chain ${chainId}`;
  };

  const getChainIcon = (chainId: number): string | undefined => {
    return chains[chainId]?.logoURI;
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (amount: string | number): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const calculateStats = (transfers: JumperTransfer[]): WalletStats => {
    const chainUsage: { [chainId: number]: { count: number; volumeUSD: number; name: string; logoURI: string } } = {};
    let totalVolumeUSD = 0;
    const uniqueChainIds = new Set<number>();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    let todayCount = 0;
    let thisWeekCount = 0;
    let thisMonthCount = 0;

    // Track unique days, weeks, months
    const uniqueDays = new Set<string>();
    const uniqueWeeks = new Set<string>();
    const uniqueMonths = new Set<string>();

    let firstTransactionDate: Date | null = null;
    let lastTransactionDate: Date | null = null;

    transfers.forEach(transfer => {
      const sendingChainId = transfer.sending.chainId;
      const receivingChainId = transfer.receiving.chainId;
      const volumeUSD = parseFloat(transfer.sending.amountUSD || '0');
      const transferDate = new Date(transfer.sending.timestamp * 1000);

      // Track first and last transaction dates
      if (!firstTransactionDate || transferDate < firstTransactionDate) {
        firstTransactionDate = transferDate;
      }
      if (!lastTransactionDate || transferDate > lastTransactionDate) {
        lastTransactionDate = transferDate;
      }

      totalVolumeUSD += volumeUSD;
      uniqueChainIds.add(sendingChainId);
      uniqueChainIds.add(receivingChainId);

      // Count activity timeline
      if (transferDate >= today) todayCount++;
      if (transferDate >= thisWeek) thisWeekCount++;
      if (transferDate >= thisMonth) thisMonthCount++;

      // Track unique time periods
      const dayKey = transferDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const weekKey = `${transferDate.getFullYear()}-W${Math.ceil((transferDate.getTime() - new Date(transferDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`;
      const monthKey = `${transferDate.getFullYear()}-${transferDate.getMonth() + 1}`;

      uniqueDays.add(dayKey);
      uniqueWeeks.add(weekKey);
      uniqueMonths.add(monthKey);

      // Track chain usage
      [sendingChainId, receivingChainId].forEach(chainId => {
        if (!chainUsage[chainId]) {
          chainUsage[chainId] = {
            count: 0,
            volumeUSD: 0,
            name: getChainName(chainId),
            logoURI: getChainIcon(chainId) || ''
          };
        }
        chainUsage[chainId].count++;
        chainUsage[chainId].volumeUSD += volumeUSD / 2; // Split volume between sending and receiving
      });
    });

    // Calculate wallet age in days
    const walletAge = transfers.length > 0 ? Math.ceil((Date.now() - transfers[transfers.length - 1].sending.timestamp * 1000) / (24 * 60 * 60 * 1000)) : 0;

    return {
      totalTransactions: transfers.length,
      totalVolumeUSD,
      uniqueChains: uniqueChainIds.size,
      uniqueDays: uniqueDays.size,
      uniqueWeeks: uniqueWeeks.size,
      uniqueMonths: uniqueMonths.size,
      walletAge,
      firstTransactionDate,
      lastTransactionDate,
      transactions: transfers,
      chainUsage,
      activityTimeline: {
        today: todayCount,
        thisWeek: thisWeekCount,
        thisMonth: thisMonthCount,
      },
      uniqueTimeline: {
        uniqueDays: uniqueDays.size,
        uniqueWeeks: uniqueWeeks.size,
        uniqueMonths: uniqueMonths.size,
      },
    };
  };

  const fetchWalletStats = async (address: string) => {
    setLoading(true);
    setError('');

    try {
      // Use the fixed timestamp to get all transactions
      const url = `https://li.quest/v1/analytics/transfers?integrator=jumper.exchange&wallet=${address}&fromTimestamp=1394566644.647`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: JumperStatsData = await response.json();

      if (!data.transfers || data.transfers.length === 0) {
        setWalletStats({
          totalTransactions: 0,
          totalVolumeUSD: 0,
          uniqueChains: 0,
          uniqueDays: 0,
          uniqueWeeks: 0,
          uniqueMonths: 0,
          walletAge: 0,
          firstTransactionDate: null,
          lastTransactionDate: null,
          transactions: [],
          chainUsage: {},
          activityTimeline: { today: 0, thisWeek: 0, thisMonth: 0 },
          uniqueTimeline: { uniqueDays: 0, uniqueWeeks: 0, uniqueMonths: 0 },
        });
        return;
      }

      // Sort transactions by timestamp (newest first)
      data.transfers.sort((a, b) => b.sending.timestamp - a.sending.timestamp);

      const stats = calculateStats(data.transfers);
      setWalletStats(stats);

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
      setError('Please enter a valid wallet address');
      return;
    }
    fetchWalletStats(walletAddress.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 py-16 sm:py-24">
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
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-100 mb-6">
              Jumper Stats Checker
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Analyze your cross-chain bridge activity on Jumper Exchange with comprehensive analytics and insights
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-6 lg:p-12">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="text-center mb-4 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">Enter Wallet Address</h2>
              <p className="text-gray-600 text-base sm:text-lg">Get detailed analytics for any wallet's Jumper bridge activity</p>
            </div>

            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 sm:pl-6 flex items-center pointer-events-none">
                <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
              </div>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x... or ENS domain"
                className="block w-full pl-12 sm:pl-16 pr-24 sm:pr-32 py-4 sm:py-6 text-base sm:text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white/90 backdrop-blur-sm"
                disabled={loading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3">
                <button
                  type="submit"
                  disabled={loading || !walletAddress.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Transactions</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mt-1 sm:mt-2">{formatNumber(walletStats.totalTransactions)}</p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Volume</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mt-1 sm:mt-2">{formatCurrency(walletStats.totalVolumeUSD)}</p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Unique Chains</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mt-1 sm:mt-2">{formatNumber(walletStats.uniqueChains)}</p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Wallet Age</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mt-1 sm:mt-2">{walletStats.walletAge}</p>
                  <p className="text-xs text-gray-500">days</p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Clock className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Unique Days</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mt-1 sm:mt-2">{formatNumber(walletStats.uniqueTimeline.uniqueDays)}</p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                  <Activity className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Unique Weeks</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mt-1 sm:mt-2">{formatNumber(walletStats.uniqueTimeline.uniqueWeeks)}</p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Unique Months</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mt-1 sm:mt-2">{formatNumber(walletStats.uniqueTimeline.uniqueMonths)}</p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-teal-500 to-green-600 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Avg Transaction</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 mt-1 sm:mt-2">
                    {walletStats.totalTransactions > 0
                      ? formatCurrency(walletStats.totalVolumeUSD / walletStats.totalTransactions)
                      : '$0.00'
                    }
                  </p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">Activity Timeline</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Recent bridge activity breakdown</p>
                  {walletStats.firstTransactionDate && (
                    <p className="text-xs text-gray-500">
                      First: {format(walletStats.firstTransactionDate, 'MMM dd, yyyy')}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="text-white font-bold text-base sm:text-lg">{walletStats.activityTimeline.today}</span>
                  </div>
                  <p className="text-blue-700 font-bold text-base sm:text-lg">Today</p>
                  <p className="text-blue-600 text-xs sm:text-sm">Transactions</p>
                </div>
                <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="text-white font-bold text-base sm:text-lg">{walletStats.activityTimeline.thisWeek}</span>
                  </div>
                  <p className="text-purple-700 font-bold text-base sm:text-lg">This Week</p>
                  <p className="text-purple-600 text-xs sm:text-sm">Transactions</p>
                </div>
                <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="text-white font-bold text-base sm:text-lg">{walletStats.activityTimeline.thisMonth}</span>
                  </div>
                  <p className="text-green-700 font-bold text-base sm:text-lg">This Month</p>
                  <p className="text-green-600 text-xs sm:text-sm">Transactions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chain Usage Table */}
          {Object.keys(walletStats.chainUsage).length > 0 && (
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Chain Usage</h3>
                    <p className="text-sm text-gray-600">Bridge activity by blockchain network</p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Chain</th>
                      <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Transactions</th>
                      <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Volume</th>
                      <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Object.entries(walletStats.chainUsage)
                      .sort(([,a], [,b]) => b.volumeUSD - a.volumeUSD)
                      .map(([chainId, usage]) => (
                        <tr key={chainId} className="hover:bg-white/80 transition-colors duration-200">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              {usage.logoURI && (
                                <img
                                  src={usage.logoURI}
                                  alt={usage.name}
                                  className="w-10 h-10 rounded-full shadow-sm"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                              <div>
                                <p className="font-bold text-gray-900 text-lg">{usage.name}</p>
                                <p className="text-gray-500 text-sm">Chain ID: {chainId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-2xl font-black text-gray-900">{formatNumber(usage.count)}</span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-2xl font-black text-green-600">{formatCurrency(usage.volumeUSD)}</span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                              ✓ Active
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transaction List */}
          {walletStats.transactions.length > 0 && (
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Transaction History</h3>
                    <p className="text-sm text-gray-600">Recent bridge operations ({walletStats.transactions.length} total)</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {walletStats.transactions.slice(0, 10).map((tx) => (
                  <div key={tx.transactionId} className="p-8 hover:bg-white/80 transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                            ✓ {tx.status === 'DONE' ? 'Completed' : tx.status}
                          </span>
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {format(new Date(tx.sending.timestamp * 1000), 'MMM dd, yyyy • HH:mm')}
                          </span>
                          <span className="text-sm text-purple-600 bg-purple-100 px-3 py-1 rounded-full font-medium">
                            {tx.tool}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                            <div className="flex items-center gap-3 mb-4">
                              {getChainIcon(tx.sending.chainId) && (
                                <img
                                  src={getChainIcon(tx.sending.chainId)}
                                  alt="Source chain"
                                  className="w-8 h-8 rounded-full shadow-sm"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                              <div>
                                <p className="text-blue-700 font-semibold text-sm">FROM</p>
                                <p className="text-blue-600 text-xs">
                                  {getChainName(tx.sending.chainId)}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-2xl font-black text-gray-900">
                                {parseFloat(tx.sending.amount) / Math.pow(10, tx.sending.token.decimals) || 'N/A'}
                              </p>
                              <p className="text-lg font-bold text-blue-700">
                                {tx.sending.token.symbol || 'N/A'}
                              </p>
                              <p className="text-green-600 font-bold text-lg">
                                ${tx.sending.amountUSD || '0.00'}
                              </p>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                            <div className="flex items-center gap-3 mb-4">
                              {getChainIcon(tx.receiving.chainId) && (
                                <img
                                  src={getChainIcon(tx.receiving.chainId)}
                                  alt="Destination chain"
                                  className="w-8 h-8 rounded-full shadow-sm"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                              <div>
                                <p className="text-purple-700 font-semibold text-sm">TO</p>
                                <p className="text-purple-600 text-xs">
                                  {getChainName(tx.receiving.chainId)}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-2xl font-black text-gray-900">
                                {parseFloat(tx.receiving.amount) / Math.pow(10, tx.receiving.token.decimals) || 'N/A'}
                              </p>
                              <p className="text-lg font-bold text-purple-700">
                                {tx.receiving.token.symbol || 'N/A'}
                              </p>
                              <p className="text-green-600 font-bold text-lg">
                                ${tx.receiving.amountUSD || '0.00'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Data Message */}
          {walletStats.totalTransactions === 0 && (
            <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Info className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Jumper Activity Found</h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                This wallet has no recorded transactions on the Jumper Exchange bridge network.
              </p>
              <div className="mt-6 p-4 bg-purple-50 rounded-2xl border border-purple-100 max-w-sm mx-auto">
                <p className="text-purple-700 text-sm">
                  💡 Try using a different wallet address that has used Jumper Exchange
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JumperStatsChecker;
