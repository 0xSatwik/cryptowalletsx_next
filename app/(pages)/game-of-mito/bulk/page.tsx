'use client';

import React, { useState, useEffect } from 'react';

// Remove the CSV interface and update for API response
interface MitoApiResponse {
  success: boolean;
  data: {
    rank: number;
    address: string;
    mito_balance: number;
    wmito_balance: number;
    total_balance: number;
  };
  error?: string;
}

// Interface for the bulk wallet stats
interface WalletStats {
  address: string;
  rank: number;
  mito_balance: number;
  wmito_balance: number;
  total_balance: number;
  isLoading: boolean;
  error?: string;
}

// Interface for the summary
interface Summary {
  totalMito: number;
  totalWMito: number;
  totalBalance: number;
  walletCount: number;
}

// Remove the random API endpoint selection function and use the fixed endpoint
const getRandomApiEndpoint = (): string => {
  const endpoints = [
    'https://mito-api.customrpc.workers.dev',
    'https://mito-api.debrupos.workers.dev',
    'https://mito-api.walletsx.workers.dev'
  ];
  
  // Get a random index between 0 and 2
  const randomIndex = Math.floor(Math.random() * endpoints.length);
  
  return endpoints[randomIndex];
};

const MitosisBulkChecker: React.FC = () => {
  const [walletAddresses, setWalletAddresses] = useState<string>('');
  const [walletStats, setWalletStats] = useState<WalletStats[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalMito: 0,
    totalWMito: 0,
    totalBalance: 0,
    walletCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<React.ReactNode>('');
  
  // Update the fetchWalletData function to use the new API endpoint
  const fetchWalletData = async (walletAddress: string): Promise<WalletStats> => {
    try {
      const apiEndpoint = 'https://mitorank.vercel.app';
      console.log(`Using API endpoint for wallet ${walletAddress}: ${apiEndpoint}`);
      
      const response = await fetch(`${apiEndpoint}/api/query-holder?address=${walletAddress}`);
      const data = await response.json();
      
      if (!data.success) {
        return {
          address: walletAddress,
          rank: 0,
          mito_balance: 0,
          wmito_balance: 0,
          total_balance: 0,
          isLoading: false,
          error: data.error || "Wallet not found in rankings"
        };
      }
      
      return {
        address: walletAddress,
        rank: data.data.rank,
        mito_balance: data.data.mito_balance,
        wmito_balance: data.data.wmito_balance,
        total_balance: data.data.total_balance,
        isLoading: false
      };
    } catch (error) {
      console.error(`Error fetching data for wallet ${walletAddress}:`, error);
      return {
        address: walletAddress,
        rank: 0,
        mito_balance: 0,
        wmito_balance: 0,
        total_balance: 0,
        isLoading: false,
        error: "Error fetching data from API"
      };
    }
  };

  // Process all wallets and get their stats
  const processWallets = async () => {
    if (!walletAddresses.trim()) {
      setMessage("Please enter at least one wallet address");
      return;
    }

    setLoading(true);
    setMessage("Fetching data for all wallets...");
    
    // Parse wallet addresses (one per line)
    const addresses = walletAddresses
      .split('\n')
      .map(addr => addr.trim())
      .filter(addr => addr && addr.startsWith('0x'));
    
    if (addresses.length === 0) {
      setMessage("No valid wallet addresses found. Addresses should start with 0x");
      setLoading(false);
      return;
    }
    
    // Initialize wallet stats with loading state
    const initialStats = addresses.map(address => ({
      address,
      rank: 0,
      mito_balance: 0,
      wmito_balance: 0,
      total_balance: 0,
      isLoading: true
    }));
    
    setWalletStats(initialStats);

    try {
      // Process each wallet using the API
      const updatedStats = await Promise.all(
        addresses.map(async (address) => {
          return await fetchWalletData(address);
        })
      );
      
      setWalletStats(updatedStats);
      
      // Calculate summary
      const newSummary = updatedStats.reduce(
        (acc, wallet) => {
          return {
            totalMito: acc.totalMito + wallet.mito_balance,
            totalWMito: acc.totalWMito + wallet.wmito_balance,
            totalBalance: acc.totalBalance + wallet.total_balance,
            walletCount: acc.walletCount + (wallet.error ? 0 : 1)
          };
        },
        { totalMito: 0, totalWMito: 0, totalBalance: 0, walletCount: 0 }
      );
      
      setSummary(newSummary);
      setMessage("");
    } catch (error) {
      console.error("Error processing wallets:", error);
      setMessage(`Error: ${error instanceof Error ? error.message : "Failed to process wallets"}`);
    } finally {
      setLoading(false);
    }
  };

  // Create share text for Twitter
  const createShareText = () => {
    const shareText = `🚀 My #Mitosis portfolio summary:\n\n💰 Total $MITO: ${summary.totalMito.toLocaleString()}\n🔄 Total $wMITO: ${summary.totalWMito.toLocaleString()}\n💵 Combined balance: ${summary.totalBalance.toLocaleString()}\n\nWallets: ${summary.walletCount}\n\nCheck yours at cryptowalletsx.com/mitosis-bulk\n\n#MitosisL2 #Crypto #Web3 #Blockchain`;
    
    return encodeURIComponent(shareText);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-800 px-0 py-4 md:p-4">
      <div className="w-full md:max-w-4xl md:mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-900">Mitosis Bulk Wallet Checker</h1>
        
        <div className="flex justify-center mb-4">
          <a 
            href="/mitosisoverall" 
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
            </svg>
            Check a single wallet with Individual Checker
          </a>
        </div>
        
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">Enter Wallet Addresses</h2>
            <p className="text-gray-600 mb-4">Enter one wallet address per line to check multiple wallets at once.</p>
            
            <textarea
              value={walletAddresses}
              onChange={(e) => setWalletAddresses(e.target.value)}
              placeholder="Enter wallet addresses (one per line)&#10;0x...&#10;0x...&#10;0x..."
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm h-40"
              disabled={loading}
            />
            
            <div className="flex justify-between items-center mt-4">
              <div>
                <p className="text-xs text-gray-500">
                  Uses real-time blockchain data via Mitosis API
                </p>
              </div>
              <button
                onClick={processWallets}
                disabled={loading || !walletAddresses.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? 'Processing...' : 'Check Wallets'}
              </button>
            </div>
          </div>
          
          {message && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg">
              {message}
            </div>
          )}
        </div>

        {walletStats.length > 0 && (
          <div className="mt-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-900">Portfolio Summary</h2>
                
                <a 
                  href={`https://twitter.com/intent/tweet?text=${createShareText()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] hover:bg-[#0c8ad6] text-white rounded-lg transition-colors text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
                  </svg>
                  Share Portfolio
                </a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="text-gray-600 mb-1">Total MITO</div>
                  <div className="text-xl font-bold text-blue-900">
                    {summary.totalMito.toLocaleString()}
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="text-gray-600 mb-1">Total wMITO</div>
                  <div className="text-xl font-bold text-blue-900">
                    {summary.totalWMito.toLocaleString()}
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="text-gray-600 mb-1">Combined Balance</div>
                  <div className="text-xl font-bold text-blue-900">
                    {summary.totalBalance.toLocaleString()}
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="text-gray-600 mb-1">Wallets Found</div>
                  <div className="text-xl font-bold text-blue-900">
                    {summary.walletCount} / {walletStats.length}
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                      <th className="py-3 px-4 text-left border-r border-gray-200">Wallet Address</th>
                      <th className="py-3 px-4 text-center border-r border-gray-200">Rank</th>
                      <th className="py-3 px-4 text-right border-r border-gray-200">MITO Balance</th>
                      <th className="py-3 px-4 text-right border-r border-gray-200">wMITO Balance</th>
                      <th className="py-3 px-4 text-right">Total Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {walletStats.map((wallet, index) => (
                      <tr key={index} className={wallet.error ? "bg-red-50" : ""}>
                        <td className="py-3 px-4 font-mono text-sm truncate max-w-[150px] border-r border-gray-200">
                          <a 
                            href={`https://testnet.mitosiscan.xyz/address/${wallet.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center"
                          >
                            {wallet.address}
                            <svg className="h-3 w-3 ml-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                          {wallet.error && <div className="text-xs text-red-600 mt-1">{wallet.error}</div>}
                        </td>
                        <td className="py-3 px-4 text-center border-r border-gray-200">
                          {wallet.isLoading ? (
                            <span className="text-gray-400">Loading...</span>
                          ) : wallet.rank ? (
                            <span className="font-bold">#{wallet.rank}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right border-r border-gray-200">
                          {wallet.isLoading ? (
                            <span className="text-gray-400">Loading...</span>
                          ) : (
                            wallet.mito_balance.toLocaleString()
                          )}
                        </td>
                        <td className="py-3 px-4 text-right border-r border-gray-200">
                          {wallet.isLoading ? (
                            <span className="text-gray-400">Loading...</span>
                          ) : (
                            wallet.wmito_balance.toLocaleString()
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {wallet.isLoading ? (
                            <span className="text-gray-400">Loading...</span>
                          ) : (
                            wallet.total_balance.toLocaleString()
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MitosisBulkChecker; 