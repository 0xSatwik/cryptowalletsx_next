'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader2, Network, ChevronDown, ChevronUp, Download, Check, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

// Chain data interface from chainlist.org/rpcs.json
interface RpcInfo {
  url: string;
  tracking?: string;
  isOpenSource?: boolean;
}

interface Explorer {
  name: string;
  url: string;
  standard?: string;
  icon?: string;
}

interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}

interface ChainData {
  name: string;
  chain: string;
  icon?: string;
  rpc: RpcInfo[];
  nativeCurrency: NativeCurrency;
  chainId: number;
  networkId?: number;
  explorers?: Explorer[];
  infoURL?: string;
  shortName?: string;
  tvl?: number;
  chainSlug?: string;
}

interface BalanceResult {
  address: string;
  balances: {
    [chainId: number]: {
      balance: string;
      symbol: string;
      name: string;
      error?: string;
      decimals: number;
    };
  };
}

interface ChainSummary {
  total: string;
  symbol: string;
  name: string;
  decimals: number;
  wallets: number;
}

interface SummaryStats {
  totalWallets: number;
  networksChecked: number;
  successfulChecks: number;
  failedChecks: number;
  chainTotals: {
    [chainId: number]: ChainSummary;
  };
}

// Function to format wei balance to human-readable format
function formatBalance(balance: string, decimals: number = 18): string {
  try {
    const value = BigInt(balance);
    const divisor = BigInt(10 ** decimals);
    const integerPart = value / divisor;
    const fractionalPart = value % divisor;
    const paddedFractional = fractionalPart.toString().padStart(decimals, '0');
    const formattedFractional = paddedFractional.slice(0, 4); // Show 4 decimal places for simplicity
    return `${integerPart}.${formattedFractional}`;
  } catch (error) {
    return '0.0000';
  }
}

// Function to get balance from a chain using RPC fallbacks
async function getBalance(address: string, chain: ChainData): Promise<{ balance: string; error?: string }> {
  // Filter out websocket RPCs as they're not compatible with fetch
  const httpRpcs = chain.rpc.filter(rpc => !rpc.url.startsWith('wss://'));
  
  // Try each RPC until one succeeds
  for (const rpc of httpRpcs) {
    try {
      const response = await fetch(rpc.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1,
        }),
        // Set a timeout to prevent hanging on slow RPCs
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      if (data.error) {
        continue;
      }

      const balance = BigInt(data.result || '0').toString();
      return { balance };
    } catch (error) {
      // Try the next RPC
      continue;
    }
  }

  return { balance: '0', error: 'All RPCs failed' };
}

