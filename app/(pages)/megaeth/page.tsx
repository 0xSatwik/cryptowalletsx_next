'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { ExternalLink, Eye, EyeOff, Info, Twitter, Share2, Award, Star, Shield, FileText, Activity, ArrowUp, Cpu, Zap, Wallet, Calendar } from 'lucide-react';
import { JsonRpcProvider, formatEther } from 'ethers';

// Constants for ThirdWeb API
const THIRDWEB_API_BASE_URL = 'https://insight.thirdweb.com/v1/wallets';

// Component for MegaETH Stats Checker
export default function MegaETHStatsChecker() {
  // State variables
  const [walletAddress, setWalletAddress] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreatedContracts, setShowCreatedContracts] = useState(false);
  const [showInteractedContracts, setShowInteractedContracts] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [walletScore, setWalletScore] = useState<WalletScore | null>(null);
  
  // ThirdWeb Client IDs - from environment variables
  const THIRDWEB_CLIENT_IDS = [
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID_1 || process.env.VITE_THIRDWEB_CLIENT_ID_1 || '',
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID_2 || process.env.VITE_THIRDWEB_CLIENT_ID_2 || '',
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID_3 || process.env.VITE_THIRDWEB_CLIENT_ID_3 || '',
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID_4 || process.env.VITE_THIRDWEB_CLIENT_ID_4 || '',
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID_5 || process.env.VITE_THIRDWEB_CLIENT_ID_5 || '',
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID_6 || process.env.VITE_THIRDWEB_CLIENT_ID_6 || '',
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID_7 || process.env.VITE_THIRDWEB_CLIENT_ID_7 || '',
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID_8 || process.env.VITE_THIRDWEB_CLIENT_ID_8 || '',
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID_9 || process.env.VITE_THIRDWEB_CLIENT_ID_9 || '',
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID_10 || process.env.VITE_THIRDWEB_CLIENT_ID_10 || '',
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID_11 || process.env.VITE_THIRDWEB_CLIENT_ID_11 || '',
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID_12 || process.env.VITE_THIRDWEB_CLIENT_ID_12 || '',
    // Skip 13 as per requirement
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID_14 || process.env.VITE_THIRDWEB_CLIENT_ID_14 || '',
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID_15 || process.env.VITE_THIRDWEB_CLIENT_ID_15 || '',
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID_16 || process.env.VITE_THIRDWEB_CLIENT_ID_16 || '',
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID_17 || process.env.VITE_THIRDWEB_CLIENT_ID_17 || '',
    // Legacy fallback
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || process.env.VITE_THIRDWEB_CLIENT_ID || '',
  ].filter(id => id !== '');

  // Function to get a random client ID
  const getRandomClientId = () => {
    const randomIndex = Math.floor(Math.random() * THIRDWEB_CLIENT_IDS.length);
    return THIRDWEB_CLIENT_IDS[randomIndex];
  };

  // New interface for wallet score
  interface WalletScore {
    totalScore: number;
    transactionsScore: number;
    contractCreationScore: number;
    contractInteractionScore: number;
    volumeScore: number;
    uniqueDaysScore: number;
    uniqueWeeksScore: number;
    uniqueMonthsScore: number;
    level: string;
  }

  // Interfaces
  interface Transaction {
    chain_id: string;
    hash: string;
    block_timestamp: number;
    from_address: string;
    to_address: string;
    value: string;
    gas_used: number;
    effective_gas_price: string;
    status: number;
    contract_address?: string;
  }

  interface TransactionResponse {
    meta: {
      page: number;
      total_items: number;
      limit_per_chain: number;
      chain_ids: string[];
    };
    data: Transaction[];
  }

  interface WalletData {
    address: string;
    balance: string;
    firstTransaction: Transaction | null;
    walletAge: string;
    firstTxDate: string;
    uniqueDays: Set<string>;
    uniqueWeeks: Set<string>;
    uniqueMonths: Set<string>;
    totalVolume: number;
    totalGasSpent: number;
    contractsCreated: Transaction[];
    contractsInteracted: Set<string>;
    allTransactions: Transaction[];
    contractInteractionCounts: Map<string, number>;
  }

  // Function to determine wallet level based on score
  const getWalletLevel = (score: number): string => {
    if (score >= 10000) return "Diamond";
    if (score >= 5000) return "Platinum";
    if (score >= 2500) return "Gold";
    if (score >= 1000) return "Silver";
    if (score >= 500) return "Bronze";
    if (score >= 100) return "Copper";
    return "Novice";
  };

  // Function to calculate wallet score
  const calculateWalletScore = (walletData: WalletData): WalletScore => {
    // Transactions score: 1 point per tx, max 10000
    const transactionsScore = Math.min(walletData.allTransactions.length, 10000);
    
    // Contract creation score: 5 points per contract, max 100
    const contractCreationScore = Math.min(walletData.contractsCreated.length * 5, 100);
    
    // Contract interaction score: 5 points per unique contract, max 5000
    const contractInteractionScore = Math.min(walletData.contractsInteracted.size * 5, 5000);
    
    // Volume score: 5 points per 100 native coin volume, max 5000
    const volumeScore = Math.min(Math.floor(walletData.totalVolume / 100) * 5, 5000);
    
    // Unique days score: 5 points per unique day, no limit
    const uniqueDaysScore = walletData.uniqueDays.size * 5;
    
    // Unique weeks score: 5 points per unique week, no limit
    const uniqueWeeksScore = walletData.uniqueWeeks.size * 5;
    
    // Unique months score: 5 points per unique month, no limit
    const uniqueMonthsScore = walletData.uniqueMonths.size * 5;
    
    // Total score
    const totalScore = transactionsScore + contractCreationScore + contractInteractionScore + 
                       volumeScore + uniqueDaysScore + uniqueWeeksScore + uniqueMonthsScore;
    
    // Determine level based on total score
    const level = getWalletLevel(totalScore);
    
    return {
      totalScore,
      transactionsScore,
      contractCreationScore,
      contractInteractionScore,
      volumeScore,
      uniqueDaysScore,
      uniqueWeeksScore,
      uniqueMonthsScore,
      level
    };
  };

  // Function to validate Ethereum address
  const isValidEthAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // Handle wallet address input change
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value.trim();
    setWalletAddress(address);
    setIsValidAddress(address === '' || isValidEthAddress(address));
  };

  // Function to fetch first transaction (wallet age)
  const fetchFirstTransaction = async (address: string): Promise<Transaction | null> => {
    try {
      const clientId = getRandomClientId();
      const url = `${THIRDWEB_API_BASE_URL}/${address}/transactions?chain=6342&filter_block_timestamp_gte=1738308200&sort_order=asc&limit=1&page=1&clientId=${clientId}`;
      
      const response = await fetch(url);
      
      if (response.status === 404 || response.status === 503) {
        // Try again with another client ID
        const newClientId = getRandomClientId();
        const retryUrl = `${THIRDWEB_API_BASE_URL}/${address}/transactions?chain=6342&filter_block_timestamp_gte=1738308200&sort_order=asc&limit=1&page=1&clientId=${newClientId}`;
        const retryResponse = await fetch(retryUrl);
        
        if (!retryResponse.ok) {
          console.error(`Failed to fetch first transaction after retry: ${retryResponse.status}`);
          return null;
        }
        
        const retryData = await retryResponse.json();
        return retryData.data && retryData.data.length > 0 ? retryData.data[0] : null;
      }
      
      if (!response.ok) {
        console.error(`Failed to fetch first transaction: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      return data.data && data.data.length > 0 ? data.data[0] : null;
    } catch (error) {
      console.error('Error fetching first transaction:', error);
      return null;
    }
  };

  // Function to check total transaction count - new helper function
  const fetchTransactionCount = async (address: string): Promise<number> => {
    try {
      const clientId = getRandomClientId();
      const url = `${THIRDWEB_API_BASE_URL}/${address}/transactions?chain=6342&filter_block_timestamp_gte=1738308200&sort_order=desc&limit=1&page=1&clientId=${clientId}`;
      
      const response = await fetch(url);
      
      if (response.status === 404 || response.status === 503) {
        // Try again with another client ID
        const newClientId = getRandomClientId();
        const retryUrl = `${THIRDWEB_API_BASE_URL}/${address}/transactions?chain=6342&filter_block_timestamp_gte=1738308200&sort_order=desc&limit=1&page=1&clientId=${newClientId}`;
        const retryResponse = await fetch(retryUrl);
        
        if (!retryResponse.ok) {
          console.error(`Failed to fetch transaction count after retry: ${retryResponse.status}`);
          return 0;
        }
        
        const retryData = await retryResponse.json();
        return retryData.meta?.total_items || 0;
      }
      
      if (!response.ok) {
        console.error(`Failed to fetch transaction count: ${response.status}`);
        return 0;
      }
      
      const data = await response.json();
      return data.meta?.total_items || 0;
    } catch (error) {
      console.error('Error fetching transaction count:', error);
      return 0;
    }
  };

  // Function to fetch all transactions with parallel requests
  const fetchAllTransactions = async (address: string): Promise<Transaction[]> => {
    try {
      // First, fetch the total transaction count to determine pages
      const totalTxCount = await fetchTransactionCount(address);
      console.log(`Total transactions: ${totalTxCount}`);
      
      // Determine how many pages we need to fetch (max 6 pages = 3,000 transactions)
      const pageSize = 500;
      const maxPages = 6;
      const pagesToFetch = Math.min(Math.ceil(totalTxCount / pageSize), maxPages);
      
      // Create arrays for parallel requests
      const pagePromises: Promise<TransactionResponse>[] = [];
      const clientIds: string[] = [];
      
      // Generate promises for each page request
      for (let page = 1; page <= pagesToFetch; page++) {
        const clientId = getRandomClientId();
        clientIds.push(clientId);
        
        const url = `${THIRDWEB_API_BASE_URL}/${address}/transactions?chain=6342&filter_block_timestamp_gte=1738308200&sort_order=desc&limit=${pageSize}&page=${page}&clientId=${clientId}`;
        
        const pagePromise = fetch(url)
          .then(response => {
            if (response.status === 404 || response.status === 503) {
              // Try again with another client ID
              const newClientId = getRandomClientId();
              const retryUrl = `${THIRDWEB_API_BASE_URL}/${address}/transactions?chain=6342&filter_block_timestamp_gte=1738308200&sort_order=desc&limit=${pageSize}&page=${page}&clientId=${newClientId}`;
              return fetch(retryUrl);
            }
            return response;
          })
          .then(response => {
            if (!response.ok) {
              console.error(`Failed to fetch transactions for page ${page}: ${response.status}`);
              return { meta: { page: 0, total_items: 0, limit_per_chain: 0, chain_ids: [] }, data: [] } as TransactionResponse;
            }
            return response.json();
          })
          .catch(error => {
            console.error(`Error fetching transactions for page ${page}:`, error);
            return { meta: { page: 0, total_items: 0, limit_per_chain: 0, chain_ids: [] }, data: [] } as TransactionResponse;
          });
        
        pagePromises.push(pagePromise);
      }
      
      // Wait for all page requests to complete in parallel
      const pageResults = await Promise.all(pagePromises);
      
      // Combine transaction data from all pages
      const allTransactions: Transaction[] = [];
      for (const pageResult of pageResults) {
        if (pageResult.data && Array.isArray(pageResult.data)) {
          allTransactions.push(...pageResult.data);
        }
      }
      
      console.log(`Fetched ${allTransactions.length} transactions from ${pagesToFetch} pages`);
      return allTransactions;
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      return [];
    }
  };

  // Process all transactions to extract stats
  const processTransactions = (transactions: Transaction[], address: string): Partial<WalletData> => {
    const uniqueDays = new Set<string>();
    const uniqueWeeks = new Set<string>();
    const uniqueMonths = new Set<string>();
    const contractsInteracted = new Set<string>();
    const contractsCreated: Transaction[] = [];
    
    // New map to track contract interactions count
    const contractInteractionCounts = new Map<string, number>();
    
    let totalVolume = 0;
    let totalGasSpent = 0;
    
    transactions.forEach(tx => {
      const date = new Date(tx.block_timestamp * 1000);
      
      // Unique days
      uniqueDays.add(date.toISOString().split('T')[0]);
      
      // Unique weeks (using ISO week)
      const year = date.getFullYear();
      const month = date.getMonth();
      const weekNum = Math.floor(date.getDate() / 7);
      uniqueWeeks.add(`${year}-${month}-${weekNum}`);
      
      // Unique months
      uniqueMonths.add(`${year}-${month}`);
      
      // Calculate volume (excluding transactions to self)
      if (tx.from_address.toLowerCase() === address.toLowerCase() && 
          tx.to_address.toLowerCase() !== address.toLowerCase()) {
        totalVolume += Number(tx.value) / 1e18; // Convert to ETH
      }
      
      // Calculate gas spent
      if (tx.from_address.toLowerCase() === address.toLowerCase()) {
        const gasSpent = (Number(tx.gas_used) * Number(tx.effective_gas_price)) / 1e18;
        totalGasSpent += gasSpent;
      }
      
      // Track contract interactions with counts
      if (tx.to_address) {
        const contractAddress = tx.to_address.toLowerCase();
        contractsInteracted.add(contractAddress);
        
        // Increment interaction count
        const currentCount = contractInteractionCounts.get(contractAddress) || 0;
        contractInteractionCounts.set(contractAddress, currentCount + 1);
      }
      
      // Identify contract creations (to_address is null or empty)
      if (tx.from_address.toLowerCase() === address.toLowerCase() && 
          (!tx.to_address || tx.to_address === '0x')) {
        contractsCreated.push(tx);
      }
    });
    
    return {
      uniqueDays,
      uniqueWeeks,
      uniqueMonths,
      totalVolume,
      totalGasSpent,
      contractsCreated,
      contractsInteracted,
      contractInteractionCounts,
    };
  };

  // Main function to fetch wallet data
  const fetchWalletData = async () => {
    if (!isValidAddress || !walletAddress) {
      setError('Please enter a valid Ethereum address');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setWalletData(null);
    setWalletScore(null);
    
    try {
      // Run these requests in parallel using Promise.all
      const [balance, firstTx, allTransactions] = await Promise.all([
        // Get native balance from Ethereum RPC
        (async () => {
          const provider = new JsonRpcProvider('https://carrot.megaeth.com/rpc');
          return provider.getBalance(walletAddress);
        })(),
        
        // Fetch first transaction for wallet age
        fetchFirstTransaction(walletAddress),
        
        // Fetch all transactions
        fetchAllTransactions(walletAddress)
      ]);
      
      // Calculate wallet age and exact first transaction date
      let walletAge = 'Unknown';
      let firstTxDate = '';
      if (firstTx) {
        const firstTxTimestamp = new Date(firstTx.block_timestamp * 1000);
        walletAge = formatDistanceToNow(firstTxTimestamp, { addSuffix: true });
        firstTxDate = format(firstTxTimestamp, 'PPpp'); // Format: 'Apr 29, 2023, 2:15:30 PM'
      }
      
      // Process transactions for stats
      const processedData = processTransactions(allTransactions, walletAddress);
      
      // Set complete wallet data
      const fullWalletData = {
        address: walletAddress,
        balance: formatEther(balance),
        firstTransaction: firstTx,
        walletAge,
        firstTxDate,
        allTransactions,
        ...processedData,
      } as WalletData;
      
      setWalletData(fullWalletData);
      
      // Calculate and set wallet score
      const score = calculateWalletScore(fullWalletData);
      setWalletScore(score);
      
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setError('Failed to fetch wallet data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWalletData();
  };

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Format ETH value
  const formatEth = (value: string | number) => {
    const num = typeof value === 'string' ? value : value.toString();
    try {
      // For small values, use direct division instead of formatEther
      if (num === '0' || num === '1') {
        return (Number(num) / 1e18).toFixed(6) + ' MEGA';
      }
      
      return parseFloat(formatEther(num)).toFixed(6) + ' MEGA';
    } catch (e) {
      // Fallback to manual conversion if formatEther fails
      return (Number(num) / 1e18).toFixed(6) + ' MEGA';
    }
  };

  // Generate Twitter share text
  const generateTwitterShareText = () => {
    if (!walletData || !walletScore) return '';
    
    const lines = [
      `🔍 My #MegaETH Wallet Stats:`,
      `💰 Balance: ${parseFloat(walletData.balance).toFixed(4)} ETH`,
      `🏆 Wallet SCORE: ${walletScore.totalScore}`,
      `🧠 Activity: ${walletData.uniqueDays.size} days | ${walletData.uniqueWeeks.size} weeks | ${walletData.uniqueMonths.size} months`,
      `📊 Transactions: ${walletData.allTransactions.length}`,
      `\nCheck your stats at cryptowalletsx.com/megaeth`
    ];
    
    return encodeURIComponent(lines.join('\n'));
  };

  // Share on Twitter function
  const shareOnTwitter = () => {
    const shareText = generateTwitterShareText();
    window.open(`https://twitter.com/intent/tweet?text=${shareText}`, '_blank');
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col space-y-8">
        {/* Glassmorphism Header */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('/images/megaeth-bg.jpg')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
          <div className="relative px-6 py-12 sm:px-10 sm:py-16 text-center">
            <div className="animate-float">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg mb-4 tracking-tight">
                MegaETH Stats Explorer
          </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 mx-auto my-4 rounded-full"></div>
              <p className="mt-6 text-xl text-white/90 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-md">
                Explore detailed wallet analytics, transaction history, and calculate your MegaETH wallet score.
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Search Form */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-blue-100 dark:border-blue-900/20 transform transition-all duration-300 hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-1">
            <div className="bg-white dark:bg-gray-800 p-5 sm:p-7">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="walletAddress" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enter Wallet Address to Analyze
                  </label>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Cpu className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                        id="walletAddress"
                        value={walletAddress}
                        onChange={handleAddressChange}
                        placeholder="0x..."
                        className={`pl-10 w-full py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                          !isValidAddress ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                        }`}
                      />
                      {walletAddress && (
                        <button
                          type="button"
                          onClick={() => setWalletAddress('')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
              </div>
              <button
                type="submit"
                      disabled={!isValidAddress || !walletAddress || isLoading}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center"
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Analyzing...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Zap className="mr-2 h-5 w-5" />
                          Analyze Wallet
                        </span>
                      )}
              </button>
                  </div>
                  {!isValidAddress && walletAddress && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Please enter a valid Ethereum address
                    </p>
                  )}
            </div>

                <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Analyze any wallet on MegaETH network and get detailed insights.
                </div>
              </form>
                </div>
              </div>
              </div>
          
        {/* Error Alert */}
          {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-5 text-red-700 dark:text-red-300 shadow-sm">
              <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              <p className="font-medium">{error}</p>
              </div>
            </div>
          )}

        {/* Enhanced Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 flex flex-col justify-center items-center min-h-[300px] border border-blue-100 dark:border-blue-900/20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-100 dark:border-blue-800/50 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-t-blue-600 dark:border-t-blue-400 animate-spin rounded-full absolute top-0 left-0"></div>
        </div>
            <div className="mt-6 text-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">Analyzing Wallet Data</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Fetching transactions and calculating metrics...
              </p>
              
              <div className="mt-6 space-y-2">
                <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                </div>
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ml-4">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                </div>
                <div className="w-40 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ml-2">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {walletData && walletScore && !isLoading && (
          <div className="space-y-8">
            {/* Wallet Score Card */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-8 sm:p-10">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="mb-6 md:mb-0">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center">
                      <Award className="h-8 w-8 mr-3" />
                      Wallet Score: <span className="ml-2 text-yellow-300">{walletScore.totalScore.toLocaleString()}</span>
                    </h2>
                    <p className="mt-3 text-blue-100">This score reflects your activity and engagement on MegaETH network</p>
                    </div>
                  <button
                    onClick={shareOnTwitter}
                    className="flex items-center px-6 py-4 bg-white text-blue-600 rounded-xl shadow-lg hover:shadow-xl font-bold transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <Twitter className="h-5 w-5 mr-2" />
                    Share Score on Twitter
                  </button>
                  </div>
                  
                {/* Score Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center mb-2">
                      <Activity className="h-5 w-5 text-blue-200 mr-2" />
                      <h3 className="text-sm text-blue-100 font-medium">Transactions</h3>
                    </div>
                    <p className="text-xl font-bold text-white">{walletScore.transactionsScore.toLocaleString()} pts</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center mb-2">
                      <FileText className="h-5 w-5 text-blue-200 mr-2" />
                      <h3 className="text-sm text-blue-100 font-medium">Contracts</h3>
                    </div>
                    <p className="text-xl font-bold text-white">{(walletScore.contractCreationScore + walletScore.contractInteractionScore).toLocaleString()} pts</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center mb-2">
                      <ArrowUp className="h-5 w-5 text-blue-200 mr-2" />
                      <h3 className="text-sm text-blue-100 font-medium">Volume</h3>
                    </div>
                    <p className="text-xl font-bold text-white">{walletScore.volumeScore.toLocaleString()} pts</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center mb-2">
                      <Shield className="h-5 w-5 text-blue-200 mr-2" />
                      <h3 className="text-sm text-blue-100 font-medium">Activity</h3>
                    </div>
                    <p className="text-xl font-bold text-white">{(walletScore.uniqueDaysScore + walletScore.uniqueWeeksScore + walletScore.uniqueMonthsScore).toLocaleString()} pts</p>
                  </div>
                </div>
                  </div>
                </div>
                
            {/* Enhanced Wallet Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-blue-100 dark:border-blue-900/20">
              <div className="relative">
                {/* Decorative gradient background with pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5"></div>
                <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5"></div>
                
                {/* Main content with relative positioning */}
                <div className="relative px-6 py-8 sm:p-10">
                  <div className="flex flex-col md:flex-row md:items-start justify-between mb-8">
                    <div>
                      <div className="flex items-center mb-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-800/30 rounded-lg mr-4 shadow-sm">
                          <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                            Wallet Overview
                            <a
                              href={`https://www.megaexplorer.xyz/address/${walletData.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                              className="ml-2 text-blue-500 hover:text-blue-600 dark:text-blue-400"
                        >
                              <ExternalLink size={18} />
                        </a>
                          </h2>
                          <div className="h-1 w-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mt-2"></div>
                      </div>
                      </div>
                      <div className="flex items-center mt-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-2 border border-blue-100 dark:border-blue-800/20">
                        <div className="mr-2 text-blue-700 dark:text-blue-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-1l1-1 1-1-1-1H3a1 1 0 01-1-1V7a1 1 0 011-1h4L7 5l-1-1V3h1l1 1 1 1 1-1a6 6 0 017.743 5.743L18 8z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-blue-700 dark:text-blue-300 text-sm font-medium break-all font-mono">
                          {walletData.address}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={shareOnTwitter}
                      className="mt-4 md:mt-0 flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-colors shadow-md hover:shadow-lg"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Stats
                    </button>
                    </div>
                    
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Balance Card */}
                    <div className="relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-75 group-hover:opacity-85 transition-opacity rounded-xl"></div>
                      <div className="absolute inset-0 bg-[url('/images/coin-pattern.svg')] bg-repeat opacity-10"></div>
                      <div className="relative p-6 flex flex-col items-center text-center">
                        <div className="p-4 bg-white rounded-full shadow-lg mb-4">
                          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                      </div>
                        <h3 className="text-lg font-bold text-white mb-1">Balance</h3>
                        <p className="text-3xl font-extrabold text-white drop-shadow-md">
                          {parseFloat(walletData.balance).toFixed(6)}
                        </p>
                        <p className="text-blue-100 mt-1">ETH</p>
                      </div>
                    </div>
                    
                    {/* Wallet Age Card */}
                    <div className="relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-75 group-hover:opacity-85 transition-opacity rounded-xl"></div>
                      <div className="absolute inset-0 bg-[url('/images/time-pattern.svg')] bg-repeat opacity-10"></div>
                      <div className="relative p-6 flex flex-col items-center text-center">
                        <div className="p-4 bg-white rounded-full shadow-lg mb-4">
                          <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Wallet Age</h3>
                        <p className="text-2xl font-extrabold text-white drop-shadow-md">
                          {walletData.walletAge}
                        </p>
                        
                        {walletData.firstTransaction && (
                          <div className="mt-2 text-sm text-white/90 pt-2 border-t border-white/20">
                            <span className="font-medium">First transaction:</span>
                            <div className="flex items-center justify-center mt-1">
                              <span className="font-mono text-white/80">{walletData.firstTxDate}</span>
                              <a
                                href={`https://www.megaexplorer.xyz/tx/${walletData.firstTransaction.hash}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                                className="ml-2 text-white/90 hover:text-white inline-flex items-center"
                        >
                                <ExternalLink size={14} />
                        </a>
                    </div>
                          </div>
                        )}
                  </div>
                </div>
                
                    {/* Transactions Card */}
                    <div className="relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-75 group-hover:opacity-85 transition-opacity rounded-xl"></div>
                      <div className="absolute inset-0 bg-[url('/images/transaction-pattern.svg')] bg-repeat opacity-10"></div>
                      <div className="relative p-6 flex flex-col items-center text-center">
                        <div className="p-4 bg-white rounded-full shadow-lg mb-4">
                          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                          </svg>
                    </div>
                        <h3 className="text-lg font-bold text-white mb-1">Transactions</h3>
                        <p className="text-3xl font-extrabold text-white drop-shadow-md">
                          {walletData.allTransactions.length.toLocaleString()}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-white/90 text-sm">Total Operations</span>
                    </div>
                  </div>
                    </div>
                  </div>
                    </div>
                  </div>
                </div>

            {/* Enhanced Activity Stats Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-blue-100 dark:border-blue-900/20">
              <div className="px-6 py-8 sm:p-10">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">Activity Statistics</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('/images/calendar-bg.svg')] opacity-5"></div>
                    <div className="relative p-6">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400">Unique Days</h3>
                        <div className="bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded-md">
                          {walletScore.uniqueDaysScore} pts
                    </div>
                      </div>
                      <div className="text-4xl font-extrabold text-blue-900 dark:text-blue-100">
                        {walletData.uniqueDays.size.toLocaleString()}
                      </div>
                      <p className="mt-2 text-sm text-blue-600 dark:text-blue-300">
                        Days with on-chain activity
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('/images/calendar-bg.svg')] opacity-5"></div>
                    <div className="relative p-6">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-bold text-purple-700 dark:text-purple-400">Unique Weeks</h3>
                        <div className="bg-purple-100 dark:bg-purple-800/50 text-purple-700 dark:text-purple-300 text-xs font-bold px-2 py-1 rounded-md">
                          {walletScore.uniqueWeeksScore} pts
                    </div>
                      </div>
                      <div className="text-4xl font-extrabold text-purple-900 dark:text-purple-100">
                        {walletData.uniqueWeeks.size.toLocaleString()}
                      </div>
                      <p className="mt-2 text-sm text-purple-600 dark:text-purple-300">
                        Weeks with on-chain activity
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('/images/calendar-bg.svg')] opacity-5"></div>
                    <div className="relative p-6">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-bold text-pink-700 dark:text-pink-400">Unique Months</h3>
                        <div className="bg-pink-100 dark:bg-pink-800/50 text-pink-700 dark:text-pink-300 text-xs font-bold px-2 py-1 rounded-md">
                          {walletScore.uniqueMonthsScore} pts
                    </div>
                    </div>
                      <div className="text-4xl font-extrabold text-pink-900 dark:text-pink-100">
                        {walletData.uniqueMonths.size.toLocaleString()}
                  </div>
                      <p className="mt-2 text-sm text-pink-600 dark:text-pink-300">
                        Months with on-chain activity
                      </p>
                    </div>
                    </div>
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('/images/graph-bg.svg')] opacity-5"></div>
                    <div className="relative p-6">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-bold text-green-700 dark:text-green-400">Total Volume</h3>
                        <div className="bg-green-100 dark:bg-green-800/50 text-green-700 dark:text-green-300 text-xs font-bold px-2 py-1 rounded-md">
                          {walletScore.volumeScore} pts
                    </div>
                    </div>
                      <div className="text-4xl font-extrabold text-green-900 dark:text-green-100">
                        {walletData.totalVolume.toFixed(6)} ETH
                  </div>
                      <p className="mt-2 text-sm text-green-600 dark:text-green-300">
                        Total on-chain volume
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('/images/gas-bg.svg')] opacity-5"></div>
                    <div className="relative p-6">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-bold text-amber-700 dark:text-amber-400">Gas Spent</h3>
                        <div className="bg-amber-100 dark:bg-amber-800/50 text-amber-700 dark:text-amber-300 text-xs font-bold px-2 py-1 rounded-md">
                          Network Support
                    </div>
                  </div>
                      <div className="text-4xl font-extrabold text-amber-900 dark:text-amber-100">
                        {walletData.totalGasSpent.toFixed(6)} ETH
                </div>
                      <p className="mt-2 text-sm text-amber-600 dark:text-amber-300">
                        Total gas fees paid
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contracts Created - Enhanced UI */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-blue-100 dark:border-blue-900/20">
              <div className="px-6 py-8 sm:p-10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 dark:bg-purple-800/30 rounded-lg mr-4">
                      <Cpu className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Contracts Created
                      </h2>
                      <div className="mt-1 flex items-center">
                        <span className="text-gray-500 dark:text-gray-400">{walletData.contractsCreated?.length || 0} contracts</span>
                        <div className="ml-3 bg-purple-100 dark:bg-purple-800/30 text-purple-700 dark:text-purple-300 text-xs font-bold px-2 py-1 rounded-md">
                          {walletScore.contractCreationScore} pts
                        </div>
                      </div>
                  </div>
                </div>
                <button
                    onClick={() => setShowCreatedContracts(!showCreatedContracts)}
                    className="bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-800/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-lg flex items-center font-medium transition-colors"
                  >
                    {showCreatedContracts ? (
                      <>
                        Hide <EyeOff size={16} className="ml-2" />
                      </>
                    ) : (
                      <>
                        Show <Eye size={16} className="ml-2" />
                      </>
                    )}
                </button>
              </div>

                {showCreatedContracts && walletData.contractsCreated && walletData.contractsCreated.length > 0 ? (
                  <div className="border border-purple-100 dark:border-purple-800/20 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-purple-50 dark:bg-purple-900/20">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                              Transaction Hash
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                              Creation Date
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                              Contract Address
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                              Action
                            </th>
                      </tr>
                    </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-purple-100 dark:divide-purple-800/20">
                          {walletData.contractsCreated.map((tx, index) => (
                            <tr key={index} className="hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {formatAddress(tx.hash)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                                  {format(new Date(tx.block_timestamp * 1000), 'PPp')}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {tx.contract_address ? (
                                  <a
                                    href={`https://www.megaexplorer.xyz/address/${tx.contract_address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline inline-flex items-center"
                            >
                                    {formatAddress(tx.contract_address)}
                                    <ExternalLink size={12} className="ml-1" />
                            </a>
                                ) : (
                                  <span className="text-amber-500">Not available</span>
                                )}
                          </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <a
                                  href={`https://www.megaexplorer.xyz/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline inline-flex items-center"
                            >
                                  View <ExternalLink size={14} className="ml-1" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                  </div>
                ) : showCreatedContracts && (!walletData.contractsCreated || walletData.contractsCreated.length === 0) ? (
                  <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-8 text-center border border-purple-100 dark:border-purple-800/20">
                    <div className="inline-block p-4 bg-white dark:bg-gray-700 rounded-full mb-4 shadow-sm">
                      <Cpu className="h-8 w-8 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No Contracts Created</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      This wallet hasn't created any smart contracts on the MegaETH network.
                    </p>
                </div>
              ) : null}
              </div>
            </div>
            
            {/* Contracts Interacted - Enhanced UI */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-blue-100 dark:border-blue-900/20">
              <div className="px-6 py-8 sm:p-10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-800/30 rounded-lg mr-4">
                      <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                  </div>
                  <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Contracts Interacted
                      </h2>
                      <div className="mt-1 flex items-center">
                        <span className="text-gray-500 dark:text-gray-400">{walletData.contractsInteracted?.size || 0} unique contracts</span>
                        <div className="ml-3 bg-indigo-100 dark:bg-indigo-800/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2 py-1 rounded-md">
                          {walletScore.contractInteractionScore} pts
                        </div>
                      </div>
                  </div>
                </div>
                <button
                    onClick={() => setShowInteractedContracts(!showInteractedContracts)}
                    className="bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-800/30 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-lg flex items-center font-medium transition-colors"
                  >
                    {showInteractedContracts ? (
                      <>
                        Hide <EyeOff size={16} className="ml-2" />
                      </>
                    ) : (
                      <>
                        Show <Eye size={16} className="ml-2" />
                      </>
                    )}
                </button>
              </div>

                {showInteractedContracts && walletData.contractsInteracted && walletData.contractsInteracted.size > 0 ? (
                  <div className="border border-indigo-100 dark:border-indigo-800/20 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-indigo-50 dark:bg-indigo-900/20">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                              Contract Address
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                              Transactions
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                              Action
                            </th>
                      </tr>
                    </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-indigo-100 dark:divide-indigo-800/20">
                          {Array.from(walletData.contractsInteracted).map((address, index) => (
                            <tr key={index} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                                {address}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            <div className="flex items-center">
                                  <Activity className="h-4 w-4 mr-2 text-indigo-500" />
                                  <span className="font-medium">
                                    {walletData.contractInteractionCounts?.get(address) || 1}
                                  </span>
                                  <span className="ml-1 text-gray-500 dark:text-gray-400">
                                    {(walletData.contractInteractionCounts?.get(address) || 1) === 1 
                                      ? 'transaction' 
                                      : 'transactions'
                                    }
                                  </span>
                            </div>
                          </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <a
                                  href={`https://www.megaexplorer.xyz/address/${address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline inline-flex items-center"
                            >
                                  View <ExternalLink size={14} className="ml-1" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </div>
                ) : showInteractedContracts && (!walletData.contractsInteracted || walletData.contractsInteracted.size === 0) ? (
                  <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-8 text-center border border-indigo-100 dark:border-indigo-800/20">
                    <div className="inline-block p-4 bg-white dark:bg-gray-700 rounded-full mb-4 shadow-sm">
                      <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
            </div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No Contract Interactions</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      This wallet hasn't interacted with any smart contracts on the MegaETH network.
                    </p>
                  </div>
                ) : null}
                </div>
              </div>

            {/* All Transactions - Enhanced UI */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-blue-100 dark:border-blue-900/20">
              <div className="px-6 py-8 sm:p-10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 dark:bg-green-800/30 rounded-lg mr-4">
                      <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Transaction History
                      </h2>
                      <div className="mt-1 flex items-center">
                        <span className="text-gray-500 dark:text-gray-400">{walletData.allTransactions?.length || 0} transactions</span>
                        <div className="ml-3 bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-300 text-xs font-bold px-2 py-1 rounded-md">
                          {walletScore.transactionsScore} pts
                            </div>
                            </div>
                          </div>
                      </div>
                          <button
                    onClick={() => setShowAllTransactions(!showAllTransactions)}
                    className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-800/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg flex items-center font-medium transition-colors"
                  >
                    {showAllTransactions ? (
                      <>
                        Hide <EyeOff size={16} className="ml-2" />
                      </>
                    ) : (
                      <>
                        Show <Eye size={16} className="ml-2" />
                </>
              )}
                </button>
              </div>

                {showAllTransactions && walletData.allTransactions && walletData.allTransactions.length > 0 ? (
                  <div className="border border-green-100 dark:border-green-800/20 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-green-50 dark:bg-green-900/20">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wider">
                              Transaction Hash
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wider">
                              From
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wider">
                              To
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wider">
                              Value
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wider">
                              Action
                            </th>
                      </tr>
                    </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-green-100 dark:divide-green-800/20">
                          {walletData.allTransactions.slice(0, 100).map((tx, index) => (
                            <tr key={index} className="hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700 dark:text-gray-300">
                                {formatAddress(tx.hash)}
                            </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                                <span className={`${
                                  tx.from_address.toLowerCase() === walletData.address.toLowerCase()
                                    ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md font-medium'
                                    : 'text-blue-600 dark:text-blue-400'
                                }`}>
                                  {formatAddress(tx.from_address)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                                {tx.to_address ? (
                                  <span className={`${
                                    tx.to_address.toLowerCase() === walletData.address.toLowerCase()
                                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md font-medium'
                                      : 'text-blue-600 dark:text-blue-400'
                                  }`}>
                                    {formatAddress(tx.to_address)}
                                </span>
                              ) : (
                                  <span className="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-md font-medium">
                                    Contract Creation
                                </span>
                              )}
                            </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {formatEth(tx.value)}
                            </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {formatDate(tx.block_timestamp)}
                            </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <a
                                  href={`https://www.megaexplorer.xyz/tx/${tx.hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline inline-flex items-center"
                                >
                                  View <ExternalLink size={14} className="ml-1" />
                                </a>
                            </td>
                          </tr>
                          ))}
                    </tbody>
                  </table>
                </div>
                    {walletData.allTransactions.length > 100 && (
                      <div className="bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300 text-center py-3 border-t border-green-100 dark:border-green-800/20">
                        <p className="text-sm">
                          Showing 100 of {walletData.allTransactions.length.toLocaleString()} transactions
                        </p>
                </div>
              )}
            </div>
                ) : showAllTransactions && (!walletData.allTransactions || walletData.allTransactions.length === 0) ? (
                  <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-8 text-center border border-green-100 dark:border-green-800/20">
                    <div className="inline-block p-4 bg-white dark:bg-gray-700 rounded-full mb-4 shadow-sm">
                      <Activity className="h-8 w-8 text-green-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No Transactions Found</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      This wallet doesn't have any recorded transactions on the MegaETH network.
                    </p>
                  </div>
                ) : null}
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 