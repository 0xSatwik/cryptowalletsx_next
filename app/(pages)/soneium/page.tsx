'use client';

import React, { useState } from 'react';
import { Search, Loader2, ExternalLink, Wallet, Clock, ArrowRightLeft, Coins, Frame, Repeat, Boxes, Twitter, Calendar, ChevronDown, ChevronUp, CheckCircle2, XCircle, ImageIcon, Building2, Users, BarChart } from 'lucide-react';
import { fetchSoneiumStats, fetchSoneiumTokens, fetchSoneiumNFTs, SoneiumStats } from '../../../lib/soneium';
import type { NFTCollection } from '../../../lib/types';

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function SoneiumStatsPage() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<SoneiumStats | null>(null);
  const [showContracts, setShowContracts] = useState(false);
  const [showInteractions, setShowInteractions] = useState(false);
  const [nfts, setNfts] = useState<NFTCollection[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [showNFTs, setShowNFTs] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const [showBalanceHistory, setShowBalanceHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || loading) return;

    setLoading(true);
    setError(null);
    try {
      const [statsData, nftsData, tokensData] = await Promise.all([
        fetchSoneiumStats(address),
        fetchSoneiumNFTs(address),
        fetchSoneiumTokens(address)
      ]);
      setStats(statsData);
      
      // Transform nftsData to match the expected NFTCollection interface
      const typedNfts = nftsData ? nftsData.map((nft: any) => ({
        ...nft,
        token: {
          ...nft.token,
          total_supply: nft.token.total_supply || "0" // Ensure total_supply is never null
        }
      })) : [];
      
      setNfts(typedNfts);
      setTokens(tokensData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch wallet data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTweetUrl = (stats?: SoneiumStats | null) => {
    if (!stats) return '';
    const text = `🚀 Just checked my wallet stats on Soneium!\n\n` +
      `💰 ${stats.nativeBalance.toFixed(4)} ETH ($${stats.nativeBalanceUSD})\n` +
      `📊 ${stats.totalTransactions} transactions\n` +
      `📅 Active since ${stats.firstTransactionDate}\n` +
      `⚡ ${stats.uniqueDays} Days Active\n\n` +
      `Check your stats at cryptowalletsx.com/soneium`;
    return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
  };

  return (
    <>
      <div className="max-w-4xl mx-auto px-1 sm:px-6">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Soneium Chain Stats</h1>
          <p className="text-gray-600">Track your wallet activity on Soneium Chain</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter EVM address"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                aria-label="Wallet address input"
              />
              <Search className="absolute right-3 top-3.5 text-gray-400" size={20} />
            </div>
            <button
              type="submit"
              disabled={loading || !address.trim()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            {/* Main Stats Grid */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Balance section */}
                <div className="col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-3 bg-purple-50 rounded-lg p-3">
                    <Wallet className="text-purple-500 flex-shrink-0" size={24} />
                    <div>
                      <p className="text-sm text-gray-600">Balance</p>
                      <p className="text-lg font-semibold">
                        {stats.nativeBalance.toFixed(4)} ETH
                        <span className="block text-sm text-gray-500">
                          (${stats.nativeBalanceUSD})
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Updated Wallet Age section */}
                <div className="col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-3">
                    <Clock className="text-blue-500 flex-shrink-0" size={24} />
                    <div>
                      <p className="text-sm text-gray-600">Wallet Age</p>
                      <p className="text-lg font-semibold">{stats.walletAgeDays} days</p>
                      <p className="text-sm text-gray-500">
                        <a 
                          href={`https://soneium.blockscout.com/tx/${stats.firstTransactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-purple-600 transition-colors"
                        >
                          Since {stats.firstTransactionDate}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transactions and Transfers */}
                <div className="col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3">
                    <ArrowRightLeft className="text-green-500 flex-shrink-0" size={24} />
                    <div>
                      <p className="text-sm text-gray-600">Total Transactions</p>
                      <p className="text-lg font-semibold">{stats.totalTransactions}</p>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-3 bg-yellow-50 rounded-lg p-3">
                    <Repeat className="text-yellow-500 flex-shrink-0" size={24} />
                    <div>
                      <p className="text-sm text-gray-600">Token Transfers</p>
                      <p className="text-lg font-semibold">{stats.tokenTransfers}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gas Usage */}
              <div className="mt-4">
                <div className="bg-indigo-50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Coins className="text-indigo-500 flex-shrink-0" size={24} />
                    <div>
                      <p className="text-sm text-gray-600">Gas Used</p>
                      <p className="text-lg font-semibold">
                        {stats.gasUsageEther} ETH
                        <span className="block text-sm text-gray-500">
                          ({Number(stats.gasUsage).toLocaleString()} GWEI)
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

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
                    <Frame className="text-orange-500 flex-shrink-0" size={24} />
                    <div>
                      <p className="text-sm text-gray-600">Unique Weeks Active</p>
                      <p className="text-lg font-semibold">{stats.uniqueWeeks}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-teal-50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Boxes className="text-teal-500 flex-shrink-0" size={24} />
                    <div>
                      <p className="text-sm text-gray-600">Unique Months Active</p>
                      <p className="text-lg font-semibold">{stats.uniqueMonths}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Balance History */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <BarChart className="text-purple-500 flex-shrink-0" size={24} />
                  <div>
                    <h2 className="text-xl font-semibold">Balance History</h2>
                    <p className="text-sm text-gray-600">
                      Daily balance changes over time
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBalanceHistory(!showBalanceHistory)}
                  className="text-purple-600 hover:text-purple-700"
                >
                  {showBalanceHistory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>

              {showBalanceHistory && stats.balanceHistory.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balance (ETH)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.balanceHistory.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(parseFloat(item.value) / 1e18).toFixed(6)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {showBalanceHistory && stats.balanceHistory.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No balance history data available
                </div>
              )}
            </div>

            {/* Contracts Created */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Building2 className="text-purple-500 flex-shrink-0" size={24} />
                  <div>
                    <h2 className="text-xl font-semibold">Contracts Created</h2>
                    <p className="text-sm text-gray-600">
                      {stats.contractsCreated.length} contracts ({stats.verifiedContractsCount} verified)
                    </p>
                  </div>
                </div>
                {stats.contractsCreated.length > 0 && (
                  <button
                    onClick={() => setShowContracts(!showContracts)}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    {showContracts ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                )}
              </div>

              {showContracts && stats.contractsCreated.length > 0 && (
                <div className="mt-4 space-y-4">
                  {stats.contractsCreated.map((contract) => (
                    <div
                      key={contract.hash}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {contract.isVerified ? (
                          <CheckCircle2 className="text-green-500" size={20} />
                        ) : (
                          <XCircle className="text-gray-400" size={20} />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {contract.name || truncateAddress(contract.hash)}
                            </p>
                            {!contract.isVerified && contract.name && (
                              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                                Unverified
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(contract.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`https://soneium.blockscout.com/address/${contract.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
                      >
                        View <ExternalLink size={16} />
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {showContracts && stats.contractsCreated.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No contracts created by this wallet
                </div>
              )}
            </div>

            {/* Contracts Interacted */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Users className="text-blue-500 flex-shrink-0" size={24} />
                  <div>
                    <h2 className="text-xl font-semibold">Contracts Interacted</h2>
                    <p className="text-sm text-gray-600">
                      {stats.contractsInteracted.length} contracts 
                      ({stats.contractsInteracted.filter(c => c.isVerified).length} verified)
                    </p>
                  </div>
                </div>
                {stats.contractsInteracted.length > 0 && (
                  <button
                    onClick={() => setShowInteractions(!showInteractions)}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    {showInteractions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                )}
              </div>

              {showInteractions && stats.contractsInteracted.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contract
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Interactions
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.contractsInteracted.map((contract) => (
                        <tr key={contract.address} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {contract.isVerified ? (
                                <CheckCircle2 className="text-green-500 mr-2" size={16} />
                              ) : (
                                <XCircle className="text-gray-400 mr-2" size={16} />
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    {contract.name || truncateAddress(contract.address)}
                                  </span>
                                  {!contract.isVerified && contract.name && (
                                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                                      Unverified
                                    </span>
                                  )}
                                </div>
                                {contract.name && !contract.isVerified && (
                                  <span className="text-xs text-gray-500">
                                    {truncateAddress(contract.address)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              contract.isVerified 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {contract.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {contract.interactionCount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <a
                              href={`https://soneium.blockscout.com/address/${contract.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
                            >
                              View <ExternalLink size={16} />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {showInteractions && stats.contractsInteracted.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No contract interactions found
                </div>
              )}
            </div>

            {/* NFT Holdings */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Frame className="text-pink-500 flex-shrink-0" size={24} />
                  <div>
                    <h2 className="text-xl font-semibold">NFT Holdings</h2>
                    <p className="text-sm text-gray-600">
                      {nfts.reduce((total, collection) => total + parseInt(collection.amount), 0)} NFTs 
                      across {nfts.length} collections
                    </p>
                  </div>
                </div>
                {nfts.length > 0 && (
                  <button
                    onClick={() => setShowNFTs(!showNFTs)}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    {showNFTs ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                )}
              </div>

              {showNFTs && nfts.length > 0 && (
                <div className="space-y-6">
                  {nfts.map((collection) => (
                    <div
                      key={collection.token.address}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {collection.token.name} ({collection.token.symbol})
                          </h3>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                            <span>Type: {collection.token.type}</span>
                            <span>Holdings: {collection.amount}</span>
                            <span>Total Holders: {collection.token.holders}</span>
                            <span>Total Supply: {collection.token.total_supply || 'Unknown'}</span>
                          </div>
                        </div>
                        <a
                          href={`https://soneium.blockscout.com/token/${collection.token.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                        >
                          View Collection <ExternalLink size={16} />
                        </a>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {collection.token_instances?.map((instance) => (
                          <div
                            key={instance.token_id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            {instance.image_url ? (
                              <img
                                src={instance.image_url}
                                alt={instance.metadata?.name || 'NFT'}
                                className="w-full h-48 object-cover rounded-lg mb-4"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                                }}
                              />
                            ) : (
                              <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                <ImageIcon className="text-gray-400" size={48} />
                              </div>
                            )}
                            <h4 className="font-medium text-gray-900 mb-2">
                              {instance.metadata?.name || `Token #${instance.token_id}`}
                            </h4>
                            {instance.metadata?.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {instance.metadata.description}
                              </p>
                            )}
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-500">ID: {instance.token_id}</span>
                              <span className="text-purple-600">
                                {instance.token_type}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showNFTs && nfts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No NFTs found for this wallet
                </div>
              )}
            </div>

            {/* Token Holdings */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Coins className="text-yellow-500 flex-shrink-0" size={24} />
                  <div>
                    <h2 className="text-xl font-semibold">Token Holdings</h2>
                    <p className="text-sm text-gray-600">
                      {tokens.length} different tokens
                    </p>
                  </div>
                </div>
                {tokens.length > 0 && (
                  <button
                    onClick={() => setShowTokens(!showTokens)}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    {showTokens ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                )}
              </div>

              {showTokens && tokens.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Token
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balance
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          % of Supply
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Holders
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tokens.map((token) => {
                        const balance = parseFloat(token.value) / Math.pow(10, parseInt(token.token.decimals));
                        const totalSupply = parseFloat(token.token.total_supply) / Math.pow(10, parseInt(token.token.decimals));
                        const percentage = (balance / totalSupply) * 100;

                        return (
                          <tr key={token.token.address} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {token.token.icon_url && (
                                  <img 
                                    src={token.token.icon_url} 
                                    alt={token.token.name} 
                                    className="w-8 h-8 rounded-full mr-3"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = 'https://via.placeholder.com/32?text=T';
                                    }}
                                  />
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {token.token.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {token.token.symbol}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {balance.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-purple-600 font-medium">
                                {percentage.toFixed(6)}%
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {parseInt(token.token.holders).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <a
                                href={`https://soneium.blockscout.com/token/${token.token.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
                              >
                                View <ExternalLink size={16} />
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {showTokens && tokens.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No tokens found for this wallet
                </div>
              )}
            </div>

            {/* Share Section */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex flex-col items-center gap-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Share Your Stats</h3>
                  <p className="text-gray-600">Show off your Soneium Chain activity!</p>
                </div>
                
                <a
                  href={getTweetUrl(stats)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <Twitter size={20} />
                  <span className="font-medium">Share on X</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}