'use client';

import React, { useState } from 'react';
import { Search, Loader2, ExternalLink, ArrowRightLeft, Calendar, ChevronDown, ChevronUp, Network, Hash, ArrowRight } from 'lucide-react';

const MAY_1_2024_TIMESTAMP = 1714521600; // May 1, 2024 in Unix timestamp

interface ChainData {
  id: number;
  name: string;
  contracts: string[];
}

interface ProtocolData {
  id: string;
  name: string;
  count: number;
}

interface TransactionStats {
  totalTransactions: number;
  uniqueContracts: string[];
  sourceChains: ChainData[];
  destinationChains: ChainData[];
  protocols: ProtocolData[];
  uniqueDays: number;
  uniqueWeeks: number;
  uniqueMonths: number;
  sourceChainCount: number;
  destChainCount: number;
}

interface LzTransaction {
  source?: {
    tx?: {
      blockTimestamp: number;
    };
  };
  pathway?: {
    srcEid?: number;
    dstEid?: number;
    sender?: {
      address?: string;
      chain?: string;
      id?: string;
      name?: string;
    };
    receiver?: {
      address?: string;
      chain?: string;
      id?: string;
      name?: string;
    };
    payload?: {
      amount?: string;
    };
  };
  dapp?: {
    id?: string;
    name?: string;
  };
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatChainName(chainName: string): string {
  // Capitalize first letter of each word
  return chainName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export default function LayerZeroStatsChecker() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewingSourceChain, setViewingSourceChain] = useState<number | null>(null);
  const [viewingDestChain, setViewingDestChain] = useState<number | null>(null);
  const [expandAllSource, setExpandAllSource] = useState(false);
  const [expandAllDest, setExpandAllDest] = useState(false);

