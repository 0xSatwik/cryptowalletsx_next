'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Twitter, Share2, AlertCircle, ChevronDown, ChevronUp, Coins, PieChart, DollarSign, RefreshCw, Wallet, Layout, Trophy, Clock, Gift, Check } from 'lucide-react';

interface GalxeToken {
  token: {
    address: string;
    decimals: string;
    holders: string;
    name: string;
    symbol: string;
    total_supply: string;
    type: string;
    icon_url: string | null;
  };
  value: string;
}

interface WalletResult {
  address: string;
  tokens: GalxeToken[];
  nativeBalance?: string; // Native Gravity balance
  error?: string;
  lastFetched?: number; // Timestamp when data was last fetched
}

interface SummaryStats {
  totalWallets: number;
  totalProjects: number;
  mostJoinedProjects: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  totalNativeBalance: number; // Total native balance
}

// Cache expiration time in milliseconds (8 hours)
const CACHE_EXPIRATION = 8 * 60 * 60 * 1000;

export default function GalxeAirdropTracker() {
  const [addresses, setAddresses] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<WalletResult[]>([]);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [expandedWallets, setExpandedWallets] = useState<Record<string, boolean>>({});
  const [refreshingWallets, setRefreshingWallets] = useState<Record<string, boolean>>({});

  // Load cached results on component mount
  useEffect(() => {
    const cachedResults = localStorage.getItem('galxe_results');
    if (cachedResults) {
      try {
        const parsedResults: { data: WalletResult[], timestamp: number } = JSON.parse(cachedResults);
        // Only use cache if it's not expired
        if (Date.now() - parsedResults.timestamp < CACHE_EXPIRATION) {
          setResults(parsedResults.data);
          setSummaryStats(calculateSummaryStats(parsedResults.data));
          
          // Initialize expanded state for cached wallets
          const expanded: Record<string, boolean> = {};
          parsedResults.data.forEach(wallet => {
            expanded[wallet.address] = false;
          });
          setExpandedWallets(expanded);
        } else {
          // Clear expired cache
          localStorage.removeItem('galxe_results');
        }
      } catch (error) {
        console.error('Error parsing cached results:', error);
        localStorage.removeItem('galxe_results');
      }
    }
  }, []);

  // Update cache whenever results change
  useEffect(() => {
    if (results.length > 0) {
      localStorage.setItem('galxe_results', JSON.stringify({
        data: results,
        timestamp: Date.now()
      }));
    }
  }, [results]);

  const toggleWalletExpand = (address: string) => {
    setExpandedWallets(prev => ({
      ...prev,
      [address]: !prev[address]
    }));
  };

  const calculateSummaryStats = (results: WalletResult[]): SummaryStats => {
    const validResults = results.filter(r => !r.error);
    
    // Count total projects across all wallets
    const projectCounts: Record<string, number> = {};
    let totalNativeBalance = 0;
    
    validResults.forEach(wallet => {
      // Add native balance to total
      if (wallet.nativeBalance) {
        totalNativeBalance += parseFloat(wallet.nativeBalance);
      }
      
      // Keep track of unique projects per wallet to avoid double counting
      const uniqueProjectsInWallet = new Set<string>();
      
      wallet.tokens.forEach(token => {
        const projectName = token.token.name.replace(' Galxe Points', '');
        uniqueProjectsInWallet.add(projectName);
      });
      
      // Only count each project once per wallet
      uniqueProjectsInWallet.forEach(projectName => {
        projectCounts[projectName] = (projectCounts[projectName] || 0) + 1;
      });
    });
    
    // Get most joined projects by count
    const mostJoinedProjects = Object.entries(projectCounts)
      .map(([name, count]) => ({ 
        name, 
        count,
        percentage: (count / validResults.length) * 100 
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    
    return {
      totalWallets: validResults.length,
      totalProjects: Object.keys(projectCounts).length,
      mostJoinedProjects,
      totalNativeBalance
    };
  };

  const fetchGalxeTokens = async (address: string): Promise<GalxeToken[]> => {
    try {
      // Use Cloudflare Worker API endpoint for both production and local environments
      const baseUrl = 'https://galxe-proxy.xapipro.workers.dev';
      
      const url = `${baseUrl}/api/galxe/${address}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add detailed logging to debug the response structure
      console.log(`Response for ${address}:`, data);
      
      // Check if data has the expected structure
      if (!data || typeof data !== 'object') {
        console.error(`Invalid response format for ${address}:`, data);
        return []; // Return empty array instead of throwing error
      }
      
      // Handle case where response doesn't have items property
      if (!data.items || !Array.isArray(data.items)) {
        console.warn(`Response for ${address} doesn't have items array:`, data);
        
        // Try to handle the case where the response might be directly the items array
        const possibleItems = Array.isArray(data) ? data : [];
        
        // Filter only Galxe Points tokens if possible
        return possibleItems.filter((item: any) => 
          item && item.token && (
            (item.token.name && (
              item.token.name.includes('Galxe Points') || 
              item.token.name.includes('Point')
            )) || 
            (item.token.symbol && item.token.symbol.includes('Point'))
          )
        );
      }
      
      // Normal case: the API response is wrapped in an items property
      const tokens = data.items.filter((item: any) => 
        item && item.token && (
          (item.token.name && (
            item.token.name.includes('Galxe Points') || 
            item.token.name.includes('Point')
          )) || 
          (item.token.symbol && item.token.symbol.includes('Point'))
        )
      );
      
      return tokens;
    } catch (error) {
      console.error('Error fetching Galxe tokens:', error);
      throw error;
    }
  };

  // Fetch native balance from Gravity RPC
  const fetchNativeBalance = async (address: string): Promise<string> => {
    const payload = {
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [address, "latest"],
      id: 1
    };

    try {
      // Try primary endpoint first
      const response = await fetch("https://rpc.gravity.xyz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Primary RPC failed");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || "RPC error");
      }

      // Convert hex to decimal string and then to ETH (18 decimals)
      const balanceInWei = parseInt(data.result, 16);
      const balanceInEth = balanceInWei / 1e18;
      return balanceInEth.toString();
    } catch (error) {
      console.warn("Primary RPC failed, trying fallback:", error);
      
      // Try fallback endpoint
      try {
        const fallbackResponse = await fetch("https://rpc.ankr.com/gravity", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!fallbackResponse.ok) {
          throw new Error("Fallback RPC also failed");
        }

        const fallbackData = await fallbackResponse.json();
        if (fallbackData.error) {
          throw new Error(fallbackData.error.message || "Fallback RPC error");
        }

        // Convert hex to decimal string and then to ETH (18 decimals)
        const balanceInWei = parseInt(fallbackData.result, 16);
        const balanceInEth = balanceInWei / 1e18;
        return balanceInEth.toString();
      } catch (fallbackError) {
        console.error("All RPC endpoints failed:", fallbackError);
        return "0"; // Return 0 as fallback
      }
    }
  };

  // Function to refresh a single wallet's data
  const refreshWallet = async (address: string) => {
    if (refreshingWallets[address]) return;
    
    setRefreshingWallets(prev => ({ ...prev, [address]: true }));
    
    try {
      // Fetch both tokens and native balance in parallel
      const [tokens, nativeBalance] = await Promise.all([
        fetchGalxeTokens(address),
        fetchNativeBalance(address)
      ]);
      
      // Only mark as error if we have no tokens AND there was some issue
      const hasError = tokens.length === 0 && parseFloat(nativeBalance) === 0;
      
      // Update the results array
      setResults(prevResults => {
        const updatedResults = [...prevResults];
        const index = updatedResults.findIndex(r => r.address === address);
        
        if (index !== -1) {
          updatedResults[index] = {
            address,
            tokens,
            nativeBalance,
            error: hasError ? 'No data found' : undefined,
            lastFetched: Date.now()
          };
        }
        
        // Update localStorage cache
        localStorage.setItem('galxe_results', JSON.stringify({
          data: updatedResults,
          timestamp: Date.now()
        }));
        
        return updatedResults;
      });
      
      // Recalculate summary stats
      setResults(current => {
        setSummaryStats(calculateSummaryStats(current));
        return current;
      });
      
    } catch (error) {
      console.error(`Error refreshing wallet ${address}:`, error);
      
      // Update with error
      setResults(prevResults => {
        const updatedResults = [...prevResults];
        const index = updatedResults.findIndex(r => r.address === address);
        
        if (index !== -1) {
          updatedResults[index] = {
            ...updatedResults[index],
            error: 'Failed to fetch data',
            lastFetched: Date.now()
          };
        }
        
        return updatedResults;
      });
    } finally {
      setRefreshingWallets(prev => ({ ...prev, [address]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addresses.trim() || loading) return;

    setLoading(true);
    setResults([]);
    setCurrentAddress('');
    setError(null);
    setSummaryStats(null);
    setExpandedWallets({});
    setRefreshingWallets({});

    const addressList = addresses
      .split('\n')
      .map(addr => addr.trim())
      .filter(addr => addr.length > 0 && addr.startsWith('0x'));

    if (addressList.length === 0) {
      setError('Please enter at least one valid wallet address');
      setLoading(false);
      return;
    }

    if (addressList.length > 40) {
      setError('Maximum 40 addresses allowed at once');
      setLoading(false);
      return;
    }

    const newResults: WalletResult[] = [];
    const now = Date.now();

    // Check cache for existing wallets
    const cachedResults = localStorage.getItem('galxe_results');
    let cachedData: WalletResult[] = [];
    
    if (cachedResults) {
      try {
        const parsed = JSON.parse(cachedResults);
        if (Date.now() - parsed.timestamp < CACHE_EXPIRATION) {
          cachedData = parsed.data;
        }
      } catch (error) {
        console.error('Error parsing cached results:', error);
      }
    }

    for (const address of addressList) {
      setCurrentAddress(address);
      
      // Check if we have a valid cache for this address
      const cachedWallet = cachedData.find(w => 
        w.address.toLowerCase() === address.toLowerCase() && 
        w.lastFetched && 
        (now - w.lastFetched < CACHE_EXPIRATION)
      );
      
      if (cachedWallet) {
        // Use cached data
        newResults.push(cachedWallet);
        setResults([...newResults]);
        continue;
      }
      
      try {
        // Fetch both tokens and native balance in parallel
        const [tokens, nativeBalance] = await Promise.all([
          fetchGalxeTokens(address),
          fetchNativeBalance(address)
        ]);
        
        // Only mark as error if we have no tokens AND there was some issue with native balance
        const hasError = tokens.length === 0 && parseFloat(nativeBalance) === 0;
        
        newResults.push({
          address,
          tokens,
          nativeBalance,
          error: hasError ? 'No data found' : undefined,
          lastFetched: now
        });
      } catch (error) {
        console.error(`Error processing address ${address}:`, error);
        newResults.push({
          address,
          tokens: [],
          nativeBalance: "0",
          error: 'Failed to fetch data',
          lastFetched: now
        });
      }
      setResults([...newResults]);
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const stats = calculateSummaryStats(newResults);
    setSummaryStats(stats);
    setLoading(false);
    setCurrentAddress('');
    
    // Save results to localStorage
    localStorage.setItem('galxe_results', JSON.stringify({
      data: newResults,
      timestamp: now
    }));
  };

  const formatPoints = (value: string, decimals: string): string => {
    const points = parseFloat(value) / Math.pow(10, parseInt(decimals));
    return points.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const formatNativeBalance = (balance: string): string => {
    const floatBalance = parseFloat(balance);
    return floatBalance.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  const calculatePercentage = (value: string, totalSupply: string): string => {
    const points = parseFloat(value);
    const total = parseFloat(totalSupply);
    if (total === 0) return '0%';
    
    const percentage = (points / total) * 100;
    return percentage.toFixed(6) + '%';
  };

  // Format the time difference to show when data was last updated
  const formatLastUpdated = (timestamp?: number): string => {
    if (!timestamp) return 'Never';
    
    const now = Date.now();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    return `${Math.floor(diffInSeconds / 86400)} day ago`;
  };

  const getTweetUrl = () => {
    if (!summaryStats) return '';
    
    let tweetText = `🚀 Just checked my Galxe airdrops!\n\n` +
      `💰 Joined ${summaryStats.totalProjects} projects across ${summaryStats.totalWallets} wallets\n` +
      `💲 Total $G Balance: ${formatNativeBalance(summaryStats.totalNativeBalance.toString())}\n`;
    
    // Add most joined projects if we have more than 2 wallets
    if (summaryStats.totalWallets > 2 && summaryStats.mostJoinedProjects.length > 0) {
      tweetText += `\n🏆 Most joined projects:\n`;
      summaryStats.mostJoinedProjects.forEach(project => {
        tweetText += `- ${project.name}: ${project.count}/${summaryStats.totalWallets} wallets (${Math.round(project.percentage)}%)\n`;
      });
    }
    
    tweetText += `\nCheck yours at cryptowalletsx.com/galxe-airdrops`;
    
    return `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Hero Banner Section */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Coins size={32} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">Galxe Airdrop Tracker</h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">Track your potential airdrops and points across multiple Galxe projects</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <p className="text-sm text-purple-100 mb-1">Check Points</p>
              <p className="text-lg font-semibold">Across Multiple Wallets</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <p className="text-sm text-purple-100 mb-1">Track $G Token</p>
              <p className="text-lg font-semibold">Native Token Balance</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <p className="text-sm text-purple-100 mb-1">Visualize Progress</p>
              <p className="text-lg font-semibold">Project Participation</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Summary Stats */}
        {summaryStats && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-purple-100">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg">
                <PieChart className="text-white" size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Summary Statistics</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200 shadow-sm">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white">
                    <Wallet size={20} />
                  </div>
                  <p className="ml-3 text-sm font-medium text-purple-800">Total Wallets</p>
                </div>
                <p className="text-3xl font-bold text-purple-900">{summaryStats.totalWallets}</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 shadow-sm">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <Layout size={20} />
                  </div>
                  <p className="ml-3 text-sm font-medium text-blue-800">Total Projects</p>
                </div>
                <p className="text-3xl font-bold text-blue-900">{summaryStats.totalProjects}</p>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200 shadow-sm">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                    <DollarSign size={20} />
                  </div>
                  <p className="ml-3 text-sm font-medium text-indigo-800">Total $G Balance</p>
                </div>
                <p className="text-3xl font-bold text-indigo-900">{formatNativeBalance(summaryStats.totalNativeBalance.toString())}</p>
              </div>
            </div>
            
            {/* Most Joined Projects (only if more than 2 wallets) */}
            {summaryStats.totalWallets > 2 && summaryStats.mostJoinedProjects.length > 0 && (
              <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl p-5 mt-6 border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Trophy size={18} className="text-amber-500 mr-2" />
                  Most Joined Projects
                </h3>
                <div className="space-y-4">
                  {summaryStats.mostJoinedProjects.map((project, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                          #{index + 1}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between mb-1">
                            <p className="font-semibold text-gray-900">{project.name}</p>
                            <p className="font-medium text-purple-600">{project.count}/{summaryStats.totalWallets}</p>
                          </div>
                          <div className="flex items-center">
                            <div className="flex-1 mr-3">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" 
                                  style={{ width: `${project.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <p className="text-xs font-medium text-gray-500 whitespace-nowrap">{Math.round(project.percentage)}% of wallets</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/2">
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
                  <h3 className="text-white font-semibold text-lg flex items-center">
                    <Coins className="mr-2" size={20} />
                    Check Your Wallets
                  </h3>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <label htmlFor="addresses" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <span className="mr-2">Enter wallet addresses</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">One per line, max 40</span>
                    </label>
                    <textarea
                      id="addresses"
                      rows={10}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none shadow-sm"
                      value={addresses}
                      onChange={(e) => setAddresses(e.target.value)}
                      placeholder="0x1234...&#10;0x5678...&#10;0x9abc..."
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !addresses.trim()}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md transform transition-transform hover:translate-y-[-2px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        {currentAddress ? (
                          <span>Checking {currentAddress.slice(0, 6)}...</span>
                        ) : (
                          'Processing...'
                        )}
                      </>
                    ) : (
                      'Check Airdrops'
                    )}
                  </button>
                </div>
              </div>
            </form>

            {summaryStats && (
              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl shadow-xl p-8 text-white">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Twitter size={28} className="text-white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Share2 size={16} className="text-indigo-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Share Your Stats</h3>
                  <p className="text-indigo-200 mb-6">Join the Galxe community and share your participation</p>
                  <a
                    href={getTweetUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-full hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-lg font-semibold"
                  >
                    <Twitter size={20} />
                    <span>Share on X</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="w-full lg:w-1/2">
            {results.length > 0 && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                    <Wallet className="text-white" size={20} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Your Wallets</h3>
                </div>
              
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg border border-gray-100"
                    >
                      <div className={`p-4 border-b ${result.error ? 'border-red-100 bg-red-50' : (parseFloat(result.nativeBalance || '0') > 0 ? 'border-green-100 bg-green-50' : 'border-gray-100')}`}>
                        <div 
                          className="flex justify-between items-center" 
                        >
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => toggleWalletExpand(result.address)}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-900 break-all">
                                {result.address}
                              </p>
                              {result.nativeBalance && parseFloat(result.nativeBalance) > 0 && (
                                <div className="flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full text-xs text-green-800 whitespace-nowrap font-semibold">
                                  <DollarSign size={12} />
                                  <span>{formatNativeBalance(result.nativeBalance)} $G</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center text-sm">
                              {result.error ? (
                                <span className="text-red-600 font-medium flex items-center">
                                  <AlertCircle size={14} className="mr-1" /> {result.error}
                                </span>
                              ) : result.tokens.length === 0 ? (
                                <span className="text-amber-600">No Galxe points found</span>
                              ) : (
                                <span className="text-green-700 font-medium">{result.tokens.length} projects joined</span>
                              )}
                              {result.lastFetched && (
                                <span className="ml-2 text-xs text-gray-500 flex items-center">
                                  <Clock size={12} className="mr-1" /> 
                                  Updated {formatLastUpdated(result.lastFetched)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              className="text-blue-600 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                refreshWallet(result.address);
                              }}
                              disabled={refreshingWallets[result.address]}
                              title="Refresh wallet data"
                            >
                              <RefreshCw size={18} className={refreshingWallets[result.address] ? "animate-spin" : ""} />
                            </button>
                            <button 
                              className="text-purple-600 hover:text-purple-700 p-2 rounded-full hover:bg-purple-50 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleWalletExpand(result.address);
                              }}
                              aria-label="Toggle expand"
                            >
                              {expandedWallets[result.address] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {expandedWallets[result.address] && !result.error && (
                        <div className="p-4">
                          {result.tokens.length > 0 ? (
                            <div className="space-y-4">
                              {result.tokens.map((token, tokenIndex) => (
                                <div 
                                  key={tokenIndex}
                                  className="flex items-center p-4 rounded-xl border border-purple-100 bg-gradient-to-br from-white to-purple-50 shadow-sm hover:shadow-md transition-all"
                                >
                                  <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center border-2 border-white shadow-sm">
                                    {token.token.icon_url ? (
                                      <img 
                                        src={token.token.icon_url} 
                                        alt={token.token.name} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = 'https://via.placeholder.com/40?text=G';
                                        }}
                                      />
                                    ) : (
                                      <Coins className="text-indigo-500" size={24} />
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0 ml-4">
                                    <p className="font-semibold text-gray-900 truncate">
                                      {token.token.name.replace(' Galxe Points', '')}
                                    </p>
                                    <p className="text-sm text-gray-600 truncate flex items-center">
                                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded-full mr-2">{token.token.symbol}</span>
                                      <span className="text-xs text-gray-500">
                                        {calculatePercentage(token.value, token.token.total_supply)} of total supply
                                      </span>
                                    </p>
                                  </div>
                                  
                                  <div className="text-right ml-4">
                                    <p className="font-bold text-purple-700 text-lg">
                                      {formatPoints(token.value, token.token.decimals)}
                                    </p>
                                    <p className="text-xs text-purple-600 font-medium">
                                      Points
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                              <Coins size={32} className="text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-600">No Galxe points found for this wallet</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add information section at the bottom */}
        <div className="mt-12 bg-white rounded-xl shadow-lg overflow-hidden border border-indigo-100">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <h2 className="text-2xl font-bold">About Galxe Airdrops</h2>
            <p className="text-indigo-100 mt-2">Understanding your potential airdrop eligibility in the Galxe ecosystem</p>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Coins className="text-indigo-600 mr-2" size={20} />
                  What is Galxe?
                </h3>
                <p className="text-gray-700 mb-3">
                  Galxe is one of Web3's largest credential data networks. It helps Web3 developers build better products and communities using on-chain and off-chain credentials.
                </p>
                <p className="text-gray-700 mb-3">
                  Galxe Points are earned by participating in various campaigns and activities across different blockchain projects. These points may become valuable if Galxe launches a token.
                </p>
                <div className="bg-indigo-50 p-4 rounded-lg mt-6 border border-indigo-100">
                  <p className="text-sm text-indigo-800 font-medium">
                    This tracker helps you visualize your participation across the Galxe ecosystem and monitor the $G token balance, which is distributed to eligible participants on Gravity Chain.
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Gift className="text-purple-600 mr-2" size={20} />
                  Airdrop Potential
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="bg-purple-100 rounded-full p-1 mt-0.5 mr-3">
                      <Check size={16} className="text-purple-700" />
                    </div>
                    <p className="text-gray-700">Participating in multiple Galxe campaigns across different projects may increase your airdrop eligibility.</p>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-purple-100 rounded-full p-1 mt-0.5 mr-3">
                      <Check size={16} className="text-purple-700" />
                    </div>
                    <p className="text-gray-700">The $G token on Gravity Chain is Galxe's current token that some users have received based on past participation.</p>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-purple-100 rounded-full p-1 mt-0.5 mr-3">
                      <Check size={16} className="text-purple-700" />
                    </div>
                    <p className="text-gray-700">Higher Galxe Points may indicate more engagement, which could potentially lead to larger airdrops if a token launch occurs.</p>
                  </li>
                </ul>
                <div className="bg-purple-50 p-4 rounded-lg mt-6 border border-purple-100">
                  <p className="text-sm text-purple-800 font-medium">
                    Remember that airdrops are never guaranteed. This tool simply helps you track your current status within the Galxe ecosystem.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mt-8 border border-indigo-100">
              <h3 className="text-lg font-semibold mb-3 text-center">Stay Updated</h3>
              <p className="text-gray-700 text-center mb-4">
                Keep checking back to track your Galxe points and $G token balance. We update our data directly from the blockchain.
              </p>
              <div className="flex justify-center">
                <a 
                  href="https://galxe.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
                >
                  Visit Galxe
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}