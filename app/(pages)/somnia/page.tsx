'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { ExternalLink, Eye, EyeOff, Info, Twitter, Share2, Award, Star, Shield, FileText, Activity, ArrowUp, Cpu, Zap, Wallet, Calendar, Image, Package, Coins } from 'lucide-react';
import { JsonRpcProvider } from 'ethers';

// Constants for API and Explorer
const SOMNIA_COUNTERS_API_URL = '/api/somnia/addresses';
const SOMNIA_TRANSACTIONS_API_URL = '/api/shannon';
const SOMNIA_RPC_URL = 'https://dream-rpc.somnia.network/'; // Keep RPC URL direct as it's used with ethers library
const SOMNIA_NFT_API_URL = '/api/somnia/addresses';
const SOMNIA_TOKEN_API_URL = '/api/somnia/addresses';
const SOMNIA_EXPLORER_URL = 'https://shannon-explorer.somnia.network';

// Component for Somnia Stats Checker
export default function SomniaStatsChecker() {
  // State variables
  const [walletAddress, setWalletAddress] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiDebugInfo, setApiDebugInfo] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false); // Add this to control debug visibility
  const [showCreatedContracts, setShowCreatedContracts] = useState(false);
  const [showInteractedContracts, setShowInteractedContracts] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showNfts, setShowNfts] = useState(true);
  const [showTokens, setShowTokens] = useState(true);
  const [walletScore, setWalletScore] = useState<WalletScore | null>(null);
  const [nftCollections, setNftCollections] = useState<NFTCollection[]>([]);
  const [isLoadingNfts, setIsLoadingNfts] = useState(false);
  const [tokenHoldings, setTokenHoldings] = useState<TokenHolding[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [totalTxCount, setTotalTxCount] = useState<number>(0);
  
  // Interface for wallet score
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
    hash: string;
    from: string;
    to: string;
    value: string;
    timeStamp: string;
    gas: string;
    gasPrice: string;
    gasUsed: string;
    blockNumber: string;
    isError: string;
    input: string;
    contractAddress?: string;
    txreceipt_status: string;
    nonce: string;
    confirmations: string;
  }

  interface TransactionListResponse {
    status: string;
    message: string;
    result: Transaction[];
  }

  interface CountersResponse {
    transactions_count: string;
    token_transfers_count: string;
    gas_usage_count: string;
    validations_count: string;
  }

  interface ProfileResponse {
    balance: string;
    native_token_price: string;
    balance_dollar: string;
    is_contract: boolean;
    is_token: boolean;
  }

  // Interface for NFT related data
  interface NFTAttribute {
    trait_type: string;
    value: string;
    display_type?: string;
  }
  
  interface NFTMetadata {
    name: string;
    description: string;
    image?: string;
    attributes?: NFTAttribute[];
    properties?: Record<string, any>;
  }
  
  interface NFTInstance {
    id: string;
    image_url: string | null;
    animation_url: string | null;
    media_url: string | null;
    metadata: NFTMetadata;
    token_type: string;
    value: string;
  }
  
  interface NFTToken {
    address: string;
    name: string;
    symbol: string;
    type: string;
    total_supply: string;
    holders: string;
  }
  
  interface NFTCollection {
    amount: string;
    token: NFTToken;
    token_instances: NFTInstance[];
  }

  interface WalletData {
    address: string;
    balance: string;
    transactionsCount: number;
    tokenTransfersCount: number;
    gasUsageCount: string;
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

  // Interface for Token related data
  interface TokenData {
    address: string;
    name: string;
    symbol: string;
    decimals: string;
    total_supply: string;
    holders: string;
    type: string;
  }
  
  interface TokenHolding {
    token: TokenData;
    value: string;
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

  // Function to fetch profile (balance) information - now using RPC
  const fetchProfile = async (address: string): Promise<{ balance: string }> => {
    try {
      const balance = await fetchBalance(address);
      return { balance };
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  };

  // Function to get transaction count using RPC - no longer needed, we get it from counters API

  // Function to fetch account counters
  const fetchAccountCounters = async (address: string): Promise<CountersResponse> => {
    try {
      // Use the direct API URL - explicitly avoiding any potential redirects
      const url = `${SOMNIA_COUNTERS_API_URL}/${address}/counters`;
      console.log('Fetching account counters from:', url);
      
      // Add headers to potentially avoid CORS issues
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      
      // Store API debug info
      setApiDebugInfo(`Attempted to fetch from: ${url}\nStatus: ${response.status}\nRedirected: ${response.redirected ? 'Yes' : 'No'}`);
      
      if (!response.ok) {
        console.error(`Failed to fetch account counters: ${response.status}`);
        throw new Error(`Failed to fetch account data: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching account counters:', error);
      throw error;
    }
  };

  // Function to fetch transactions with pagination
  const fetchTransactions = async (address: string, page: number, pageSize: number = 1000): Promise<Transaction[]> => {
    try {
      const url = `${SOMNIA_TRANSACTIONS_API_URL}?module=account&action=txlist&address=${address}&page=${page}&offset=${pageSize}&sort=dsc`;
      console.log('Fetching transactions from:', url);
      
      // Add debug information to existing state
      setApiDebugInfo(prevInfo => `${prevInfo || ''}\n\nFetching transactions page ${page} from: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      
      // Update debug info
      setApiDebugInfo(prevInfo => `${prevInfo || ''}\nTransaction API Status: ${response.status}\nRedirected: ${response.redirected ? 'Yes' : 'No'}`);
      
      if (!response.ok) {
        console.error(`Failed to fetch transactions: ${response.status}`);
        throw new Error(`Failed to fetch transaction data: ${response.status} ${response.statusText}`);
      }
      
      const data: TransactionListResponse = await response.json();
      
      if (data.status !== "1" || !Array.isArray(data.result)) {
        console.error('Invalid transaction data format:', data);
        throw new Error('Invalid transaction data format');
      }
      
      return data.result;
    } catch (error) {
      console.error(`Error fetching transactions for page ${page}:`, error);
      throw error;
    }
  };

  // Function to fetch all transactions with optimized parallel requests
  const fetchAllTransactions = async (address: string): Promise<Transaction[]> => {
    try {
      // First get transaction count from counters API
      const counters = await fetchAccountCounters(address);
      const txCount = parseInt(counters.transactions_count);
      
      // Define constants for paging
      const pageSize = 1000; // API's max page size
      const maxParallelRequests = 5; // Maximum parallel requests per batch
      
      // Calculate how many pages we actually need
      const requiredPages = Math.ceil(txCount / pageSize);
      console.log(`Required pages for ${txCount} transactions: ${requiredPages}`);
      
      // If no transactions, return empty array
      if (requiredPages === 0) {
        return [];
      }
      
      // Prepare to fetch transactions in batches
      const allTransactions: Transaction[] = [];
      
      // Fetch in batches of maxParallelRequests
      for (let batchStart = 0; batchStart < requiredPages; batchStart += maxParallelRequests) {
        // Determine end of this batch (not going beyond requiredPages)
        const batchEnd = Math.min(batchStart + maxParallelRequests, requiredPages);
        console.log(`Fetching batch from page ${batchStart + 1} to ${batchEnd}`);
        
        // Create array of promises for this batch
        const batchPromises: Promise<Transaction[]>[] = [];
        
        // Add promises for each page in this batch
        for (let page = batchStart + 1; page <= batchEnd; page++) {
          const pagePromise = fetchTransactions(address, page, pageSize);
          batchPromises.push(pagePromise);
        }
        
        // Execute this batch of requests in parallel
        const batchResults = await Promise.all(batchPromises);
        
        // Process results from this batch
        for (const pageResult of batchResults) {
          if (pageResult && Array.isArray(pageResult)) {
            allTransactions.push(...pageResult);
            
            // Check if we've reached the actual end of data (fewer results than page size)
            if (pageResult.length < pageSize) {
              console.log(`End of data reached at page ${batchStart + 1 + batchResults.indexOf(pageResult)}`);
              // No need to fetch further pages
              batchStart = requiredPages; // This will end the outer loop
              break;
            }
          }
        }
      }
      
      console.log(`Fetched ${allTransactions.length} transactions total`);
      return allTransactions;
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      throw error;
    }
  };

  // Function to fetch balance using RPC
  const fetchBalance = async (address: string): Promise<string> => {
    try {
      const provider = new JsonRpcProvider(SOMNIA_RPC_URL);
      const balanceWei = await provider.getBalance(address);
      return balanceWei.toString();
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  };

  // Function to process transactions for stats
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
    
    // Find first transaction (oldest transaction)
    let firstTransaction: Transaction | null = null;
    
    transactions.forEach(tx => {
      // Check if this is the earliest transaction by comparing timestamps
      if (!firstTransaction || new Date(parseTimestamp(tx.timeStamp)) < new Date(parseTimestamp(firstTransaction.timeStamp))) {
        firstTransaction = tx;
      }
      
      // Parse timestamp for date operations
      const date = new Date(parseTimestamp(tx.timeStamp));
      
      // Unique days - using ISO date string YYYY-MM-DD
      uniqueDays.add(date.toISOString().split('T')[0]);
      
      // Unique weeks (using ISO week)
      const year = date.getFullYear();
      const month = date.getMonth();
      const weekNum = Math.floor(date.getDate() / 7);
      uniqueWeeks.add(`${year}-${month}-${weekNum}`);
      
      // Unique months
      uniqueMonths.add(`${year}-${month}`);
      
      // Calculate volume (excluding transactions to self)
      if (tx.from.toLowerCase() === address.toLowerCase() && 
          tx.to && tx.to.toLowerCase() !== address.toLowerCase()) {
        totalVolume += Number(tx.value) / 1e18; // Convert to ETH
      }
      
      // Calculate gas spent in ETH
      if (tx.from.toLowerCase() === address.toLowerCase()) {
        // gasPrice * gasUsed = gas cost in wei
        const gasSpentWei = BigInt(tx.gasUsed || 0) * BigInt(tx.gasPrice || 0);
        totalGasSpent += Number(gasSpentWei) / 1e18; // Convert to ETH
      }
      
      // Track contract interactions
      if (tx.from.toLowerCase() === address.toLowerCase() &&
          tx.to && tx.to.toLowerCase() !== address.toLowerCase()) {
        // If input data is not just "0x" and not a blank string, it's a contract interaction
        if (tx.input && tx.input.length > 2 && tx.input !== '0x') {
          // This is likely a contract interaction
          const contractAddress = tx.to.toLowerCase();
          contractsInteracted.add(contractAddress);
          
          // Increment interaction count
          const currentCount = contractInteractionCounts.get(contractAddress) || 0;
          contractInteractionCounts.set(contractAddress, currentCount + 1);
        }
      }
      
      // Identify contract creations - contractAddress field should be populated
      if (tx.from.toLowerCase() === address.toLowerCase() && 
          tx.contractAddress && tx.contractAddress !== '') {
        contractsCreated.push(tx);
      }
    });
    
    // Debug output for contract detection
    console.log(`Found ${contractsCreated.length} contracts created and ${contractsInteracted.size} contracts interacted with`);
    
    return {
      firstTransaction,
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

  // Helper function to parse different timestamp formats
  const parseTimestamp = (timestamp: string): Date | number => {
    // Check if timestamp is already an ISO string with 'T' and 'Z'
    if (typeof timestamp === 'string' && timestamp.includes('T')) {
      return new Date(timestamp);
    }
    
    // Check if it's a Unix timestamp (seconds or milliseconds)
    const num = Number(timestamp);
    if (!isNaN(num)) {
      // If it's in seconds (Unix timestamp), convert to milliseconds
      if (num < 20000000000) { // Smaller than year ~2603 in milliseconds
        return new Date(num * 1000);
      }
      // Already in milliseconds
      return new Date(num);
    }
    
    // Fallback - try parsing as is
    return new Date(timestamp);
  };

  // Function to fetch NFTs for the wallet
  const fetchNFTs = async (address: string) => {
    setIsLoadingNfts(true);
    try {
      const url = `${SOMNIA_NFT_API_URL}/${address}/nft/collections?type=ERC-721%2CERC-404%2CERC-1155`;
      console.log('Fetching NFTs from:', url);
      
      // Add debug information
      setApiDebugInfo(prevInfo => `${prevInfo || ''}\n\nFetching NFTs from: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      
      // Update debug info
      setApiDebugInfo(prevInfo => `${prevInfo || ''}\nNFT API Status: ${response.status}\nRedirected: ${response.redirected ? 'Yes' : 'No'}`);
      
      if (response.status === 429) {
        const errorData = await response.json();
        if (errorData.message && errorData.message.includes("180 per 1 minute")) {
          throw new Error("Rate limit exceeded: 180 requests per minute. Please wait a few minutes and try again.");
        }
        throw new Error(`Rate limit exceeded. Please wait a few minutes and try again.`);
      }
      
      if (!response.ok) {
        console.error(`Failed to fetch NFTs: ${response.status}`);
        return;
      }
      
      const data = await response.json();
      
      // Normalize NFT data to ensure consistent structure and prevent null errors
      const normalizedCollections = (data.items || []).map((collection: NFTCollection) => {
        // Ensure token_instances is always an array
        const instances = collection.token_instances || [];
        
        // Fix any instances with missing or malformed metadata
        const normalizedInstances = instances.map(instance => {
          // Ensure metadata exists and has required fields
          if (!instance.metadata) {
            instance.metadata = {
              name: `NFT #${instance.id}`,
              description: '',
              attributes: []
            };
          }
          
          return instance;
        });
        
        return {
          ...collection,
          token_instances: normalizedInstances
        };
      });
      
      setNftCollections(normalizedCollections);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      // We don't need to show rate limit error for NFTs since the main data is already displayed
      // Just log it and continue
    } finally {
      setIsLoadingNfts(false);
    }
  };

  // Function to fetch token holdings for the wallet
  const fetchTokenHoldings = async (address: string) => {
    setIsLoadingTokens(true);
    try {
      const url = `${SOMNIA_TOKEN_API_URL}/${address}/tokens?type=ERC-20`;
      console.log('Fetching token holdings from:', url);
      
      // Add debug information
      setApiDebugInfo(prevInfo => `${prevInfo || ''}\n\nFetching tokens from: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      
      // Update debug info
      setApiDebugInfo(prevInfo => `${prevInfo || ''}\nToken API Status: ${response.status}\nRedirected: ${response.redirected ? 'Yes' : 'No'}`);
      
      if (response.status === 429) {
        const errorData = await response.json();
        if (errorData.message && errorData.message.includes("180 per 1 minute")) {
          throw new Error("Rate limit exceeded: 180 requests per minute. Please wait a few minutes and try again.");
        }
        throw new Error(`Rate limit exceeded. Please wait a few minutes and try again.`);
      }
      
      if (!response.ok) {
        console.error(`Failed to fetch token holdings: ${response.status}`);
        return;
      }
      
      const data = await response.json();
      setTokenHoldings(data.items || []);
    } catch (error) {
      console.error('Error fetching token holdings:', error);
      // We don't need to show rate limit error for tokens since the main data is already displayed
      // Just log it and continue
    } finally {
      setIsLoadingTokens(false);
    }
  };

  // Helper function to format token balance with proper decimals
  const formatTokenBalance = (value: string, decimals: string): string => {
    if (!value) return '0';
    
    const decimalPlaces = parseInt(decimals || '0');
    if (isNaN(decimalPlaces)) {
      return '0';
    }

    try {
      const valueBigInt = BigInt(value);
      
      // For small values, we'll need to handle leading zeros
      const valueStr = valueBigInt.toString();
      
      // If the value is less than 10^decimals, we need to add leading zeros
      if (valueStr.length <= decimalPlaces) {
        const leadingZeros = decimalPlaces - valueStr.length;
        const formattedValue = '0.' + '0'.repeat(leadingZeros) + valueStr;
        return parseFloat(formattedValue).toString();
      }
      
      // Insert decimal point at the right position
      const integerPart = valueStr.slice(0, valueStr.length - decimalPlaces);
      const fractionalPart = valueStr.slice(valueStr.length - decimalPlaces);
      
      // Truncate trailing zeros in fractional part
      const trimmedFractionalPart = fractionalPart.replace(/0+$/, '');
      
      if (trimmedFractionalPart.length === 0) {
        return integerPart;
      }
      
      return `${integerPart}.${trimmedFractionalPart}`;
    } catch (e) {
      console.error(`Error formatting token balance with value: ${value} and decimals: ${decimals}`, e);
      return '0'; // Return 0 if BigInt conversion fails
    }
  };

  // Format for displaying wallet balance in ETH, not wei
  const formatEthBalance = (wei: string): string => {
    const etherValue = Number(wei) / 1e18;
    return etherValue.toFixed(6);
  };

  // Main function to fetch wallet data
  const fetchWalletData = async () => {
    if (!isValidAddress || !walletAddress) {
      setError('Please enter a valid Ethereum address');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setApiDebugInfo(null);
    setWalletData(null);
    setWalletScore(null);
    setNftCollections([]);
    setTokenHoldings([]);
    
    try {
      // Run these requests in parallel using Promise.all
      const [profileData, countersData, allTransactions] = await Promise.all([
        // Get profile data (balance) using RPC
        fetchProfile(walletAddress),
        
        // Get counters data (transactions count, token transfers, gas usage)
        fetchAccountCounters(walletAddress),
        
        // Fetch all transactions
        fetchAllTransactions(walletAddress)
      ]);
      
      if (!profileData) {
        throw new Error('Failed to fetch wallet profile data');
      }
      
      // Process transactions for stats
      const processedData = processTransactions(allTransactions, walletAddress);
      
      // Calculate wallet age and exact first transaction date
      let walletAge = 'Unknown';
      let firstTxDate = '';
      
      if (processedData.firstTransaction) {
        try {
          // Use our custom timestamp parser
          const parsedDate = new Date(parseTimestamp(processedData.firstTransaction?.timeStamp || '0'));
          
          // Add debug info about timestamp
          setApiDebugInfo(prevInfo => {
            const txTime = processedData.firstTransaction?.timeStamp || 'undefined';
            return `${prevInfo || ''}\n\nFirst Transaction Timestamp: ${txTime}\nParsed as: ${parsedDate.toISOString()}`;
          });
          
          walletAge = formatDistanceToNow(parsedDate, { addSuffix: true });
          firstTxDate = format(parsedDate, 'PPpp'); // Format: 'Apr 29, 2023, 2:15:30 PM'
        } catch (dateError) {
          console.error('Error parsing transaction date:', dateError);
          setApiDebugInfo(prevInfo => {
            const txTime = processedData.firstTransaction?.timeStamp || 'undefined';
            return `${prevInfo || ''}\n\nError parsing date: ${String(dateError)}\nTimestamp value: ${txTime}`;
          });
          walletAge = 'Unknown (date error)';
          firstTxDate = 'Unknown format';
        }
      }
      
      // Set complete wallet data
      const fullWalletData = {
        address: walletAddress,
        balance: profileData.balance,
        transactionsCount: parseInt(countersData.transactions_count),
        tokenTransfersCount: parseInt(countersData.token_transfers_count),
        gasUsageCount: countersData.gas_usage_count,
        firstTransaction: processedData.firstTransaction,
        walletAge,
        firstTxDate,
        allTransactions,
        ...processedData,
      } as WalletData;
      
      setWalletData(fullWalletData);
      
      // Calculate and set wallet score
      const score = calculateWalletScore(fullWalletData);
      setWalletScore(score);
      
      // Fetch NFTs and token holdings for the wallet
      await Promise.all([
        fetchNFTs(walletAddress),
        fetchTokenHoldings(walletAddress)
      ]);
      
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      
      // Check if this is a rate limit error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('Rate limit exceeded')) {
        setError(errorMessage);
      } else {
        setError(`Failed to fetch wallet data: ${errorMessage}. Please try again.`);
      }
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
  const formatDate = (timestamp: string) => {
    return parseISO(timestamp).toLocaleString();
  };

  // Generate Twitter share text
  const generateTwitterShareText = () => {
    if (!walletData || !walletScore) return '';
    
    const txCount = walletData.transactionsCount;
    
    const lines = [
      `🔍 My #Somnia Wallet Stats:`,
      `💰 Balance: ${parseFloat(walletData.balance).toFixed(4)} STT`,
      `🏆 Wallet SCORE: ${walletScore.totalScore}`,
      `🧠 Activity: ${walletData.uniqueDays.size} days | ${walletData.uniqueWeeks.size} weeks | ${walletData.uniqueMonths.size} months`,
      `📊 Transactions: ${txCount.toLocaleString()}`,
      `\nCheck your stats at cryptowalletsx.com/somnia`
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
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('/images/somnia-bg.jpg')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
          <div className="relative px-6 py-12 sm:px-10 sm:py-16 text-center">
            <div className="animate-float">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg mb-4 tracking-tight">
                Somnia Stats Explorer
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 mx-auto my-4 rounded-full"></div>
              <p className="mt-6 text-xl text-white/90 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-md">
                Explore detailed wallet analytics, transaction history, and calculate your Somnia wallet score.
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Search Form */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-purple-100 dark:border-purple-900/20 transform transition-all duration-300 hover:shadow-purple-200/50 dark:hover:shadow-purple-900/30">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-1">
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
                        className={`pl-10 w-full py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white rounded-xl shadow-sm focus:ring-purple-500 focus:border-purple-500 ${
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
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center"
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
                  Analyze any wallet on Somnia network and get detailed insights.
                </div>
              </form>
            </div>
          </div>
        </div>
          
        {/* Error Alert */}
        {error && (
          <div className={`rounded-xl p-5 shadow-sm ${error.includes('Rate limit') ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800/50 text-amber-700 dark:text-amber-300' : 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300'}`}>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-medium">{error}</p>
                {error.includes('Rate limit') && (
                  <p className="mt-2 text-sm">
                    The Somnia API has a limit of 180 requests per minute. Please wait and try again in a few minutes.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* API Debug Info - Hidden by default, only shown when showDebugInfo is true */}
        {apiDebugInfo && showDebugInfo && (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mt-4 text-sm font-mono overflow-x-auto">
            <div className="flex justify-between items-center mb-2">
              <p className="font-bold">API Debug Info:</p>
              <button 
                onClick={() => setShowDebugInfo(false)}
                className="text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 px-2 py-1 rounded"
              >
                Hide
              </button>
            </div>
            <pre>{apiDebugInfo}</pre>
          </div>
        )}

        {/* Enhanced Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 flex flex-col justify-center items-center min-h-[300px] border border-purple-100 dark:border-purple-900/20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-purple-100 dark:border-purple-800/50 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-t-purple-600 dark:border-t-purple-400 animate-spin rounded-full absolute top-0 left-0"></div>
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">Analyzing Wallet Data</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Fetching transactions and calculating metrics...
              </p>
              
              <div className="mt-6 space-y-2">
                <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></div>
                </div>
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ml-4">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></div>
                </div>
                <div className="w-40 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ml-2">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {walletData && walletScore && !isLoading && (
          <div className="space-y-8">
            {/* Wallet Score Card */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-700 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-8 sm:p-10">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="mb-6 md:mb-0">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center">
                      <Award className="h-8 w-8 mr-3" />
                      Wallet Score: <span className="ml-2 text-yellow-300">{walletScore.totalScore.toLocaleString()}</span>
                    </h2>
                    <p className="mt-3 text-purple-100">This score reflects your activity and engagement on Somnia network</p>
                  </div>
                  <button
                    onClick={shareOnTwitter}
                    className="flex items-center px-6 py-4 bg-white text-purple-600 rounded-xl shadow-lg hover:shadow-xl font-bold transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <Twitter className="h-5 w-5 mr-2" />
                    Share Score on Twitter
                  </button>
                </div>
                  
                {/* Score Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center mb-2">
                      <Activity className="h-5 w-5 text-purple-200 mr-2" />
                      <h3 className="text-sm text-purple-100 font-medium">Transactions</h3>
                    </div>
                    <p className="text-xl font-bold text-white">{walletScore.transactionsScore.toLocaleString()} pts</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center mb-2">
                      <FileText className="h-5 w-5 text-purple-200 mr-2" />
                      <h3 className="text-sm text-purple-100 font-medium">Contracts</h3>
                    </div>
                    <p className="text-xl font-bold text-white">{(walletScore.contractCreationScore + walletScore.contractInteractionScore).toLocaleString()} pts</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center mb-2">
                      <ArrowUp className="h-5 w-5 text-purple-200 mr-2" />
                      <h3 className="text-sm text-purple-100 font-medium">Volume</h3>
                    </div>
                    <p className="text-xl font-bold text-white">{walletScore.volumeScore.toLocaleString()} pts</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center mb-2">
                      <Shield className="h-5 w-5 text-purple-200 mr-2" />
                      <h3 className="text-sm text-purple-100 font-medium">Activity</h3>
                    </div>
                    <p className="text-xl font-bold text-white">{(walletScore.uniqueDaysScore + walletScore.uniqueWeeksScore + walletScore.uniqueMonthsScore).toLocaleString()} pts</p>
                  </div>
                </div>
              </div>
            </div>
                
            {/* Enhanced Wallet Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-purple-100 dark:border-purple-900/20">
              <div className="relative">
                {/* Decorative gradient background with pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-red-500/5"></div>
                <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5"></div>
                
                {/* Main content with relative positioning */}
                <div className="relative px-6 py-8 sm:p-10">
                  <div className="flex flex-col md:flex-row md:items-start justify-between mb-8">
                    <div>
                      <div className="flex items-center mb-3">
                        <div className="p-3 bg-purple-100 dark:bg-purple-800/30 rounded-lg mr-4 shadow-sm">
                          <Wallet className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                            Wallet Overview
                            <a
                              href={`${SOMNIA_EXPLORER_URL}/address/${walletData.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-purple-500 hover:text-purple-600 dark:text-purple-400"
                            >
                              <ExternalLink size={18} />
                            </a>
                          </h2>
                          <div className="h-1 w-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mt-2"></div>
                        </div>
                      </div>
                      <div className="flex items-center mt-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl px-4 py-2 border border-purple-100 dark:border-purple-800/20">
                        <div className="mr-2 text-purple-700 dark:text-purple-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-1l1-1 1-1-1-1H3a1 1 0 01-1-1V7a1 1 0 011-1h4L7 5l-1-1V3h1l1 1 1 1 1-1a6 6 0 017.743 5.743L18 8z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-purple-700 dark:text-purple-300 text-sm font-medium break-all font-mono">
                          {walletData.address}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={shareOnTwitter}
                      className="mt-4 md:mt-0 flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-colors shadow-md hover:shadow-lg"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Stats
                    </button>
                  </div>
                    
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Balance Card */}
                    <div className="relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-75 group-hover:opacity-85 transition-opacity rounded-xl"></div>
                      <div className="absolute inset-0 bg-[url('/images/coin-pattern.svg')] bg-repeat opacity-10"></div>
                      <div className="relative p-6 flex flex-col items-center text-center">
                        <div className="p-4 bg-white rounded-full shadow-lg mb-4">
                          <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Balance</h3>
                        <p className="text-3xl font-extrabold text-white drop-shadow-md">
                          {formatEthBalance(walletData.balance)}
                        </p>
                        <p className="text-purple-100 mt-1">STT</p>
                      </div>
                    </div>
                    
                    {/* Wallet Age Card */}
                    <div className="relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-red-600 opacity-75 group-hover:opacity-85 transition-opacity rounded-xl"></div>
                      <div className="absolute inset-0 bg-[url('/images/time-pattern.svg')] bg-repeat opacity-10"></div>
                      <div className="relative p-6 flex flex-col items-center text-center">
                        <div className="p-4 bg-white rounded-full shadow-lg mb-4">
                          <svg className="w-8 h-8 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                href={`${SOMNIA_EXPLORER_URL}/tx/${walletData.firstTransaction.hash}`}
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
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-red-600 opacity-75 group-hover:opacity-85 transition-opacity rounded-xl"></div>
                      <div className="absolute inset-0 bg-[url('/images/transaction-pattern.svg')] bg-repeat opacity-10"></div>
                      <div className="relative p-6 flex flex-col items-center text-center">
                        <div className="p-4 bg-white rounded-full shadow-lg mb-4">
                          <svg className="w-8 h-8 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Transactions</h3>
                        <p className="text-3xl font-extrabold text-white drop-shadow-md">
                          {walletData.transactionsCount.toLocaleString()}
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-purple-100 dark:border-purple-900/20">
              <div className="px-6 py-8 sm:p-10">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">Activity Statistics</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('/images/calendar-bg.svg')] opacity-5"></div>
                    <div className="relative p-6">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-bold text-purple-700 dark:text-purple-400">Unique Days</h3>
                        <div className="bg-purple-100 dark:bg-purple-800/50 text-purple-700 dark:text-purple-300 text-xs font-bold px-2 py-1 rounded-md">
                          {walletScore.uniqueDaysScore} pts
                        </div>
                      </div>
                      <div className="text-4xl font-extrabold text-purple-900 dark:text-purple-100">
                        {walletData.uniqueDays.size.toLocaleString()}
                      </div>
                      <p className="mt-2 text-sm text-purple-600 dark:text-purple-300">
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
                  <div className="bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('/images/graph-bg.svg')] opacity-5"></div>
                    <div className="relative p-6">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-bold text-pink-700 dark:text-pink-400">Total Volume</h3>
                        <div className="bg-pink-100 dark:bg-pink-800/50 text-pink-700 dark:text-pink-300 text-xs font-bold px-2 py-1 rounded-md">
                          {walletScore.volumeScore} pts
                        </div>
                      </div>
                      <div className="text-4xl font-extrabold text-pink-900 dark:text-pink-100">
                        {walletData.totalVolume.toFixed(6)} STT
                      </div>
                      <p className="mt-2 text-sm text-pink-600 dark:text-pink-300">
                        Total on-chain volume
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('/images/gas-bg.svg')] opacity-5"></div>
                    <div className="relative p-6">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Gas Spent</h3>
                        <div className="bg-red-100 dark:bg-red-800/50 text-red-700 dark:text-red-300 text-xs font-bold px-2 py-1 rounded-md">
                          Network Support
                        </div>
                      </div>
                      <div className="text-4xl font-extrabold text-red-900 dark:text-red-100">
                        {walletData.totalGasSpent.toFixed(6)} STT
                      </div>
                      <p className="mt-2 text-sm text-red-600 dark:text-red-300">
                        Total gas used for transactions
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 mt-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('/images/transfer-bg.svg')] opacity-5"></div>
                    <div className="relative p-6">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-400">Token Transfers</h3>
                        <div className="bg-indigo-100 dark:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2 py-1 rounded-md">
                          Activity Metric
                        </div>
                      </div>
                      <div className="text-4xl font-extrabold text-indigo-900 dark:text-indigo-100">
                        {walletData.tokenTransfersCount.toLocaleString()}
                      </div>
                      <p className="mt-2 text-sm text-indigo-600 dark:text-indigo-300">
                        Total token transfer operations
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contracts Created - Enhanced UI */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-purple-100 dark:border-purple-900/20">
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
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700 dark:text-gray-300">
                                <a 
                                  href={`${SOMNIA_EXPLORER_URL}/tx/${tx.hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline text-blue-600 dark:text-blue-400"
                                >
                                  {formatAddress(tx.hash)}
                                </a>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                                  {format(parseISO(tx.timeStamp), 'PPp')}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {tx.contractAddress ? (
                                  <a
                                    href={`${SOMNIA_EXPLORER_URL}/address/${tx.contractAddress}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline inline-flex items-center"
                                  >
                                    {formatAddress(tx.contractAddress)}
                                    <ExternalLink size={12} className="ml-1" />
                                  </a>
                                ) : (
                                  <span className="text-amber-500">Not available</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <a
                                  href={`${SOMNIA_EXPLORER_URL}/tx/${tx.hash}`}
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
                      This wallet hasn't created any smart contracts on the Somnia network.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Contracts Interacted - New UI Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-purple-100 dark:border-purple-900/20">
              <div className="px-6 py-8 sm:p-10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-800/30 rounded-lg mr-4">
                      <Zap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
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
                              Interactions
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-indigo-100 dark:divide-indigo-800/20">
                          {Array.from(walletData.contractsInteracted).map((contractAddress, index) => (
                            <tr key={index} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700 dark:text-gray-300">
                                <a
                                  href={`${SOMNIA_EXPLORER_URL}/address/${contractAddress}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline"
                                >
                                  {formatAddress(contractAddress)}
                                </a>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                <div className="flex items-center">
                                  <Activity className="h-4 w-4 mr-2 text-indigo-500" />
                                  <span className="bg-indigo-100 dark:bg-indigo-800/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2 py-1 rounded-md">
                                    {walletData.contractInteractionCounts.get(contractAddress) || 0} times
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <a
                                  href={`${SOMNIA_EXPLORER_URL}/address/${contractAddress}`}
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
                      <Zap className="h-8 w-8 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No Contract Interactions</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      This wallet hasn't interacted with any smart contracts on the Somnia network.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* All Transactions - Enhanced UI */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-purple-100 dark:border-purple-900/20">
              <div className="px-6 py-8 sm:p-10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-red-100 dark:bg-red-800/30 rounded-lg mr-4">
                      <Activity className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Transaction History
                      </h2>
                      <div className="mt-1 flex items-center">
                        <span className="text-gray-500 dark:text-gray-400">
                          {walletData.transactionsCount.toLocaleString()} transactions
                        </span>
                        <div className="ml-3 bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300 text-xs font-bold px-2 py-1 rounded-md">
                          {walletScore.transactionsScore} pts
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAllTransactions(!showAllTransactions)}
                    className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-800/30 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg flex items-center font-medium transition-colors"
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
                  <div className="border border-red-100 dark:border-red-800/20 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-red-50 dark:bg-red-900/20">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                              Transaction Hash
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                              From
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                              To
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                              Value
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-red-100 dark:divide-red-800/20">
                          {walletData.allTransactions.slice(0, 100).map((tx, index) => (
                            <tr key={index} className="hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700 dark:text-gray-300">
                                <a
                                  href={`${SOMNIA_EXPLORER_URL}/tx/${tx.hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline text-blue-600 dark:text-blue-400"
                                >
                                  {formatAddress(tx.hash)}
                                </a>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                                <span className={`${
                                  tx.from.toLowerCase() === walletData.address.toLowerCase()
                                    ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md font-medium'
                                    : 'text-blue-600 dark:text-blue-400'
                                }`}>
                                  <a
                                    href={`${SOMNIA_EXPLORER_URL}/address/${tx.from}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                  >
                                    {formatAddress(tx.from)}
                                  </a>
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                                {tx.to ? (
                                  <span className={`${
                                    tx.to.toLowerCase() === walletData.address.toLowerCase()
                                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md font-medium'
                                      : 'text-blue-600 dark:text-blue-400'
                                  }`}>
                                    <a
                                      href={`${SOMNIA_EXPLORER_URL}/address/${tx.to}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:underline"
                                    >
                                      {formatAddress(tx.to)}
                                    </a>
                                  </span>
                                ) : (
                                  <span className="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-md font-medium">
                                    Contract Creation
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {parseFloat(tx.value).toFixed(6)} STT
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {formatDate(tx.timeStamp)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <a
                                  href={`${SOMNIA_EXPLORER_URL}/tx/${tx.hash}`}
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
                      <div className="bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300 text-center py-3 border-t border-red-100 dark:border-red-800/20">
                        <p className="text-sm">
                          Showing 100 of {walletData.allTransactions.length.toLocaleString()} transactions
                        </p>
                      </div>
                    )}
                  </div>
                ) : showAllTransactions && (!walletData.allTransactions || walletData.allTransactions.length === 0) ? (
                  <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-8 text-center border border-red-100 dark:border-red-800/20">
                    <div className="inline-block p-4 bg-white dark:bg-gray-700 rounded-full mb-4 shadow-sm">
                      <Activity className="h-8 w-8 text-red-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No Transactions Found</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      This wallet doesn't have any recorded transactions on the Somnia network.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* NFT Collections - New Section */}
        {walletData && walletScore && !isLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-purple-100 dark:border-purple-900/20 mt-8">
            <div className="px-6 py-8 sm:p-10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="p-3 bg-pink-100 dark:bg-pink-800/30 rounded-lg mr-4">
                    <Package className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      NFT Collections
                    </h2>
                    <div className="mt-1 flex items-center">
                      <span className="text-gray-500 dark:text-gray-400">
                        {nftCollections.length} collections
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowNfts(!showNfts)}
                  className="bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-800/30 text-pink-700 dark:text-pink-300 px-4 py-2 rounded-lg flex items-center font-medium transition-colors"
                >
                  {showNfts ? (
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

              {showNfts && isLoadingNfts && (
                <div className="flex justify-center items-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                </div>
              )}

              {showNfts && !isLoadingNfts && nftCollections && nftCollections.length > 0 ? (
                <div className="space-y-8">
                  {nftCollections.map((collection, collectionIndex) => (
                    <div key={collectionIndex} className="border border-pink-100 dark:border-pink-800/20 rounded-xl overflow-hidden">
                      <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10 p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                              {collection.token.name}
                              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                {collection.token.symbol}
                              </span>
                            </h3>
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                                <span className="font-medium">{collection.amount}</span>
                                <span className="ml-1">items</span>
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                                <span className="font-medium">{collection.token.holders}</span>
                                <span className="ml-1">holders</span>
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                                <span className="font-medium">{collection.token.total_supply}</span>
                                <span className="ml-1">total supply</span>
                              </div>
                            </div>
                          </div>
                          <a
                            href={`${SOMNIA_EXPLORER_URL}/token/${collection.token.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 font-medium flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all"
                          >
                            View Collection <ExternalLink size={16} className="ml-2" />
                          </a>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {collection.token_instances.slice(0, 8).map((nft, index) => (
                            <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow duration-300 flex flex-col">
                              <div className="relative aspect-square overflow-hidden bg-gray-200 dark:bg-gray-700">
                                {(nft.image_url || nft.media_url || (nft.metadata && nft.metadata.image)) ? (
                                  <img 
                                    src={nft.image_url || nft.media_url || (nft.metadata ? nft.metadata.image : '')} 
                                    alt={(nft.metadata ? nft.metadata.name : '') || `NFT #${nft.id}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).onerror = null;
                                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=No+Image';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                                    <Image size={48} />
                                  </div>
                                )}
                                
                                {nft.animation_url && (
                                  <div className="absolute bottom-2 right-2 bg-black/60 text-white p-1 rounded-md text-xs">
                                    Animated
                                  </div>
                                )}
                              </div>
                              
                              <div className="p-4 flex-grow">
                                <h4 className="font-bold text-gray-800 dark:text-white text-sm truncate">
                                  {(nft.metadata && nft.metadata.name) || `#${nft.id}`}
                                </h4>
                                
                                {nft.metadata && nft.metadata.description && (
                                  <p className="text-gray-600 dark:text-gray-300 text-xs mt-1 line-clamp-2">
                                    {nft.metadata.description}
                                  </p>
                                )}
                                
                                {nft.metadata && nft.metadata.attributes && nft.metadata.attributes.length > 0 && (
                                  <div className="mt-3 space-y-1">
                                    {nft.metadata.attributes.slice(0, 2).map((attr, attrIndex) => (
                                      <div key={attrIndex} className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500 dark:text-gray-400 truncate max-w-[40%]">
                                          {attr.trait_type}:
                                        </span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded truncate max-w-[60%]">
                                          {typeof attr.value === 'string' ? attr.value : String(attr.value)}
                                        </span>
                                      </div>
                                    ))}
                                    
                                    {nft.metadata && nft.metadata.attributes && nft.metadata.attributes.length > 2 && (
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        +{nft.metadata.attributes.length - 2} more attributes
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              <div className="px-4 pb-4 mt-auto">
                                <a
                                  href={`${SOMNIA_EXPLORER_URL}/token/${collection.token.address}/instance/${nft.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full flex items-center justify-center py-2 bg-pink-100 hover:bg-pink-200 dark:bg-pink-900/20 dark:hover:bg-pink-800/30 text-pink-700 dark:text-pink-300 rounded-lg text-sm font-medium transition-colors"
                                >
                                  View Details <ExternalLink size={14} className="ml-2" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {collection.token_instances.length > 8 && (
                          <div className="mt-6 text-center">
                            <a
                              href={`${SOMNIA_EXPLORER_URL}/address/${walletAddress}/tokens?filter=nft`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                            >
                              View all {collection.token_instances.length} NFTs <ExternalLink size={16} className="ml-2" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : showNfts && !isLoadingNfts && (!nftCollections || nftCollections.length === 0) ? (
                <div className="bg-pink-50 dark:bg-pink-900/10 rounded-xl p-8 text-center border border-pink-100 dark:border-pink-800/20">
                  <div className="inline-block p-4 bg-white dark:bg-gray-700 rounded-full mb-4 shadow-sm">
                    <Package className="h-8 w-8 text-pink-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No NFTs Found</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    This wallet doesn't have any NFTs on the Somnia network.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Token Holdings - New Section */}
        {walletData && walletScore && !isLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-purple-100 dark:border-purple-900/20 mt-8">
            <div className="px-6 py-8 sm:p-10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-800/30 rounded-lg mr-4">
                    <Coins className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      Token Holdings
                    </h2>
                    <div className="mt-1 flex items-center">
                      <span className="text-gray-500 dark:text-gray-400">
                        {tokenHoldings.length} tokens
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowTokens(!showTokens)}
                  className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg flex items-center font-medium transition-colors"
                >
                  {showTokens ? (
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

              {showTokens && isLoadingTokens && (
                <div className="flex justify-center items-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              )}

              {showTokens && !isLoadingTokens && tokenHoldings && tokenHoldings.length > 0 ? (
                <div className="border border-blue-100 dark:border-blue-800/20 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-blue-100 dark:divide-blue-800/20">
                      <thead className="bg-blue-50 dark:bg-blue-900/20">
                        <tr>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                            Token
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                            Balance
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                            Holders
                          </th>
                          <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-blue-100 dark:divide-blue-800/20">
                        {tokenHoldings
                          .sort((a, b) => {
                            const aDecimals = parseInt(a.token.decimals || '18');
                            const bDecimals = parseInt(b.token.decimals || '18');

                            if (isNaN(aDecimals) || isNaN(bDecimals)) {
                              return 0;
                            }

                            try {
                              const aValue = BigInt(a.value || '0');
                              const bValue = BigInt(b.value || '0');
                              const aValueNum = aValue / (10n ** BigInt(aDecimals));
                              const bValueNum = bValue / (10n ** BigInt(bDecimals));
                              if (bValueNum > aValueNum) return 1;
                              if (bValueNum < aValueNum) return -1;
                              return 0;
                            } catch (e) {
                              console.error('Error sorting token holdings:', e);
                              return 0;
                            }
                          })
                          .map((holding, index) => (
                          <tr key={index} className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                  {(holding.token?.symbol || '??').slice(0, 2)}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {holding.token?.name || 'Unknown Token'}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {holding.token?.symbol || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white font-medium">
                                {formatTokenBalance(holding.value, holding.token.decimals)}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {holding.token.decimals} decimals
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {parseInt(holding.token.holders).toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <a
                                href={`${SOMNIA_EXPLORER_URL}/token/${holding.token.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium inline-flex items-center"
                              >
                                View Token <ExternalLink size={14} className="ml-1" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : showTokens && !isLoadingTokens && (!tokenHoldings || tokenHoldings.length === 0) ? (
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-8 text-center border border-blue-100 dark:border-blue-800/20">
                  <div className="inline-block p-4 bg-white dark:bg-gray-700 rounded-full mb-4 shadow-sm">
                    <Coins className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No Tokens Found</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    This wallet doesn't have any ERC-20 tokens on the Somnia network.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 