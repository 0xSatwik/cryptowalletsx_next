'use client';

import React, { useState, useRef } from 'react';

// Define a local interface that matches the actual data structure being used
interface MitosisRankData {
  address: string;
  rank: number;
  mito_balance: number | string;
  wmito_balance: number | string;
  total_balance: number | string;
  firstActivity?: string;
  transactionsCount?: number;
  erc20TransfersCount?: number;
  erc721TransfersCount?: number;
  erc20Holdings: any[];
  erc721Holdings: any[];
}

// Add distribution stats interface
interface MitosisDistributionStats {
  totalWallets: number;
  totalMito: number;
  totalWmito: number;
  totalCombined: number;
  wealthDistribution: {
    percentage: number;
    wallets: number;
    percentHolding: number;
    amount: number;
  }[];
  topWalletGroups: {
    count: number;
    percentHolding: number;
    amount: number;
    minBalance: number;
  }[];
  balanceThresholds: {
    threshold: number;
    wallets: number;
    percentWallets: number;
    percentSupply: number;
  }[];
}

export default function MitosisRankChecker() {
  const [address, setAddress] = useState('');
  const [rankData, setRankData] = useState<MitosisRankData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tokens' | 'nfts'>('overview');
  const [message, setMessage] = useState<React.ReactNode>('');

  // Distribution statistics - hardcoded based on the provided data
  const distributionStats: MitosisDistributionStats = {
    totalWallets: 245015,
    totalMito: 29740078.59,
    totalWmito: 1214759.69,
    totalCombined: 30954838.28,
    wealthDistribution: [
      { percentage: 1, wallets: 2450, percentHolding: 15.42, amount: 4774647.34 },
      { percentage: 5, wallets: 12250, percentHolding: 34.26, amount: 10603841.49 },
      { percentage: 10, wallets: 24501, percentHolding: 48.96, amount: 15155385.99 },
      { percentage: 20, wallets: 49003, percentHolding: 69.88, amount: 21631357.88 },
      { percentage: 30, wallets: 73504, percentHolding: 82.71, amount: 25602938.11 },
      { percentage: 50, wallets: 122507, percentHolding: 94.93, amount: 29385415.20 },
      { percentage: 80, wallets: 196012, percentHolding: 99.49, amount: 30798237.22 },
      { percentage: 90, wallets: 220513, percentHolding: 99.85, amount: 30908527.24 },
      { percentage: 95, wallets: 232764, percentHolding: 99.94, amount: 30936562.07 },
      { percentage: 99, wallets: 242564, percentHolding: 99.99, amount: 30952097.54 }
    ],
    topWalletGroups: [
      { count: 50, percentHolding: 1.93, amount: 598635.00, minBalance: 6900.64 },
      { count: 100, percentHolding: 2.82, amount: 874313.62, minBalance: 4780.96 },
      { count: 500, percentHolding: 6.78, amount: 2098844.24, minBalance: 2195.21 },
      { count: 1000, percentHolding: 9.77, amount: 3023605.80, minBalance: 1595.61 },
      { count: 5000, percentHolding: 21.83, amount: 6757152.26, minBalance: 661.11 },
      { count: 10000, percentHolding: 30.87, amount: 9555824.46, minBalance: 490.08 },
      { count: 20000, percentHolding: 44.06, amount: 13639373.89, minBalance: 353.07 },
      { count: 30000, percentHolding: 54.47, amount: 16862026.74, minBalance: 298.15 },
      { count: 50000, percentHolding: 70.53, amount: 21833181.73, minBalance: 200.71 },
      { count: 100000, percentHolding: 90.83, amount: 28117734.92, minBalance: 72.52 }
    ],
    balanceThresholds: [
      { threshold: 0, wallets: 245015, percentWallets: 100.00, percentSupply: 100.00 },
      { threshold: 10, wallets: 178771, percentWallets: 72.96, percentSupply: 99.05 },
      { threshold: 100, wallets: 83780, percentWallets: 34.19, percentSupply: 86.42 },
      { threshold: 500, wallets: 9585, percentWallets: 3.91, percentSupply: 30.21 },
      { threshold: 1000, wallets: 2303, percentWallets: 0.94, percentSupply: 14.96 },
      { threshold: 5000, wallets: 93, percentWallets: 0.04, percentSupply: 2.71 },
      { threshold: 10000, wallets: 28, percentWallets: 0.01, percentSupply: 1.35 }
    ]
  };

  const fetchRoutescanData = async (walletAddress: string) => {
    try {
      // Fetch address info
      const addressResponse = await fetch(
        `https://api.routescan.io/v2/network/testnet/evm/124832/addresses/${walletAddress}?limit=100`
      );
      
      if (!addressResponse.ok) {
        throw new Error('Failed to fetch address data from Routescan');
      }
      
      const addressData = await addressResponse.json();
      
      // Fetch ERC20 token holdings
      const tokensResponse = await fetch(
        `https://api.routescan.io/v2/network/testnet/evm/124832/address/${walletAddress}/erc20-holdings?limit=100`
      );
      
      if (!tokensResponse.ok) {
        throw new Error('Failed to fetch token holdings from Routescan');
      }
      
      const tokensData = await tokensResponse.json();
      
      // Fetch ERC721 NFT holdings
      const nftsResponse = await fetch(
        `https://api.routescan.io/v2/network/testnet/evm/124832/address/${walletAddress}/erc721-holdings?count=true&limit=100`
      );
      
      if (!nftsResponse.ok) {
        throw new Error('Failed to fetch NFT holdings from Routescan');
      }
      
      const nftsData = await nftsResponse.json();
      
      // Return all the data
      return {
        addressInfo: {
          firstActivity: addressData.firstActivity,
          transactionsCount: addressData.transactionsCount,
          erc20TransfersCount: addressData.erc20TransfersCount,
          erc721TransfersCount: addressData.erc721TransfersCount,
        },
        erc20Holdings: tokensData.items.map((item: any) => ({
          tokenAddress: item.tokenAddress,
          tokenName: item.tokenName,
          tokenSymbol: item.tokenSymbol,
          tokenDecimals: item.tokenDecimals,
          tokenQuantity: item.tokenQuantity,
          tokenValueInUsd: item.tokenValueInUsd,
        })),
        erc721Holdings: nftsData.items.map((item: any) => ({
          tokenAddress: item.tokenAddress,
          tokenId: item.tokenId,
          collectionName: item.collectionName,
          collectionSymbol: item.collectionSymbol,
        })),
      };
      
    } catch (error) {
      console.error('Error fetching data from Routescan:', error);
      throw new Error('Failed to fetch wallet data from Routescan');
    }
  };

  // Update fetchRankData to use the new API endpoint
  const fetchRankData = async (walletAddress: string) => {
    try {
      const apiEndpoint = 'https://mitorank.vercel.app';
      console.log(`Using API endpoint: ${apiEndpoint}`);
      
      const response = await fetch(`${apiEndpoint}/api/query-holder?address=${walletAddress}`);
      
      const data = await response.json();
      
      if (!data.success) {
        // Return the error information instead of throwing an error
        return { error: data.error || 'Unknown error', notFound: data.error === 'Wallet not found' };
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching rank data from API:', error);
      throw error;
    }
  };

  const checkRank = async () => {
    if (!address) {
      setMessage("Please enter a wallet address");
      return;
    }

    console.log(`Starting rank check for wallet: ${address}`);
    setMessage("Fetching data...");
    setLoading(true);
    setRankData(null);

    try {
      // Fetch rank data from API
      console.log("Fetching rank data from API...");
      const rankApiResponse = await fetchRankData(address);
      
      let walletNotFound = false;
      let rankApiData;
      
      // Check if we got an error response
      if (rankApiResponse && 'error' in rankApiResponse) {
        console.log(`API Error: ${rankApiResponse.error}`);
        walletNotFound = rankApiResponse.notFound || false;
        // We'll continue to try fetching Routescan data
      } else {
        rankApiData = rankApiResponse;
        console.log(`Found wallet rank data: ${JSON.stringify(rankApiData)}`);
      }
      
      // Initialize rankInfo with API data if available
      let rankInfo: MitosisRankData = {
        rank: rankApiData?.rank || 0,
        address: address,
        total_balance: rankApiData?.total_balance || 0,
        mito_balance: rankApiData?.mito_balance || 0,
        wmito_balance: rankApiData?.wmito_balance || 0,
        firstActivity: '',
        transactionsCount: 0,
        erc20TransfersCount: 0,
        erc721TransfersCount: 0,
        erc20Holdings: [],
        erc721Holdings: []
      };
      
      // Now fetch Routescan data for additional wallet information
      let routescanDataFetched = false;
      
      try {
        console.log("Fetching Routescan data...");
        const routescanData = await fetchRoutescanData(address);
        
        if (routescanData) {
          console.log("Routescan data received successfully");
          routescanDataFetched = true;
          
          rankInfo = {
            ...rankInfo,
            firstActivity: routescanData.addressInfo.firstActivity,
            transactionsCount: routescanData.addressInfo.transactionsCount,
            erc20TransfersCount: routescanData.addressInfo.erc20TransfersCount,
            erc721TransfersCount: routescanData.addressInfo.erc721TransfersCount,
            erc20Holdings: routescanData.erc20Holdings,
            erc721Holdings: routescanData.erc721Holdings
          };
        }
      } catch (routescanError) {
        console.error("Failed to get Routescan data:", routescanError);
      }
      
      // Set appropriate messages based on what data we have
      if (walletNotFound) {
        if (routescanDataFetched) {
          setMessage("This wallet is not in the Mitosis rankings, but we found some on-chain activity.");
          setRankData(rankInfo);
        } else {
          setMessage("This wallet has not participated in Mitosis activities.");
          // Don't set rankData as we have no data to show
        }
      } else if (rankApiData) {
        // We have rank data, so show it
        setRankData(rankInfo);
        setMessage("");
      } else {
        // Some other API error occurred
        if (routescanDataFetched) {
          setMessage("Failed to fetch ranking data, but found on-chain activity for this wallet.");
          setRankData(rankInfo);
        } else {
          setMessage("Failed to fetch any data for this wallet. Please try again later.");
        }
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage(`Error: ${error instanceof Error ? error.message : "Failed to fetch data"}`);
      setRankData(null);
    } finally {
      setLoading(false);
    }
  };

  // Add a helper function to convert wei to ether
  const formatTokenBalance = (quantity: string, decimals: number = 18): string => {
    try {
      // Convert from wei to ether (divide by 10^decimals)
      if (!quantity) return '0';
      
      const value = parseFloat(quantity) / Math.pow(10, decimals);
      
      // Format with appropriate number of decimal places based on token value
      if (value < 0.000001) {
        return value.toExponential(4);
      } else if (value < 0.01) {
        return value.toLocaleString(undefined, { maximumFractionDigits: 8 });
      } else {
        return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
      }
    } catch (error) {
      console.error("Error formatting token balance:", error);
      return quantity;
    }
  };

  // Helper function to create a simple bar for visualizing percentages
  const PercentageBar = ({ percent, color = 'bg-blue-500' }: { percent: number; color?: string }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
      <div className={`${color} h-2.5 rounded-full`} style={{ width: `${Math.min(100, percent)}%` }}></div>
    </div>
  );

  // Add new state variables for all wallets data
  const [allWallets, setAllWallets] = useState<Array<{
    rank: number;
    address: string;
    mito_balance: number;
    wmito_balance: number;
    total_balance: number;
  }>>([]);
  const [isLoadingAllWallets, setIsLoadingAllWallets] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalWallets, setTotalWallets] = useState(0);
  const allWalletsRef = useRef<HTMLDivElement>(null);
  const [allWalletsError, setAllWalletsError] = useState<string | null>(null);

  // Update fetchAllWallets to not use the random API endpoint
  const fetchAllWallets = async (page = 1) => {
    setIsLoadingAllWallets(true);
    setAllWalletsError(null);
    
    try {
      // For now, we'll keep using one of the previous endpoints for the all wallets endpoint
      // since we don't have a new endpoint for this functionality
      const apiEndpoint = 'https://mito-api.walletsx.workers.dev';
      console.log(`Using API endpoint for all wallets: ${apiEndpoint}`);
      
      const response = await fetch(`${apiEndpoint}/api/holders?page=${page}&limit=50`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch wallets data: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setAllWallets(data.data);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.pages);
        setTotalWallets(data.pagination.total);
      } else {
        throw new Error('Failed to fetch wallets data');
      }
    } catch (error) {
      console.error('Error fetching all wallets:', error);
      setAllWalletsError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoadingAllWallets(false);
    }
  };

  // Function to handle the "Check All Wallets" button click
  const handleCheckAllWallets = () => {
    fetchAllWallets(1);
    
    // Scroll to the all wallets section with a small delay to ensure it renders
    setTimeout(() => {
      if (allWalletsRef.current) {
        allWalletsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Functions to handle pagination
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchAllWallets(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchAllWallets(currentPage + 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchAllWallets(page);
    }
  };

  // Add a helper function to truncate wallet addresses
  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-800 px-0 py-4 md:p-4">
      <div className="w-full md:max-w-4xl md:mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-900">Mitosis Rank Checker</h1>
        
        <div className="flex justify-center mb-6 gap-4">
          <a 
            href="/mitosis/bulk" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg shadow-md flex items-center gap-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H5z"/>
              <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/>
            </svg>
            <span className="font-medium">Multi Checker</span>
          </a>
          
          <a 
            href="/mitosis" 
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg shadow-md flex items-center gap-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2z"/>
              <path fillRule="evenodd" d="M8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
            </svg>
            <span className="font-medium">Overall Stats</span>
          </a>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter wallet address (0x...)"
              className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              disabled={loading}
            />
            <button
              onClick={checkRank}
              disabled={loading || !address}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Loading...' : 'Check Rank'}
            </button>
          </div>
          
          {message && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg">
              {message}
            </div>
          )}
        </div>

        {/* Check All Wallets Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleCheckAllWallets}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white rounded-lg transition-colors shadow-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Check All Wallets
          </button>
        </div>

        {rankData && (
          <div className="mt-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-blue-900">Wallet Info</h2>
                
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `🚀 Just checked my #Mitosis wallet stats!\n\n💎 Rank: ${rankData.rank ? `#${rankData.rank}` : 'N/A'}\n💰 $MITO: ${rankData.mito_balance.toLocaleString()}\n🔄 $wMITO: ${rankData.wmito_balance.toLocaleString()}\n💵 Total: ${rankData.total_balance.toLocaleString()}\n\nCheck yours at cryptowalletsx.com/mitosis-rank\n\n#Mitosis #Crypto #Web3 #Blockchain`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] hover:bg-[#0c8ad6] text-white rounded-lg transition-colors text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
                  </svg>
                  Share on Twitter
                </a>
              </div>
              
              <div className="flex justify-between mb-6">
                <div className="text-sm">
                  <span className="text-gray-600">Address:</span>
                  <div className="font-mono bg-gray-50 px-3 py-1 rounded mt-1 break-all border border-gray-200">
                    {rankData.address}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-1 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="text-gray-600 mb-1">Rank</div>
                  <div className="text-xl font-bold text-blue-900">
                    {rankData.rank > 0 ? `#${rankData.rank}` : (loading ? 'Loading...' : 'Not in rankings')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {rankData.rank > 0 
                      ? 'According to $MITO Holdings' 
                      : (loading 
                          ? 'Checking rank...' 
                          : 'You are not in the ranking list, we are showing only top 245015'
                        )
                  }
                  </div>
                </div>
                
                <div className="flex-1 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="text-gray-600 mb-1">MITO Balance</div>
                  <div className="text-xl font-bold text-blue-900">
                    {Number(rankData.mito_balance) >= 0 ? Number(rankData.mito_balance).toLocaleString() : 'Not able to fetch'}
                  </div>
                </div>
                
                <div className="flex-1 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="text-gray-600 mb-1">wMITO Balance</div>
                  <div className="text-xl font-bold text-blue-900">
                    {Number(rankData.wmito_balance) >= 0 ? Number(rankData.wmito_balance).toLocaleString() : 'Not able to fetch'}
                  </div>
                </div>
                
                <div className="flex-1 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="text-gray-600 mb-1">Total Balance</div>
                  <div className="text-xl font-bold text-blue-900">
                    {Number(rankData.total_balance) >= 0 ? Number(rankData.total_balance).toLocaleString() : 'Not able to fetch'}
                  </div>
                </div>
              </div>
            
              <div className="flex border-b border-gray-200 mb-4">
                <button
                  className={`px-4 py-2 ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button
                  className={`px-4 py-2 ${activeTab === 'tokens' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('tokens')}
                >
                  Tokens
                </button>
                <button
                  className={`px-4 py-2 ${activeTab === 'nfts' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('nfts')}
                >
                  NFTs
                </button>
              </div>

              {/* Tab Content */}
              <div className={activeTab === 'overview' ? 'block' : 'hidden'}>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h2 className="text-xl font-semibold mb-4 text-blue-900">Wallet Overview</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="text-gray-600 mb-1">First Activity</div>
                      <div className="text-xl font-bold text-blue-900">
                        {rankData.firstActivity ? new Date(rankData.firstActivity).toLocaleDateString() : 'Not available'}
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="text-gray-600 mb-1">Transactions</div>
                      <div className="text-xl font-bold text-blue-900">
                        {rankData.transactionsCount !== undefined ? rankData.transactionsCount.toLocaleString() : 'Not available'}
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="text-gray-600 mb-1">Token Transfers</div>
                      <div className="text-xl font-bold text-blue-900">
                        {rankData.erc20TransfersCount !== undefined ? rankData.erc20TransfersCount.toLocaleString() : 'Not available'}
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="text-gray-600 mb-1">NFT Transfers</div>
                      <div className="text-xl font-bold text-blue-900">
                        {rankData.erc721TransfersCount !== undefined ? rankData.erc721TransfersCount.toLocaleString() : 'Not available'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={activeTab === 'tokens' ? 'block' : 'hidden'}>
                <h2 className="text-xl font-semibold mb-3 text-blue-900">Token Holdings</h2>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-50 text-gray-600 text-sm">
                      <tr>
                        <th className="py-2 px-4 text-left border-r border-gray-200">Token</th>
                        <th className="py-2 px-4 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {rankData.erc20Holdings && rankData.erc20Holdings.length > 0 ? (
                        rankData.erc20Holdings.map((token: any, i: number) => (
                          <tr key={i}>
                            <td className="py-3 px-4 border-r border-gray-200">
                              <a 
                                href={`https://testnet.mitosiscan.xyz/token/${token.tokenAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline flex items-center"
                              >
                                <div className="font-medium">{token.tokenName || 'Unknown'}</div>
                                <svg className="h-3 w-3 ml-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                              <div className="text-xs text-gray-500">{token.tokenSymbol}</div>
                            </td>
                            <td className="py-3 px-4 text-right font-medium whitespace-nowrap">
                              {formatTokenBalance(token.tokenQuantity, token.tokenDecimals)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="text-center text-gray-500 py-4">
                            No token holdings found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={activeTab === 'nfts' ? 'block' : 'hidden'}>
                <h2 className="text-xl font-semibold mb-3 text-blue-900">NFT Holdings</h2>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-50 text-gray-600 text-sm">
                      <tr>
                        <th className="py-2 px-4 text-left border-r border-gray-200">Collection</th>
                        <th className="py-2 px-4 text-left border-r border-gray-200">Token ID</th>
                        <th className="py-2 px-4 text-right">Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {rankData.erc721Holdings && rankData.erc721Holdings.length > 0 ? (
                        rankData.erc721Holdings.map((nft: any, i: number) => (
                          <tr key={i}>
                            <td className="py-3 px-4 font-medium border-r border-gray-200">
                              <a 
                                href={`https://testnet.mitosiscan.xyz/token/${nft.tokenAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline flex items-center"
                              >
                                {nft.collectionName || 'Unknown Collection'}
                                <svg className="h-3 w-3 ml-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </td>
                            <td className="py-3 px-4 font-mono text-sm truncate max-w-[150px] border-r border-gray-200">
                              <a 
                                href={`https://testnet.mitosiscan.xyz/token/${nft.tokenAddress}?a=${nft.tokenId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                {nft.tokenId}
                              </a>
                            </td>
                            <td className="py-3 px-4 text-right">
                              1
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="text-center text-gray-500 py-4">
                            No NFT holdings found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Add this section below the wallet results */}
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Mitosis Distribution Analysis Report</h2>
          
          {/* Analysis Report Section */}
          <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <h3 className="text-xl font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-4">ANALYSIS REPORT</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col justify-between">
                <div className="text-gray-500 text-sm">Total wallets analyzed</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">{distributionStats.totalWallets.toLocaleString()}</div>
                <div className="w-full bg-blue-100 h-1 mt-2"></div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col justify-between">
                <div className="text-gray-500 text-sm">Total MITO</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">{distributionStats.totalMito.toLocaleString()}</div>
                <div className="w-full bg-blue-100 h-1 mt-2"></div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col justify-between">
                <div className="text-gray-500 text-sm">Total wMITO</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">{distributionStats.totalWmito.toLocaleString()}</div>
                <div className="w-full bg-blue-100 h-1 mt-2"></div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col justify-between">
                <div className="text-gray-500 text-sm">Total combined balance</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">{distributionStats.totalCombined.toLocaleString()}</div>
                <div className="w-full bg-blue-100 h-1 mt-2"></div>
              </div>
            </div>
          </div>
          
          {/* Wealth Distribution Section */}
          <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <h3 className="text-xl font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-4">WEALTH DISTRIBUTION</h3>
            <div className="space-y-4">
              {distributionStats.wealthDistribution
                .filter(item => item.percentage <= 20)
                .map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex flex-wrap justify-between items-center mb-1 gap-2">
                      <div className="font-medium text-blue-800">
                        Top {item.percentage}% of wallets ({item.wallets.toLocaleString()} wallets)
                      </div>
                      <div className="font-bold text-blue-900">
                        {item.percentHolding.toFixed(2)}% of supply
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Hold {item.amount.toLocaleString()} $MITO
                    </div>
                    <PercentageBar percent={item.percentHolding} color="bg-blue-600" />
                  </div>
                ))}
            </div>
          </div>
          
          {/* Top Wallet Groups Section */}
          <div className="mb-8 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
            <h3 className="text-xl font-semibold text-green-800 border-b border-green-200 pb-2 mb-4">TOP WALLET GROUPS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {distributionStats.topWalletGroups.map((group, index) => (
                <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-medium text-green-800">
                      Top {group.count.toLocaleString()} wallets
                    </div>
                    <div className="font-bold text-green-900">
                      {group.percentHolding.toFixed(2)}% of supply
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    Hold {group.amount.toLocaleString()} $MITO
                  </div>
                  <div className="text-sm text-green-700 font-medium mb-2">
                    Min balance: {group.minBalance.toLocaleString()} $MITO
                  </div>
                  <PercentageBar percent={group.percentHolding} color="bg-green-600" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Balance Thresholds Section */}
          <div className="p-5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-100">
            <h3 className="text-xl font-semibold text-amber-800 border-b border-amber-200 pb-2 mb-4">BALANCE THRESHOLDS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {distributionStats.balanceThresholds.map((threshold, index) => (
                <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="font-medium text-amber-800 mb-1">
                    Wallets with {threshold.threshold}+ $MITO
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-bold text-amber-900">
                      {threshold.wallets.toLocaleString()} wallets
                    </div>
                    <div className="text-sm">
                      ({threshold.percentWallets.toFixed(2)}% of wallets)
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Control {threshold.percentSupply.toFixed(2)}% of supply
                  </div>
                  <PercentageBar percent={threshold.percentWallets} color="bg-amber-600" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* All Wallets Section */}
        <div ref={allWalletsRef} className="mt-12">
          {(allWallets.length > 0 || isLoadingAllWallets) && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">All Mitosis Wallets</h2>
              
              {allWalletsError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-800 rounded-lg">
                  Error: {allWalletsError}
                </div>
              )}
              
              <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div className="text-gray-600 mb-2 sm:mb-0">
                  Showing wallets {(currentPage - 1) * 50 + 1} - {Math.min(currentPage * 50, totalWallets)} of {totalWallets.toLocaleString()}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage <= 1 || isLoadingAllWallets}
                    className="px-3 py-1 bg-gray-100 border border-gray-300 rounded disabled:opacity-50 text-gray-700"
                  >
                    Previous
                  </button>
                  
                  <div className="text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages || isLoadingAllWallets}
                    className="px-3 py-1 bg-gray-100 border border-gray-300 rounded disabled:opacity-50 text-gray-700"
                  >
                    Next
                  </button>
                </div>
              </div>
              
              {isLoadingAllWallets ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">Rank</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 border-b">Address</th>
                        <th className="py-3 px-4 text-right text-sm font-medium text-gray-600 border-b">MITO Balance</th>
                        <th className="py-3 px-4 text-right text-sm font-medium text-gray-600 border-b">wMITO Balance</th>
                        <th className="py-3 px-4 text-right text-sm font-medium text-gray-600 border-b">Total Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {allWallets.map((wallet) => (
                        <tr key={wallet.rank} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-800 font-semibold">#{wallet.rank}</td>
                          <td className="py-3 px-4">
                            <a 
                              href={`https://testnet.mitosiscan.xyz/address/${wallet.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline font-mono text-sm break-all flex items-center"
                              title={wallet.address}
                            >
                              <span className="hidden md:inline">{wallet.address}</span>
                              <span className="md:hidden">{truncateAddress(wallet.address)}</span>
                              <svg className="h-3 w-3 ml-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </td>
                          <td className="py-3 px-4 text-right">{wallet.mito_balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                          <td className="py-3 px-4 text-right">{wallet.wmito_balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                          <td className="py-3 px-4 text-right font-medium">{wallet.total_balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination for larger datasets */}
              {totalPages > 5 && (
                <div className="flex justify-center mt-6">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1 || isLoadingAllWallets}
                      className="px-3 py-1 bg-gray-100 border border-gray-300 rounded disabled:opacity-50"
                    >
                      First
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around current page
                      let pageNum = 1;
                      if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      // Ensure page numbers are in valid range
                      pageNum = Math.max(1, Math.min(totalPages, pageNum));
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          disabled={isLoadingAllWallets}
                          className={`px-3 py-1 border rounded ${
                            currentPage === pageNum 
                              ? 'bg-blue-600 text-white border-blue-600' 
                              : 'bg-gray-100 border-gray-300 text-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages || isLoadingAllWallets}
                      className="px-3 py-1 bg-gray-100 border border-gray-300 rounded disabled:opacity-50"
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 