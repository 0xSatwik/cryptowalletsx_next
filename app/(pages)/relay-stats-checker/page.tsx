'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow, format, parseISO, differenceInDays, differenceInWeeks, differenceInMonths } from 'date-fns';
import { ExternalLink, Search, Activity, Wallet, Calendar, ArrowUpDown, CheckCircle, XCircle, Info, Loader2 } from 'lucide-react';

// Types
interface RelayTransaction {
  id: string;
  status: string;
  user: string;
  recipient: string;
  data: {
    metadata?: {
      sender: string;
      recipient: string;
      currencyIn: {
        currency: {
          chainId: number;
          symbol: string;
          name: string;
        };
        amount: string;
        amountFormatted: string;
        amountUsd: string;
      };
      currencyOut: {
        currency: {
          chainId: number;
          symbol: string;
          name: string;
        };
        amount: string;
        amountFormatted: string;
        amountUsd: string;
      };
    };
    inTxs: Array<{
      chainId: number;
      timestamp: number;
      hash: string;
    }>;
    outTxs: Array<{
      chainId?: number;
      timestamp?: number;
      hash?: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

interface ChainInfo {
  id: number;
  name: string;
  displayName: string;
  iconUrl: string;
}

interface ChainUsage {
  chainId: number;
  chainName: string;
  usedAsSource: number;
  usedAsDestination: number;
}

interface WalletStats {
  totalTransactions: number;
  totalVolume: number;
  usedChains: ChainUsage[];
  walletAge: number;
  uniqueDays: number;
  uniqueWeeks: number;
  uniqueMonths: number;
  transactions: RelayTransaction[];
}

export default function RelayStatsChecker() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [chains, setChains] = useState<ChainInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<string>('');

  // Fetch chains data on component mount
  useEffect(() => {
    fetchChains();
  }, []);

  const fetchChains = async () => {
    try {
      const response = await fetch('https://api.relay.link/chains');
      const data = await response.json();
      setChains(data.chains || []);
    } catch (error) {
      console.error('Error fetching chains:', error);
    }
  };

  const isValidEthAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value.trim();
    setWalletAddress(address);
    setIsValidAddress(address === '' || isValidEthAddress(address));
  };

  const getChainName = (chainId: number): string => {
    const chain = chains.find(c => c.id === chainId);
    return chain ? chain.displayName : `Chain ${chainId}`;
  };

  const getChainIcon = (chainId: number): string => {
    const chain = chains.find(c => c.id === chainId);
    return chain ? chain.iconUrl : '';
  };

  const calculateStats = (transactions: RelayTransaction[]): WalletStats => {
    let totalVolume = 0;
    const chainUsageMap = new Map<number, ChainUsage>();
    const uniqueDates = new Set<string>();
    const uniqueWeeks = new Set<string>();
    const uniqueMonths = new Set<string>();
    let oldestTimestamp = Date.now();

    transactions.forEach(tx => {
      // Calculate volume - check if metadata and currencyIn exist
      if (tx.data?.metadata?.currencyIn?.amountUsd) {
        totalVolume += parseFloat(tx.data.metadata.currencyIn.amountUsd);
      }

      // Track chain usage
      if (tx.data.inTxs && tx.data.inTxs.length > 0) {
        const sourceChainId = tx.data.inTxs[0].chainId;
        const chainName = getChainName(sourceChainId);

        if (!chainUsageMap.has(sourceChainId)) {
          chainUsageMap.set(sourceChainId, {
            chainId: sourceChainId,
            chainName,
            usedAsSource: 0,
            usedAsDestination: 0
          });
        }
        chainUsageMap.get(sourceChainId)!.usedAsSource++;
      }

      if (tx.data.outTxs && tx.data.outTxs.length > 0 && tx.data.outTxs[0].chainId) {
        const destChainId = tx.data.outTxs[0].chainId;
        const chainName = getChainName(destChainId);

        if (!chainUsageMap.has(destChainId)) {
          chainUsageMap.set(destChainId, {
            chainId: destChainId,
            chainName,
            usedAsSource: 0,
            usedAsDestination: 0
          });
        }
        chainUsageMap.get(destChainId)!.usedAsDestination++;
      }

      // Track unique time periods
      const timestamp = tx.data.inTxs?.[0]?.timestamp || new Date(tx.createdAt).getTime() / 1000;
      const date = new Date(timestamp * 1000);

      uniqueDates.add(format(date, 'yyyy-MM-dd'));
      uniqueWeeks.add(format(date, 'yyyy-ww'));
      uniqueMonths.add(format(date, 'yyyy-MM'));

      if (timestamp * 1000 < oldestTimestamp) {
        oldestTimestamp = timestamp * 1000;
      }
    });

    const walletAge = Math.floor((Date.now() - oldestTimestamp) / (1000 * 60 * 60 * 24));

    return {
      totalTransactions: transactions.length,
      totalVolume,
      usedChains: Array.from(chainUsageMap.values()),
      walletAge,
      uniqueDays: uniqueDates.size,
      uniqueWeeks: uniqueWeeks.size,
      uniqueMonths: uniqueMonths.size,
      transactions
    };
  };

  const fetchWalletStats = async () => {
    if (!walletAddress || !isValidAddress) return;

    setIsLoading(true);
    setError(null);
    setWalletStats(null);
    setLoadingProgress('');

    try {
      let allTransactions: RelayTransaction[] = [];
      let continuation: string | null = null;
      let pageCount = 0;
      const maxPages = 50; // Safety limit to prevent infinite loops

      do {
        setLoadingProgress(`Fetching page ${pageCount + 1}... (${allTransactions.length} transactions found)`);

        const url = continuation
          ? `https://api.relay.link/requests/v2?user=${walletAddress}&continuation=${continuation}`
          : `https://api.relay.link/requests/v2?user=${walletAddress}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.requests && Array.isArray(data.requests)) {
          allTransactions = [...allTransactions, ...data.requests];
          continuation = data.continuation || null;
        } else if (Array.isArray(data)) {
          // Handle case where data is directly an array of requests
          allTransactions = [...allTransactions, ...data];
          continuation = null;
        } else {
          // No more data
          continuation = null;
        }

        pageCount++;

        // Break if we've fetched too many pages (safety check)
        if (pageCount >= maxPages) {
          console.warn(`Reached maximum page limit (${maxPages}). Some transactions may not be included.`);
          break;
        }

        // Break if no more transactions in this page
        if (data.requests && data.requests.length === 0) {
          break;
        }

      } while (continuation);

      if (allTransactions.length > 0) {
        const stats = calculateStats(allTransactions);
        setWalletStats(stats);
      } else {
        setWalletStats({
          totalTransactions: 0,
          totalVolume: 0,
          usedChains: [],
          walletAge: 0,
          uniqueDays: 0,
          uniqueWeeks: 0,
          uniqueMonths: 0,
          transactions: []
        });
      }
    } catch (error) {
      console.error('Error fetching wallet stats:', error);
      setError('Failed to fetch wallet statistics. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingProgress('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWalletStats();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 blur-3xl opacity-20 rounded-full"></div>
            <h1 className="relative text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 mb-6 tracking-tight">
              Relay Stats Checker
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover your complete Relay bridge journey with detailed analytics, cross-chain activity, and transaction insights.
          </p>
        </header>

        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 md:p-12 border border-white/20 mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Search className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Wallet Analysis</h2>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Wallet className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={handleAddressChange}
                  placeholder="Enter wallet address (0x...)"
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg font-mono ${
                    !isValidAddress ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white/50'
                  }`}
                />
                {!isValidAddress && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    Please enter a valid Ethereum address
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={!walletAddress || !isValidAddress || isLoading}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
                <span className="hidden sm:inline">
                  {isLoading ? (loadingProgress || 'Analyzing...') : 'Analyze Wallet'}
                </span>
                <span className="sm:hidden">
                  {isLoading ? 'Analyzing...' : 'Analyze'}
                </span>
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800">Analysis Failed</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Results */}
        {walletStats && (
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-8 rounded-3xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Activity className="h-7 w-7" />
                    </div>
                    <div className="text-right">
                      <p className="text-blue-100 text-sm font-medium">Total</p>
                      <p className="text-blue-50 text-xs">Transactions</p>
                    </div>
                  </div>
                  <p className="text-4xl font-black mb-1">{walletStats.totalTransactions.toLocaleString()}</p>
                  <p className="text-blue-200 text-sm">Bridge Operations</p>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 p-8 rounded-3xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Wallet className="h-7 w-7" />
                    </div>
                    <div className="text-right">
                      <p className="text-green-100 text-sm font-medium">Total</p>
                      <p className="text-green-50 text-xs">Volume</p>
                    </div>
                  </div>
                  <p className="text-4xl font-black mb-1">${walletStats.totalVolume.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                  <p className="text-green-200 text-sm">USD Value</p>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <ArrowUpDown className="h-7 w-7" />
                    </div>
                    <div className="text-right">
                      <p className="text-purple-100 text-sm font-medium">Used</p>
                      <p className="text-purple-50 text-xs">Chains</p>
                    </div>
                  </div>
                  <p className="text-4xl font-black mb-1">{walletStats.usedChains.length}</p>
                  <p className="text-purple-200 text-sm">Networks</p>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 p-8 rounded-3xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Calendar className="h-7 w-7" />
                    </div>
                    <div className="text-right">
                      <p className="text-orange-100 text-sm font-medium">Wallet</p>
                      <p className="text-orange-50 text-xs">Age</p>
                    </div>
                  </div>
                  <p className="text-4xl font-black mb-1">{walletStats.walletAge}</p>
                  <p className="text-orange-200 text-sm">Days Active</p>
                </div>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Activity Timeline</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">D</span>
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Unique Days</p>
                  <p className="text-3xl font-black text-gray-800">{walletStats.uniqueDays}</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">W</span>
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Unique Weeks</p>
                  <p className="text-3xl font-black text-gray-800">{walletStats.uniqueWeeks}</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Unique Months</p>
                  <p className="text-3xl font-black text-gray-800">{walletStats.uniqueMonths}</p>
                </div>
              </div>
            </div>

            {/* Chain Usage Table */}
            {walletStats.usedChains.length > 0 && (
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <ArrowUpDown className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Chain Usage Analytics</h3>
                      <p className="text-sm text-gray-600">Cross-chain bridge activity breakdown</p>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                      <tr>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                          Network
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                          Source Usage
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                          Destination Usage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 divide-y divide-gray-100">
                      {walletStats.usedChains.map((chain) => (
                        <tr key={chain.chainId} className="hover:bg-white/80 transition-colors duration-200">
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                              {getChainIcon(chain.chainId) && (
                                <img
                                  src={getChainIcon(chain.chainId)}
                                  alt={chain.chainName}
                                  className="w-10 h-10 rounded-full shadow-md"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                              <div>
                                <div className="text-lg font-bold text-gray-900">
                                  {chain.chainName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Chain ID: {chain.chainId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-3">
                              {chain.usedAsSource > 0 ? (
                                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                  <span className="text-lg font-bold text-green-800">{chain.usedAsSource}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full border border-red-200">
                                  <XCircle className="h-5 w-5 text-red-500" />
                                  <span className="text-sm font-medium text-red-600">Not Used</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-3">
                              {chain.usedAsDestination > 0 ? (
                                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                                  <CheckCircle className="h-5 w-5 text-blue-600" />
                                  <span className="text-lg font-bold text-blue-800">{chain.usedAsDestination}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full border border-red-200">
                                  <XCircle className="h-5 w-5 text-red-500" />
                                  <span className="text-sm font-medium text-red-600">Not Used</span>
                                </div>
                              )}
                            </div>
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
                    <div key={tx.id} className="p-8 hover:bg-white/80 transition-all duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                              tx.status === 'success'
                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
                                : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
                            }`}>
                              {tx.status === 'success' ? '✓ Success' : '✗ Failed'}
                            </span>
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                              {format(new Date(tx.createdAt), 'MMM dd, yyyy • HH:mm')}
                            </span>
                          </div>

                          {tx.data?.metadata?.currencyIn && tx.data?.metadata?.currencyOut ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                                <div className="flex items-center gap-3 mb-4">
                                  {getChainIcon(tx.data.metadata.currencyIn.currency?.chainId || 0) && (
                                    <img
                                      src={getChainIcon(tx.data.metadata.currencyIn.currency?.chainId || 0)}
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
                                      {getChainName(tx.data.metadata.currencyIn.currency?.chainId || 0)}
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-2xl font-black text-gray-900">
                                    {tx.data.metadata.currencyIn.amountFormatted || 'N/A'}
                                  </p>
                                  <p className="text-lg font-bold text-blue-700">
                                    {tx.data.metadata.currencyIn.currency?.symbol || 'N/A'}
                                  </p>
                                  <p className="text-green-600 font-bold text-lg">
                                    ${tx.data.metadata.currencyIn.amountUsd || '0.00'}
                                  </p>
                                </div>
                              </div>

                              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                                <div className="flex items-center gap-3 mb-4">
                                  {getChainIcon(tx.data.metadata.currencyOut.currency?.chainId || 0) && (
                                    <img
                                      src={getChainIcon(tx.data.metadata.currencyOut.currency?.chainId || 0)}
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
                                      {getChainName(tx.data.metadata.currencyOut.currency?.chainId || 0)}
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-2xl font-black text-gray-900">
                                    {tx.data.metadata.currencyOut.amountFormatted || 'N/A'}
                                  </p>
                                  <p className="text-lg font-bold text-purple-700">
                                    {tx.data.metadata.currencyOut.currency?.symbol || 'N/A'}
                                  </p>
                                  <p className="text-green-600 font-bold text-lg">
                                    ${tx.data.metadata.currencyOut.amountUsd || '0.00'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-200">
                              <p className="text-gray-700 font-semibold mb-4">Transaction Details</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-3">
                                  {tx.data.inTxs?.[0]?.chainId && getChainIcon(tx.data.inTxs[0].chainId) && (
                                    <img
                                      src={getChainIcon(tx.data.inTxs[0].chainId)}
                                      alt="Source chain"
                                      className="w-8 h-8 rounded-full shadow-sm"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  )}
                                  <div>
                                    <p className="text-gray-600 text-sm">Source Chain</p>
                                    <p className="font-bold text-gray-900">
                                      {tx.data.inTxs?.[0]?.chainId ? getChainName(tx.data.inTxs[0].chainId) : 'Unknown'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {tx.data.outTxs?.[0]?.chainId && getChainIcon(tx.data.outTxs[0].chainId) && (
                                    <img
                                      src={getChainIcon(tx.data.outTxs[0].chainId)}
                                      alt="Destination chain"
                                      className="w-8 h-8 rounded-full shadow-sm"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  )}
                                  <div>
                                    <p className="text-gray-600 text-sm">Destination Chain</p>
                                    <p className="font-bold text-gray-900">
                                      {tx.data.outTxs?.[0]?.chainId ? getChainName(tx.data.outTxs[0].chainId) : 'Unknown'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
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
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Relay Activity Found</h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto">
                  This wallet has no recorded transactions on the Relay bridge network.
                </p>
                <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 max-w-sm mx-auto">
                  <p className="text-blue-700 text-sm">
                    💡 Try using a different wallet address that has used Relay bridge
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