  const fetchLzData = async (walletAddress: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch the first page
      const firstPageResponse = await fetch(`https://scan.layerzero-api.com/v1/messages/wallet/${walletAddress}?limit=1000`);
      if (!firstPageResponse.ok) {
        throw new Error('Failed to fetch data');
      }
      
      let allData = await firstPageResponse.json();
      let transactions = allData.data || [];
      
      // Check if there's a next page and fetch it
      if (allData.nextToken) {
        const secondPageResponse = await fetch(`https://scan.layerzero-api.com/v1/messages/wallet/${walletAddress}?limit=1000&nextToken=${allData.nextToken}`);
        if (secondPageResponse.ok) {
          const secondPageData = await secondPageResponse.json();
          if (secondPageData.data) {
            transactions = [...transactions, ...secondPageData.data];
          }
        }
      }
      
      // Filter transactions after May 1, 2024
      const recentTransactions = transactions.filter((tx: LzTransaction) => {
        const timestamp = tx.source?.tx?.blockTimestamp || 0;
        return timestamp >= MAY_1_2024_TIMESTAMP;
      });
      
      if (recentTransactions.length === 0) {
        setError('No LayerZero transactions found after May 1, 2024');
        setLoading(false);
        return;
      }
      
      // Process data for statistics
      const uniqueContracts = new Set<string>();
      const sourceChainInteractions = new Map<number, { name: string, contracts: Set<string> }>();
      const destChainInteractions = new Map<number, { name: string, contracts: Set<string> }>();
      const protocolCounts = new Map<string, { id: string, name: string, count: number }>();
      const uniqueDays = new Set<string>();
      const uniqueWeeks = new Set<string>();
      const uniqueMonths = new Set<string>();
      let totalVolume = 0;
      
      recentTransactions.forEach((tx: LzTransaction) => {
        if (!tx.source?.tx?.blockTimestamp) return;
        
        // Add contracts
        if (tx.pathway?.sender?.address) {
          uniqueContracts.add(tx.pathway.sender.address);
        }
        if (tx.pathway?.receiver?.address) {
          uniqueContracts.add(tx.pathway.receiver.address);
        }
        
        // Count protocols from sender side
        const senderProtocolId = tx.pathway?.sender?.id || "unknown";
        const senderProtocolName = tx.pathway?.sender?.name || "Unknown";
        
        if (senderProtocolId !== "unknown") {
          if (!protocolCounts.has(senderProtocolId)) {
            protocolCounts.set(senderProtocolId, { id: senderProtocolId, name: senderProtocolName, count: 0 });
          }
          const protocolData = protocolCounts.get(senderProtocolId);
          if (protocolData) {
            protocolData.count += 1;
            protocolCounts.set(senderProtocolId, protocolData);
          }
        }
        
        // Count protocols from receiver side
        const receiverProtocolId = tx.pathway?.receiver?.id || "unknown";
        const receiverProtocolName = tx.pathway?.receiver?.name || "Unknown";
        
        // Only count receiver if it's different from sender to avoid double-counting
        if (receiverProtocolId !== "unknown" && receiverProtocolId !== senderProtocolId) {
          if (!protocolCounts.has(receiverProtocolId)) {
            protocolCounts.set(receiverProtocolId, { id: receiverProtocolId, name: receiverProtocolName, count: 0 });
          }
          const receiverProtocolData = protocolCounts.get(receiverProtocolId);
          if (receiverProtocolData) {
            receiverProtocolData.count += 1;
            protocolCounts.set(receiverProtocolId, receiverProtocolData);
          }
        }
        
        // Add source chain data
        const srcEid = tx.pathway?.srcEid;
        if (srcEid && tx.pathway?.sender?.chain) {
          if (!sourceChainInteractions.has(srcEid)) {
            sourceChainInteractions.set(srcEid, {
              name: tx.pathway.sender.chain,
              contracts: new Set<string>()
            });
          }
          if (tx.pathway.sender.address) {
            sourceChainInteractions.get(srcEid)?.contracts.add(tx.pathway.sender.address);
          }
        }
        
        // Add destination chain data
        const dstEid = tx.pathway?.dstEid;
        if (dstEid && tx.pathway?.receiver?.chain) {
          if (!destChainInteractions.has(dstEid)) {
            destChainInteractions.set(dstEid, {
              name: tx.pathway.receiver.chain,
              contracts: new Set<string>()
            });
          }
          if (tx.pathway.receiver.address) {
            destChainInteractions.get(dstEid)?.contracts.add(tx.pathway.receiver.address);
          }
        }
        
        // Add time data
        const date = new Date(tx.source.tx.blockTimestamp * 1000);
        uniqueDays.add(date.toISOString().split('T')[0]);
        
        const weekYear = getWeekNumber(date);
        uniqueWeeks.add(`${weekYear[0]}-${weekYear[1]}`);
        
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
        uniqueMonths.add(monthYear);
        
        // Add to volume if available
        if (tx.pathway?.payload?.amount) {
          try {
            const amount = parseFloat(tx.pathway.payload.amount);
            if (!isNaN(amount)) {
              totalVolume += amount;
            }
          } catch (e) {
            // Skip if unable to parse volume
          }
        }
      });
      
      // Convert chain data to the format we want
      const sourceChains: ChainData[] = Array.from(sourceChainInteractions.entries()).map(([id, data]) => ({
        id,
        name: data.name,
        contracts: Array.from(data.contracts)
      }));
      
      const destChains: ChainData[] = Array.from(destChainInteractions.entries()).map(([id, data]) => ({
        id,
        name: data.name,
        contracts: Array.from(data.contracts)
      }));
      
      // Convert protocol data
      const protocols: ProtocolData[] = Array.from(protocolCounts.values())
        .sort((a, b) => b.count - a.count);
      
      // Set the stats
      setStats({
        totalTransactions: recentTransactions.length,
        uniqueContracts: Array.from(uniqueContracts),
        sourceChains,
        destinationChains: destChains,
        protocols,
        uniqueDays: uniqueDays.size,
        uniqueWeeks: uniqueWeeks.size,
        uniqueMonths: uniqueMonths.size,
        sourceChainCount: sourceChains.length,
        destChainCount: destChains.length
      });
      
    } catch (err) {
      console.error('Error fetching LayerZero data:', err);
      setError('Failed to fetch LayerZero transaction data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getWeekNumber = (date: Date): [number, number] => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return [d.getUTCFullYear(), weekNo];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || loading) return;
    
    await fetchLzData(address);
  };

  const toggleSourceChainDetails = (chainId: number) => {
    setViewingSourceChain(viewingSourceChain === chainId ? null : chainId);
  };

  const toggleDestChainDetails = (chainId: number) => {
    setViewingDestChain(viewingDestChain === chainId ? null : chainId);
  };
  
  const toggleAllSourceChains = () => {
    if (expandAllSource) {
      // If currently expanded, collapse all
      setViewingSourceChain(null);
      setExpandAllSource(false);
    } else if (stats?.sourceChains.length) {
      // If currently collapsed, expand all
      setExpandAllSource(true);
    }
  };
  
  const toggleAllDestChains = () => {
    if (expandAllDest) {
      // If currently expanded, collapse all
      setViewingDestChain(null);
      setExpandAllDest(false);
    } else if (stats?.destinationChains.length) {
      // If currently collapsed, expand all
      setExpandAllDest(true);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto px-1 sm:px-6">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">LayerZero Stats Checker</h1>
          <p className="text-gray-600">Track your wallet's LayerZero activity for the second airdrop (from May 1, 2024)</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter EVM address"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                aria-label="Wallet address input"
              />
              <Search className="absolute right-3 top-3.5 text-gray-400" size={20} />
            </div>
            <button
              type="submit"
              disabled={loading || !address.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={20} /> Analyzing...</>
              ) : (
                'Check Stats'
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {stats && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Transactions count */}
                <div className="col-span-1">
                  <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-3">
                    <ArrowRightLeft className="text-blue-500 flex-shrink-0" size={24} />
                    <div>
                      <p className="text-sm text-gray-600">Total Transactions</p>
                      <p className="text-lg font-semibold">{stats.totalTransactions}</p>
                    </div>
                  </div>
                </div>

                {/* Source Chains count */}
                <div className="col-span-1">
                  <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3">
                    <Network className="text-green-500 flex-shrink-0" size={24} />
                    <div>
                      <p className="text-sm text-gray-600">Source Chains</p>
                      <p className="text-lg font-semibold">{stats.sourceChainCount}</p>
                    </div>
                  </div>
                </div>

                {/* Destination Chains count */}
                <div className="col-span-1">
                  <div className="flex items-center gap-3 bg-purple-50 rounded-lg p-3">
                    <ArrowRight className="text-purple-500 flex-shrink-0" size={24} />
                    <div>
                      <p className="text-sm text-gray-600">Destination Chains</p>
                      <p className="text-lg font-semibold">{stats.destChainCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contracts count */}
              <div className="mt-4">
                <div className="flex items-center gap-3 bg-yellow-50 rounded-lg p-3">
                  <Hash className="text-yellow-600 flex-shrink-0" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Contracts Interacted</p>
                    <p className="text-lg font-semibold">{stats.uniqueContracts.length}</p>
                  </div>
                </div>
              </div>

              {/* Protocol Stats */}
              {stats.protocols.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-3">Protocols Used</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {stats.protocols.map((protocol, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3 flex flex-col border border-gray-200 hover:shadow-sm transition-shadow">
                        <span className="text-sm font-medium text-gray-800">{protocol.name}</span>
                        <span className="text-lg font-semibold">{protocol.count} txns</span>
                      </div>
                    ))}
                    {stats.protocols.length === 0 && (
                      <div className="col-span-full">
                        <p className="text-gray-500">No protocol information available</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Activity Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div className="bg-pink-50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-pink-500 flex-shrink-0" size={24} />
                    <div>
                      <p className="text-sm text-gray-600">Unique Days Active</p>
                      <p className="text-lg font-semibold">{stats.uniqueDays}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-orange-500 flex-shrink-0" size={24} />
                    <div>
                      <p className="text-sm text-gray-600">Unique Weeks Active</p>
                      <p className="text-lg font-semibold">{stats.uniqueWeeks}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-teal-50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-teal-500 flex-shrink-0" size={24} />
                    <div>
                      <p className="text-sm text-gray-600">Unique Months Active</p>
                      <p className="text-lg font-semibold">{stats.uniqueMonths}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Source Chain Details Section */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-semibold">Source Chains</h2>
                  <button 
                    onClick={toggleAllSourceChains}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 flex items-center gap-1"
                  >
                    {expandAllSource ? (
                      <>
                        <ChevronUp size={16} />
                        Hide All
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} />
                        Show All
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-2">
                  {stats.sourceChains.map(chain => (
                    <div key={chain.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSourceChainDetails(chain.id)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Network className="text-blue-500" size={18} />
                          <span className="font-medium">{formatChainName(chain.name)}</span>
                          <span className="text-sm text-gray-500">({chain.contracts.length} contracts)</span>
                        </div>
                        {viewingSourceChain === chain.id || expandAllSource ? (
                          <ChevronUp size={18} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={18} className="text-gray-400" />
                        )}
                      </button>
                      
                      {(viewingSourceChain === chain.id || expandAllSource) && (
                        <div className="p-3 bg-white">
                          <h3 className="text-sm font-medium mb-2">Source Contracts on {formatChainName(chain.name)}</h3>
                          <div className="grid grid-cols-1 gap-2">
                            {chain.contracts.map(contract => (
                              <div key={contract} className="text-sm bg-gray-50 p-2 rounded flex items-center justify-between">
                                <span>{truncateAddress(contract)}</span>
                                <a 
                                  href={`https://layerzeroscan.com/address/${contract}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline flex items-center gap-1"
                                >
                                  <ExternalLink size={14} />
                                  <span>View</span>
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Destination Chain Details Section */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-semibold">Destination Chains</h2>
                  <button 
                    onClick={toggleAllDestChains}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 flex items-center gap-1"
                  >
                    {expandAllDest ? (
                      <>
                        <ChevronUp size={16} />
                        Hide All
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} />
                        Show All
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-2">
                  {stats.destinationChains.map(chain => (
                    <div key={chain.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleDestChainDetails(chain.id)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Network className="text-purple-500" size={18} />
                          <span className="font-medium">{formatChainName(chain.name)}</span>
                          <span className="text-sm text-gray-500">({chain.contracts.length} contracts)</span>
                        </div>
                        {viewingDestChain === chain.id || expandAllDest ? (
                          <ChevronUp size={18} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={18} className="text-gray-400" />
                        )}
                      </button>
                      
                      {(viewingDestChain === chain.id || expandAllDest) && (
                        <div className="p-3 bg-white">
                          <h3 className="text-sm font-medium mb-2">Destination Contracts on {formatChainName(chain.name)}</h3>
                          <div className="grid grid-cols-1 gap-2">
                            {chain.contracts.map(contract => (
                              <div key={contract} className="text-sm bg-gray-50 p-2 rounded flex items-center justify-between">
                                <span>{truncateAddress(contract)}</span>
                                <a 
                                  href={`https://layerzeroscan.com/address/${contract}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline flex items-center gap-1"
                                >
                                  <ExternalLink size={14} />
                                  <span>View</span>
                                </a>
                              </div>
                            ))}
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
      </div>
    </>
  );
} 