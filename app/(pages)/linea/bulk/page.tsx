'use client';

import React, { useState, useCallback } from 'react';
import { Loader2, ExternalLink, Twitter, Share2, Trophy, Wallet, CheckCircle2, XCircle, Users } from 'lucide-react';
import { fetchLineaStats } from '../../../../lib/linea';

interface WalletResult {
  address: string;
  lxpL: {
    xp: number;
    rank: number;
    alp: number;
    plp: number;
    ep: number;
    rp: number;
    vp: number;
    bp: number;
  };
  lxp: {
    balance: string;
    rank: number;
  };
  poh: {
    poh: boolean;
    isFlagged: boolean;
  };
  error?: string;
}

interface SummaryStats {
  totalWallets: number;
  totalLXP: number;
  totalLXPL: number;
  pohStats: {
    verified: number;
    notVerified: number;
    flagged: number;
    notFlagged: number;
  };
}

async function checkPOH(address: string): Promise<{ poh: boolean; isFlagged: boolean }> {
  try {
    const response = await fetch(`https://linea-xp-poh-api.linea.build/poh/${address.toLowerCase()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch POH status');
    }
    const data = await response.json();
    return {
      poh: data.poh || false,
      isFlagged: data.isFlagged || false
    };
  } catch (error) {
    console.error('Error checking POH:', error);
    return {
      poh: false,
      isFlagged: false
    };
  }
}

export default function LineaBulk() {
  const [addresses, setAddresses] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<WalletResult[]>([]);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>('');

  const calculateSummary = (results: WalletResult[]): SummaryStats => {
    return {
      totalWallets: results.length,
      totalLXP: results.reduce((sum, result) => sum + Number(result.lxp.balance) / 1e18, 0),
      totalLXPL: results.reduce((sum, result) => sum + result.lxpL.xp, 0),
      pohStats: {
        verified: results.filter(r => r.poh.poh).length,
        notVerified: results.filter(r => !r.poh.poh).length,
        flagged: results.filter(r => r.poh.isFlagged).length,
        notFlagged: results.filter(r => !r.poh.isFlagged).length,
      }
    };
  };

  const processAddress = useCallback(async (address: string): Promise<WalletResult> => {
    try {
      setCurrentAddress(address);
      const [stats, pohData] = await Promise.all([
        fetchLineaStats(address),
        checkPOH(address)
      ]);

      return {
        address,
        lxpL: stats.lxpL,
        lxp: stats.lxp,
        poh: pohData
      };
    } catch (error) {
      console.error(`Error processing address ${address}:`, error);
      return {
        address,
        lxpL: { xp: 0, rank: 0, alp: 0, plp: 0, ep: 0, rp: 0, vp: 0, bp: 0 },
        lxp: { balance: '0', rank: 0 },
        poh: { poh: false, isFlagged: false },
        error: 'Failed to fetch data'
      };
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addresses.trim() || loading) return;

    // Reset all state before starting new check
    setLoading(true);
    setResults([]);
    setSummary(null);
    setCurrentAddress('');
    
    const addressList = addresses
      .split('\n')
      .map(addr => addr.trim())
      .filter(addr => addr.length > 0 && addr.startsWith('0x'));

    if (addressList.length === 0) {
      setLoading(false);
      return;
    }

    const newResults: WalletResult[] = [];

    // Process addresses sequentially
    for (const address of addressList) {
      const result = await processAddress(address);
      newResults.push(result);
      setResults([...newResults]); // Update results after each address
    }

    // Calculate and set summary stats
    setSummary(calculateSummary(newResults));
    setCurrentAddress('');
    setLoading(false);
  };

  const getTweetUrl = () => {
    if (!summary) return '';
    
    const text = `🚀 Just checked ${summary.totalWallets} Linea wallets!\n\n` +
      `💫 Total LXP-L: ${summary.totalLXPL.toLocaleString()}\n` +
      `💰 Total LXP: ${summary.totalLXP.toLocaleString()}\n` +
      `✅ POH Verified: ${summary.pohStats.verified}\n\n` +
      `Check yours at cryptowalletsx.com/linea/bulk`;
    return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Linea Bulk Checker</h1>
          <p className="text-gray-600">Check multiple wallet stats, LXP-L rankings, and POH verification at once</p>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-purple-600" size={24} />
              <h2 className="text-xl font-semibold">Summary Statistics</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Wallets</p>
                <p className="text-xl font-semibold">{summary.totalWallets}</p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total LXP</p>
                <p className="text-xl font-semibold">{summary.totalLXP.toLocaleString()}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total LXP-L</p>
                <p className="text-xl font-semibold">{summary.totalLXPL.toLocaleString()}</p>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">POH Status</p>
                    <p className="font-medium">
                      ✅ {summary.pohStats.verified} Verified
                      <span className="text-red-500 ml-2">❌ {summary.pohStats.notVerified} Not Verified</span>
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">
                      🚫 {summary.pohStats.flagged} Flagged
                      <span className="text-green-500 ml-2">✓ {summary.pohStats.notFlagged} Not Flagged</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/2">
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="mb-4">
                <label htmlFor="addresses" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter wallet addresses (one per line)
                </label>
                <textarea
                  id="addresses"
                  rows={10}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  value={addresses}
                  onChange={(e) => setAddresses(e.target.value)}
                  placeholder="0x1234...&#10;0x5678...&#10;0x9abc..."
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !addresses.trim()}
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
                  'Check Stats'
                )}
              </button>
            </form>

            {summary && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-3 mb-4">
                    <Twitter size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Share Your Stats</h3>
                  <p className="text-gray-600 mb-6">Join the Linea community</p>
                  <a
                    href={getTweetUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Share2 size={20} />
                    <span className="font-medium">Share on X</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="w-full lg:w-1/2">
            {results.length > 0 && (
              <div className="bg-white rounded-xl shadow-md">
                <h2 className="text-xl font-semibold p-4 lg:p-6 border-b border-gray-100">Wallet Results</h2>
                <div className="divide-y divide-gray-100">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="p-4 lg:p-6"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900 break-all">
                            {result.address}
                          </p>
                          <a
                            href={`https://lineascan.build/address/${result.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700 flex-shrink-0"
                          >
                            <ExternalLink size={18} />
                          </a>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* LXP-L Stats */}
                          <div className="flex items-center gap-2">
                            <Trophy className="text-yellow-500 flex-shrink-0" size={20} />
                            <div>
                              <p className="text-sm text-gray-600">LXP-L</p>
                              <p className="font-medium">
                                {result.lxpL.xp.toLocaleString()} XP
                              </p>
                              <p className="text-sm text-purple-600">
                                Rank #{result.lxpL.rank.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* POH Status */}
                          <div className="flex items-center gap-2">
                            {result.poh.poh ? (
                              <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
                            ) : (
                              <XCircle className="text-red-500 flex-shrink-0" size={20} />
                            )}
                            <div>
                              <p className="text-sm text-gray-600">POH Status</p>
                              <p className="font-medium">
                                {result.poh.poh ? 'Verified' : 'Not Verified'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {result.poh.isFlagged ? (
                                  <span className="text-red-600">Flagged</span>
                                ) : (
                                  <span className="text-green-600">Not Flagged</span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* LXP Balance */}
                          <div className="flex items-center gap-2">
                            <Wallet className="text-purple-500 flex-shrink-0" size={20} />
                            <div>
                              <p className="text-sm text-gray-600">LXP Balance</p>
                              <p className="font-medium">
                                {Number(result.lxp.balance) / 1e18} LXP
                              </p>
                            </div>
                          </div>
                        </div>

                        {result.error && (
                          <p className="text-sm text-red-500 mt-2">{result.error}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}