export default function BulkBalanceChecker() {
  const [addresses, setAddresses] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BalanceResult[]>([]);
  const [currentAddress, setCurrentAddress] = useState('');
  const [expandedAddresses, setExpandedAddresses] = useState<Record<string, boolean>>({});
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [allChains, setAllChains] = useState<ChainData[]>([]);
  const [selectedChains, setSelectedChains] = useState<number[]>([]);
  const [loadingChains, setLoadingChains] = useState(true);
  const [chainsError, setChainsError] = useState<string | null>(null);
  const [expandedChainCategory, setExpandedChainCategory] = useState<Record<string, boolean>>({
    "Popular Chains": true,
    "Other Chains": false,
  });

  // Function to get top chains and other chains
  const getTopChains = (chains: ChainData[]): { topChains: ChainData[], otherChains: ChainData[] } => {
    // Define top chains by chainId - we'll show these directly
    const topChainIds = [1, 56, 137, 42161, 10, 8453, 43114]; // ETH, BSC, Polygon, Arbitrum, Optimism, Base, Avalanche
    
    // Sort chains by TVL (if available) or name
    const sortedChains = [...chains].sort((a, b) => {
      if (a.tvl && b.tvl) return b.tvl - a.tvl;
      if (a.tvl) return -1;
      if (b.tvl) return 1;
      return a.name.localeCompare(b.name);
    });

    const topChains: ChainData[] = [];
    const otherChains: ChainData[] = [];

    // Assign chains to categories
    sortedChains.forEach(chain => {
      if (topChainIds.includes(chain.chainId)) {
        topChains.push(chain);
      } else {
        otherChains.push(chain);
      }
    });

    return { topChains, otherChains };
  };

  // State for showing all networks
  const [showAllNetworks, setShowAllNetworks] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter chains based on search term
  const filterChains = (chains: ChainData[]) => {
    if (!searchTerm.trim()) return chains;
    
    return chains.filter(chain => 
      chain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chain.nativeCurrency.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chain.chainId.toString().includes(searchTerm)
    );
  };
  
  // Function to check if a chain is a testnet
  const isTestnet = (chain: ChainData): boolean => {
    // Check for common testnet indicators in the name
    const testnameIndicators = ['testnet', 'test', 'sepolia', 'goerli', 'holesky', 'mumbai', 'fuji'];
    
    // Check the chain name against testnet indicators
    return testnameIndicators.some(indicator => 
      chain.name.toLowerCase().includes(indicator.toLowerCase())
    );
  };

  // Fetch chain data from chainlist.org
  useEffect(() => {
    const fetchChains = async () => {
      setLoadingChains(true);
      setChainsError(null);
      
      try {
        const response = await fetch('https://chainlist.org/rpcs.json');
        if (!response.ok) {
          throw new Error('Failed to fetch chain data');
        }
        
        const data: ChainData[] = await response.json();
        
        // Filter out chains with no RPC endpoints or missing native currency
        const validChains = data.filter(chain => 
          chain.rpc && 
          chain.rpc.length > 0 && 
          chain.nativeCurrency &&
          chain.chainId
        );
        
        setAllChains(validChains);
        
        // Auto-select some popular chains by default
        setSelectedChains([1, 56, 137]); // ETH, BSC, Polygon
      } catch (error) {
        console.error('Error fetching chain data:', error);
        setChainsError('Failed to load chain data. Please try again later.');
      } finally {
        setLoadingChains(false);
      }
    };
    
    fetchChains();
  }, []);

  const toggleAddressExpand = (address: string) => {
    setExpandedAddresses(prev => ({
      ...prev,
      [address]: !prev[address]
    }));
  };

  const toggleChainCategory = (category: string) => {
    setExpandedChainCategory(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleChainSelection = (chainId: number) => {
    setSelectedChains(prev => 
      prev.includes(chainId)
        ? prev.filter(id => id !== chainId)
        : [...prev, chainId]
    );
  };

  const selectAllChainsInCategory = (category: string, chains: ChainData[]) => {
    const chainIds = chains.map(chain => chain.chainId);
    
    // Check if all chains in this category are already selected
    const allSelected = chainIds.every(id => selectedChains.includes(id));
    
    if (allSelected) {
      // Deselect all chains in this category
      setSelectedChains(prev => prev.filter(id => !chainIds.includes(id)));
    } else {
      // Select all chains in this category
      setSelectedChains(prev => {
        const newSelection = [...prev];
        chainIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  const refreshChainData = async () => {
    setLoadingChains(true);
    setChainsError(null);
    
    try {
      const response = await fetch('https://chainlist.org/rpcs.json');
      if (!response.ok) {
        throw new Error('Failed to fetch chain data');
      }
      
      const data: ChainData[] = await response.json();
      
      // Filter out chains with no RPC endpoints
      const validChains = data.filter(chain => 
        chain.rpc && 
        chain.rpc.length > 0 && 
        chain.nativeCurrency &&
        chain.chainId
      );
      
      setAllChains(validChains);
    } catch (error) {
      console.error('Error refreshing chain data:', error);
      setChainsError('Failed to refresh chain data. Please try again later.');
    } finally {
      setLoadingChains(false);
    }
  };

  const calculateChainTotals = (results: BalanceResult[]): { [chainId: number]: ChainSummary } => {
    const chainTotals: { [chainId: number]: ChainSummary } = {};
    
    selectedChains.forEach(chainId => {
      const chain = allChains.find(c => c.chainId === chainId);
      if (!chain) return;
      
      let total = BigInt(0);
      let walletsWithBalance = 0;
      
      results.forEach(result => {
        if (result.balances[chainId]?.balance) {
          const balance = BigInt(result.balances[chainId].balance);
          if (balance > BigInt(0)) {
            total += balance;
            walletsWithBalance++;
          }
        }
      });
      
      if (total > BigInt(0) || walletsWithBalance > 0) {
        chainTotals[chainId] = {
          total: total.toString(),
          symbol: chain.nativeCurrency.symbol,
          name: chain.name,
          decimals: chain.nativeCurrency.decimals,
          wallets: walletsWithBalance
        };
      }
    });

    return chainTotals;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addresses.trim() || loading || selectedChains.length === 0) return;

    setLoading(true);
    setResults([]);
    setCurrentAddress('');
    
    const addressList = addresses
      .split('\n')
      .map(addr => addr.trim())
      .filter(addr => addr.length > 0 && addr.startsWith('0x'));

    if (addressList.length === 0) {
      setLoading(false);
      return;
    }

    let successfulChecks = 0;
    let totalChecks = 0;
    const newResults: BalanceResult[] = [];

    for (const address of addressList) {
      setCurrentAddress(address);
      const result: BalanceResult = {
        address,
        balances: {}
      };

      for (const chainId of selectedChains) {
        const chain = allChains.find(c => c.chainId === chainId);
        if (!chain) continue;
        
        totalChecks++;
        const { balance, error } = await getBalance(address, chain);
        
        result.balances[chainId] = { 
          balance, 
          error,
          symbol: chain.nativeCurrency.symbol,
          name: chain.name,
          decimals: chain.nativeCurrency.decimals
        };
        
        if (!error) {
          successfulChecks++;
        }
      }

      newResults.push(result);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setResults(newResults);
    const chainTotals = calculateChainTotals(newResults);

    setSummaryStats({
      totalWallets: addressList.length,
      networksChecked: selectedChains.length,
      successfulChecks,
      failedChecks: totalChecks - successfulChecks,
      chainTotals
    });
    
    setLoading(false);
    setCurrentAddress('');
  };

  const downloadResults = () => {
    const selectedChainDetails = selectedChains.map(id => {
      const chain = allChains.find(c => c.chainId === id);
      return chain ? { id, name: chain.name, symbol: chain.nativeCurrency.symbol } : null;
    }).filter(Boolean);
    
    const csv = [
      ['Address', ...selectedChainDetails.map(chain => `${chain?.name} (${chain?.symbol})`)].join(','),
      ...results.map(result => [
        result.address,
        ...selectedChains.map(chainId => {
          const balanceData = result.balances[chainId];
          return balanceData ? formatBalance(balanceData.balance, balanceData.decimals) : '0';
        })
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'native-balances.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Get filtered chains
  const getChainsToDisplay = () => {
    const { topChains, otherChains } = getTopChains(allChains);
    
    if (searchTerm) {
      // When searching, show all chains that match the search term
      return filterChains([...topChains, ...otherChains]);
    }
    
    // When not searching, show top chains and conditionally show other chains
    return showAllNetworks 
      ? [...topChains, ...otherChains]
      : topChains;
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Multi-Chain Balance Checker</h1>
          <p className="text-gray-600">Check native token balances across multiple networks</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Networks
                    </label>
                    <button
                      type="button"
                      onClick={refreshChainData}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                      disabled={loadingChains}
                    >
                      <RefreshCw size={14} className={loadingChains ? "animate-spin" : ""} />
                      Refresh
                    </button>
                  </div>
                  
                  {loadingChains ? (
                    <div className="flex justify-center items-center p-6 bg-gray-50 rounded-lg">
                      <Loader2 className="animate-spin text-purple-600 mr-2" size={20} />
                      <span>Loading chains...</span>
                    </div>
                  ) : chainsError ? (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
                      <AlertCircle className="mr-2" size={20} />
                      <span>{chainsError}</span>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3">
                        <div className="relative">
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search networks..."
                            className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                          />
                          <Search className="absolute right-3 top-2 text-gray-400" size={20} />
                        </div>
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                        <div className="divide-y divide-gray-200">
                          {getChainsToDisplay().map((chain) => (
                            <div
                              key={chain.chainId}
                              className="flex items-center p-3 hover:bg-gray-50"
                            >
                              <label className="flex items-center cursor-pointer w-full">
                                <input
                                  type="checkbox"
                                  checked={selectedChains.includes(chain.chainId)}
                                  onChange={() => toggleChainSelection(chain.chainId)}
                                  className="sr-only"
                                />
                                <div className={`w-5 h-5 mr-3 rounded flex items-center justify-center ${
                                  selectedChains.includes(chain.chainId) 
                                    ? "bg-purple-600" 
                                    : "border border-gray-300"
                                }`}>
                                  {selectedChains.includes(chain.chainId) && (
                                    <Check size={14} className="text-white" />
                                  )}
                                </div>
                                <div className="flex-1 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                      {chain.name}
                                    </span>
                                    {isTestnet(chain) && (
                                      <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                                        Testnet
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-500 mr-1">
                                    {chain.nativeCurrency.symbol}
                                  </span>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {!searchTerm && !showAllNetworks && (
                        <button
                          type="button"
                          onClick={() => setShowAllNetworks(true)}
                          className="mt-3 w-full py-2 text-center text-sm font-medium text-purple-600 hover:text-purple-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          Show More Networks
                        </button>
                      )}
                      
                      {!searchTerm && showAllNetworks && (
                        <button
                          type="button"
                          onClick={() => setShowAllNetworks(false)}
                          className="mt-3 w-full py-2 text-center text-sm font-medium text-purple-600 hover:text-purple-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          Show Less Networks
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <label htmlFor="addresses" className="block text-sm font-medium text-gray-700 mb-2">
                    Wallet Addresses (one per line)
                  </label>
                  <textarea
                    id="addresses"
                    rows={10}
                    value={addresses}
                    onChange={(e) => setAddresses(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="0x1234...&#10;0x5678...&#10;0x9abc..."
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !addresses.trim() || selectedChains.length === 0 || loadingChains}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    <>
                      <Search size={20} />
                      Check Balances
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            {results.length > 0 && (
              <div className="space-y-6">
                {/* Summary Stats */}
                {summaryStats && (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Network className="text-purple-600" size={24} />
                        Summary
                      </h2>
                      <button
                        onClick={downloadResults}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        <Download size={18} />
                        Export CSV
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Total Wallets</p>
                        <p className="text-xl font-semibold">{summaryStats.totalWallets}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Networks Checked</p>
                        <p className="text-xl font-semibold">{summaryStats.networksChecked}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Successful Checks</p>
                        <p className="text-xl font-semibold">{summaryStats.successfulChecks}</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Failed Checks</p>
                        <p className="text-xl font-semibold">{summaryStats.failedChecks}</p>
                      </div>
                    </div>

                    {/* Chain-wise Total Balances */}
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="text-lg font-semibold mb-3">Total Balances by Chain</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(summaryStats.chainTotals).map(([chainIdStr, data]) => {
                          const chainId = parseInt(chainIdStr);
                          const chain = allChains.find(c => c.chainId === chainId);
                          
                          if (!chain) return null;
                          
                          return (
                            <div key={chainId} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900">{data.name}</p>
                                {isTestnet(chain) && (
                                  <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                                    Testnet
                                  </span>
                                )}
                              </div>
                              <p className="text-lg font-semibold text-purple-600">
                                {formatBalance(data.total, data.decimals)} {data.symbol}
                              </p>
                              <p className="text-sm text-gray-500">
                                {data.wallets} wallet{data.wallets !== 1 ? 's' : ''}
                              </p>
                              {chain.explorers && chain.explorers[0] && (
                                <a 
                                  href={chain.explorers[0].url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-700 mt-1 flex items-center gap-1"
                                >
                                  <ExternalLink size={12} />
                                  Explorer
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Results */}
                <div className="bg-white rounded-xl shadow-md">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold">Results</h2>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {results.map((result, index) => (
                      <div key={index} className="p-6">
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleAddressExpand(result.address)}
                        >
                          <div>
                            <p className="font-medium text-gray-900 break-all">
                              {result.address}
                            </p>
                          </div>
                          <button className="text-purple-600 hover:text-purple-700">
                            {expandedAddresses[result.address] ? (
                              <ChevronUp size={20} />
                            ) : (
                              <ChevronDown size={20} />
                            )}
                          </button>
                        </div>

                        {expandedAddresses[result.address] && (
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {selectedChains.map((chainId) => {
                              const chain = allChains.find(c => c.chainId === chainId);
                              if (!chain) return null;
                              
                              const balanceData = result.balances[chainId] || { 
                                balance: '0', 
                                symbol: chain.nativeCurrency.symbol,
                                name: chain.name,
                                decimals: chain.nativeCurrency.decimals 
                              };
                              
                              const hasBalance = BigInt(balanceData.balance) > BigInt(0);
                              
                              return (
                                <div
                                  key={chainId}
                                  className={`flex items-center justify-between p-3 rounded-lg ${
                                    hasBalance ? 'bg-green-50' : 'bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                      hasBalance ? 'bg-green-500' : 'bg-gray-300'
                                    }`} />
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{chain.name}</span>
                                        {isTestnet(chain) && (
                                          <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                                            Testnet
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right flex flex-col items-end">
                                    <p className="text-sm font-medium">
                                      {formatBalance(balanceData.balance, balanceData.decimals)} {balanceData.symbol}
                                    </p>
                                    {balanceData.error && (
                                      <p className="text-xs text-red-500">Error: {balanceData.error}</p>
                                    )}
                                    {hasBalance && chain.explorers && chain.explorers[0] && (
                                      <a 
                                        href={`${chain.explorers[0].url}/address/${result.address}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
                                      >
                                        <ExternalLink size={10} />
                                        View
                                      </a>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}