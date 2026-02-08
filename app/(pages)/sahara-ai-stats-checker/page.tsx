'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow, format, parseISO, differenceInMonths } from 'date-fns';
import { ExternalLink, Eye, EyeOff, Info, Twitter, Share2, Award, Star, Shield, FileText, Activity, ArrowUp, Cpu, Zap, Wallet, Calendar, Image, Package, Coins, Search } from 'lucide-react';
import { JsonRpcProvider, ethers } from 'ethers';
import Link from '@/app/components/Link';

// Constants for API and Explorer
const SAHARA_COUNTERS_API_URL = '/api/sahara-ai/addresses'; // Placeholder, will be updated
const SAHARA_TRANSACTIONS_API_URL = '/api/sahara-ai-explorer'; // Placeholder, will be updated
const SAHARA_RPC_URL = 'https://testnet.saharalabs.ai';
const SAHARA_EXPLORER_URL = 'https://testnet-explorer.saharalabs.ai';
const CHAIN_SYMBOL = '$SAHARA';
const CHAIN_NAME = 'Sahara AI Testnet';
const CHAIN_DECIMALS = 18;


// Component for Sahara AI Stats Checker
export default function SaharaAiStatsChecker() {
  // State variables
  const [walletAddress, setWalletAddress] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiDebugInfo, setApiDebugInfo] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  const [showCreatedContracts, setShowCreatedContracts] = useState(false);
  const [showInteractedContracts, setShowInteractedContracts] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [walletScore, setWalletScore] = useState<WalletScore | null>(null);
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
    walletAgeBonusScore: number;
  }

  // Interfaces for Sahara AI API
  interface SaharaTransactionItem {
    priority_fee: string | null;
    tx_burnt_fee: string | null;
    raw_input: string;
    result: string;
    hash: string;
    max_fee_per_gas: string | null;
    revert_reason: string | null;
    confirmation_duration: [number, number];
    transaction_burnt_fee: string | null;
    type: number;
    token_transfers_overflow: boolean | null;
    confirmations: number;
    position: number;
    max_priority_fee_per_gas: string | null;
    transaction_tag: string | null;
    created_contract: { hash: string } | null;
    value: string;
    from: { hash: string, is_contract: boolean };
    gas_used: string;
    status: string;
    to: { hash: string, is_contract: boolean } | null; // Can be null for contract creation
    method: string | null;
    fee: { type: string, value: string };
    gas_limit: string;
    gas_price: string;
    decoded_input: any | null; // Can be complex, using any for now
    token_transfers: any[] | null; // Can be complex
    base_fee_per_gas: string;
    timestamp: string; // ISO 8601 format "YYYY-MM-DDTHH:mm:ss.SSSSSSZ"
    nonce: number;
    transaction_types: string[];
    exchange_rate: string | null;
    block_number: number;
    has_error_in_internal_transactions: boolean | null;
  }

  interface SaharaTransactionResponse {
    items: SaharaTransactionItem[];
    next_page_params: {
      block_number: number;
      fee: string;
      hash: string;
      index: number;
      inserted_at: string;
      items_count: number;
      value: string;
    } | null;
  }

  // Modified Transaction interface to align with Sahara API and Somnia structure
  interface Transaction {
    hash: string;
    from: string;
    to: string | null; // Can be null for contract creation
    value: string;
    timeStamp: string; // Converted from Sahara's timestamp
    gas: string; // Mapped from gas_limit
    gasPrice: string;
    gasUsed: string;
    blockNumber: string; // Converted from number
    isError: string; // '0' for success, '1' for error (based on result/status)
    input: string; // Mapped from raw_input
    contractAddress?: string; // Mapped from created_contract.hash
    txreceipt_status: string; // '1' for success, '0' for error
    nonce: string; // Converted from number
    confirmations: string; // Converted from number
    method?: string | null; // From Sahara API
  }


  interface CountersResponse {
    transactions_count: string;
    token_transfers_count: string;
    gas_usage_count: string; // from counters API
    validations_count: string; // Not used in Somnia but present here
  }

  // WalletData remains largely the same, ensure fields are populated correctly
  interface WalletData {
    address: string;
    balance: string;
    transactionsCount: number; // from counters API
    tokenTransfersCount: number; // from counters API
    gasUsageCount: string; // from counters API
    firstTransaction: Transaction | null;
    walletAge: string;
    firstTxDate: string;
    uniqueDays: Set<string>;
    uniqueWeeks: Set<string>;
    uniqueMonths: Set<string>;
    totalVolume: number; // Sum of 'value' from transactions
    totalGasSpent: number; // Sum of (gasUsed * gasPrice)
    contractsCreated: Transaction[];
    contractsInteracted: Set<string>;
    allTransactions: Transaction[];
    contractInteractionCounts: Map<string, number>;
    isOlderThan3Months: boolean;
  }


  // Function to calculate wallet score
  const calculateWalletScore = (walletData: WalletData): WalletScore => {
    // Transaction Points: 0.1 per transaction, max 100 points
    const transactionsScore = Math.min(walletData.allTransactions.length * 0.1, 100);

    // Unique Days: 0.5 points per unique day (no cap)
    const uniqueDaysScore = walletData.uniqueDays.size * 0.5;

    // Unique Weeks: 0.7 points per unique week (no cap)
    const uniqueWeeksScore = walletData.uniqueWeeks.size * 0.7;

    // Unique Months: 1 point per unique month (no cap)
    const uniqueMonthsScore = walletData.uniqueMonths.size * 1.0;

    // Wallet Age Bonus: +5 points if wallet is older than 3 months
    const walletAgeBonusScore = walletData.isOlderThan3Months ? 5 : 0;

    // Unique Contract Interaction: 0.5 points per unique contract interacted with, max 50 points
    const contractInteractionScore = Math.min(walletData.contractsInteracted.size * 0.5, 50);

    // Contract Deployment: 0.5 points per contract deployed, max 5 points
    const contractCreationScore = Math.min(walletData.contractsCreated.length * 0.5, 5);

    // Volume: 0.01 points per 1 SAHARA volume, max 1000 points
    const volumeScore = Math.min(walletData.totalVolume * 0.01, 1000);

    const totalScore =
      transactionsScore +
      uniqueDaysScore +
      uniqueWeeksScore +
      uniqueMonthsScore +
      walletAgeBonusScore +
      contractInteractionScore +
      contractCreationScore +
      volumeScore;

    return {
      totalScore,
      transactionsScore,
      contractCreationScore,
      contractInteractionScore,
      volumeScore,
      uniqueDaysScore,
      uniqueWeeksScore,
      uniqueMonthsScore,
      walletAgeBonusScore
    };
  };

  const isValidEthAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value.trim();
    setWalletAddress(address);
    setIsValidAddress(address === '' || isValidEthAddress(address));
  };

  const fetchBalance = async (address: string): Promise<string> => {
    try {
      const provider = new JsonRpcProvider(SAHARA_RPC_URL);
      const balanceWei = await provider.getBalance(address);
      return ethers.formatUnits(balanceWei, CHAIN_DECIMALS); // Using CHAIN_DECIMALS
    } catch (error) {
      console.error('Error fetching balance:', error);
      setError(`Error fetching balance. Please check the RPC connection and address. Details: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  };

  const fetchAccountCounters = async (address: string): Promise<CountersResponse> => {
    try {
      const url = `${SAHARA_EXPLORER_URL}/api/v2/addresses/${address}/counters`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error fetching account counters from ${url}: ${response.status} ${errorText}`);
        throw new Error(`Failed to fetch account counters: ${response.status} ${errorText}`);
      }
      const data: CountersResponse = await response.json();
      setApiDebugInfo(prev => prev + `\nCounters API URL: ${url}\nCounters Response: ${JSON.stringify(data, null, 2)}`);
      return data;
    } catch (error) {
      console.error('Error fetching account counters:', error);
      setError(`Error fetching account counters. Details: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  };

  // Function to fetch transactions from Sahara AI Explorer API
  const fetchSaharaTransactions = async (address: string): Promise<SaharaTransactionItem[]> => {
    let allItems: SaharaTransactionItem[] = [];
    // 'nextPageParamsFromApi' will hold the object directly from the API response.
    let nextPageParamsFromApi: SaharaTransactionResponse['next_page_params'] | undefined = undefined;
    let firstRequest = true;
    let url = '';

    do {
      // Base URL for fetching transactions
      url = `${SAHARA_EXPLORER_URL}/api/v2/addresses/${address}/transactions?filter=to%20%7C%20from`;

      if (!firstRequest && nextPageParamsFromApi) {
        // Construct query parameters from nextPageParamsFromApi for subsequent requests
        const params = new URLSearchParams();
        params.append('block_number', String(nextPageParamsFromApi.block_number));
        params.append('fee', nextPageParamsFromApi.fee);
        params.append('hash', nextPageParamsFromApi.hash);
        params.append('index', String(nextPageParamsFromApi.index));
        params.append('inserted_at', nextPageParamsFromApi.inserted_at);
        // The API includes items_count in next_page_params, so we pass it along.
        params.append('items_count', String(nextPageParamsFromApi.items_count));
        params.append('value', nextPageParamsFromApi.value);

        url += `&${params.toString()}`;
      }

      try {
        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error fetching transactions from ${url}: ${response.status} ${errorText}`);
          throw new Error(`Failed to fetch transactions page: ${response.status} ${errorText}`);
        }
        const data: SaharaTransactionResponse = await response.json();
        setApiDebugInfo(prev => (prev ?? '') + `\nTransactions API URL: ${url}\nTransactions Page Response: ${JSON.stringify(data, null, 2)}`);

        if (data.items && data.items.length > 0) {
          allItems = allItems.concat(data.items);
        }

        nextPageParamsFromApi = data.next_page_params;
        firstRequest = false;

        // Add a small delay to be polite to the API if there are more pages
        if (nextPageParamsFromApi) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }

      } catch (error) {
        console.error('Error fetching Sahara transactions page:', error);
        setError(`Error fetching transactions. Details: ${error instanceof Error ? error.message : String(error)}`);
        throw error; // Stop fetching if one page fails
      }
    } while (nextPageParamsFromApi); // Continue as long as the API provides parameters for the next page

    return allItems;
  };

  // Adapter function to convert SaharaTransactionItem to common Transaction format
  const adaptSaharaTransaction = (saharaTx: SaharaTransactionItem): Transaction => {
    return {
      hash: saharaTx.hash,
      from: saharaTx.from.hash,
      to: saharaTx.to ? saharaTx.to.hash : null, // Handle null 'to' for contract creations
      value: saharaTx.value, // Already in wei or smallest unit
      timeStamp: String(parseISO(saharaTx.timestamp).getTime() / 1000), // Convert ISO to Unix timestamp string
      gas: saharaTx.gas_limit, // Using gas_limit as 'gas'
      gasPrice: saharaTx.gas_price,
      gasUsed: saharaTx.gas_used,
      blockNumber: String(saharaTx.block_number),
      isError: saharaTx.result === 'success' && saharaTx.status === 'ok' ? '0' : '1',
      input: saharaTx.raw_input,
      contractAddress: saharaTx.created_contract ? saharaTx.created_contract.hash : undefined,
      txreceipt_status: saharaTx.result === 'success' && saharaTx.status === 'ok' ? '1' : '0',
      nonce: String(saharaTx.nonce),
      confirmations: String(saharaTx.confirmations),
      method: saharaTx.method,
    };
  };

  const fetchAllTransactions = async (address: string): Promise<Transaction[]> => {
    const saharaTransactions = await fetchSaharaTransactions(address);
    return saharaTransactions.map(adaptSaharaTransaction);
  };

  const processTransactions = (transactions: Transaction[], address: string): Partial<WalletData> & { isOlderThan3Months?: boolean } => {
    if (!transactions || transactions.length === 0) {
      return {
        firstTransaction: null,
        walletAge: 'N/A',
        firstTxDate: 'N/A',
        uniqueDays: new Set(),
        uniqueWeeks: new Set(),
        uniqueMonths: new Set(),
        totalVolume: 0,
        totalGasSpent: 0,
        contractsCreated: [],
        contractsInteracted: new Set(),
        allTransactions: [],
        contractInteractionCounts: new Map(),
        isOlderThan3Months: false,
      };
    }

    // Sort transactions by timestamp (ascending) to find the first one easily
    const sortedTransactions = [...transactions].sort((a, b) => parseInt(a.timeStamp) - parseInt(b.timeStamp));
    const firstTransaction = sortedTransactions[0];
    const firstTxDate = format(new Date(parseInt(firstTransaction.timeStamp) * 1000), 'PPpp');
    const walletAge = formatDistanceToNow(new Date(parseInt(firstTransaction.timeStamp) * 1000), { addSuffix: true });

    const uniqueDays = new Set<string>();
    const uniqueWeeks = new Set<string>();
    const uniqueMonths = new Set<string>();
    let totalVolume = 0;
    let totalGasSpent = 0;
    const contractsCreated: Transaction[] = [];
    const contractsInteracted = new Set<string>();
    const contractInteractionCounts = new Map<string, number>();

    transactions.forEach(tx => {
      const txDate = new Date(parseInt(tx.timeStamp) * 1000);
      uniqueDays.add(format(txDate, 'yyyy-MM-dd'));
      uniqueWeeks.add(format(txDate, 'yyyy-') + format(txDate, 'II')); // ISO week number
      uniqueMonths.add(format(txDate, 'yyyy-MM'));

      // Calculate volume (assuming tx.value is in wei or smallest unit)
      // Only add to volume if the transaction is outgoing from the wallet or incoming to the wallet.
      // For Sahara, value is already in the smallest unit.
      if (tx.from.toLowerCase() === address.toLowerCase() || (tx.to && tx.to.toLowerCase() === address.toLowerCase())) {
        totalVolume += parseFloat(ethers.formatUnits(tx.value, CHAIN_DECIMALS));
      }

      // Calculate gas spent (gasUsed * gasPrice, assuming both are in wei or smallest unit)
      const gasSpent = BigInt(tx.gasUsed) * BigInt(tx.gasPrice);
      totalGasSpent += parseFloat(ethers.formatUnits(gasSpent, CHAIN_DECIMALS));

      // Check for contract creation
      if (tx.contractAddress && tx.from.toLowerCase() === address.toLowerCase()) {
        contractsCreated.push(tx);
      }

      // Check for contract interaction
      // A contract interaction is when the 'to' address is a contract and it's not a simple transfer (input not '0x')
      // or if the transaction created a contract. For Sahara, their API notes if 'to' is_contract.
      // We can also check `tx.method` for Sahara.
      if (tx.to) { // Ensure 'to' is not null
        const toAddressLower = tx.to.toLowerCase();
        if (tx.input !== '0x' && tx.input !== '' && toAddressLower !== address.toLowerCase()) {
          // A more robust check for contract interaction would be to see if 'to' is a known contract
          // or if the transaction receipt indicates a contract interaction.
          // For Sahara, we rely on `tx.to.is_contract` or method. If `method` exists, it's an interaction.
          // The provided Sahara data does not directly give `is_contract` for `to` in the `TransactionItem`.
          // We infer interaction if there's a method or input data.
          if (tx.method || (tx.input && tx.input !== '0x')) {
            contractsInteracted.add(toAddressLower);
            contractInteractionCounts.set(toAddressLower, (contractInteractionCounts.get(toAddressLower) || 0) + 1);
          }
        }
      }
    });

    let isOlderThan3Months = false;
    if (firstTransaction) {
      const firstTxTimestamp = parseInt(firstTransaction.timeStamp) * 1000;
      const now = new Date();
      // Ensure date-fns is imported for differenceInMonths
      isOlderThan3Months = differenceInMonths(now, new Date(firstTxTimestamp)) >= 3;
    }

    return {
      firstTransaction,
      walletAge,
      firstTxDate,
      uniqueDays,
      uniqueWeeks,
      uniqueMonths,
      totalVolume,
      totalGasSpent,
      contractsCreated,
      contractsInteracted,
      allTransactions: sortedTransactions, // Store all (sorted) transactions
      contractInteractionCounts,
      isOlderThan3Months,
    };
  };

  // Helper to parse timestamp if it comes in a different format, Sahara is ISO 8601
  const parseTimestamp = (timestamp: string): Date | number => {
    // Sahara provides ISO 8601 like "2025-05-27T06:45:16.000000Z"
    const date = parseISO(timestamp);
    if (!isNaN(date.getTime())) {
      return date;
    }
    // Fallback for Unix timestamp (seconds or milliseconds)
    const num = Number(timestamp);
    if (!isNaN(num)) {
      return num.toString().length === 10 ? num * 1000 : num;
    }
    return new Date(); // Should not happen with Sahara
  };


  const formatEthBalance = (balance: string): string => {
    const num = parseFloat(balance);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  const fetchWalletData = async () => {
    if (!isValidEthAddress(walletAddress)) {
      setError('Invalid wallet address.');
      setWalletData(null);
      setWalletScore(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setApiDebugInfo('Starting data fetch...\n');
    setWalletData(null);
    setWalletScore(null);
    setTotalTxCount(0);

    try {
      const balance = await fetchBalance(walletAddress);
      setApiDebugInfo(prev => prev + `Balance: ${balance} ${CHAIN_SYMBOL}\n`);

      const counters = await fetchAccountCounters(walletAddress);
      setApiDebugInfo(prev => prev + `Counters: Tx=${counters.transactions_count}, Tokens=${counters.token_transfers_count}, Gas=${counters.gas_usage_count}\n`);

      const transactionsCount = parseInt(counters.transactions_count, 10);
      const tokenTransfersCount = parseInt(counters.token_transfers_count, 10); // Assuming this is from Sahara
      const gasUsageCount = counters.gas_usage_count;

      setTotalTxCount(transactionsCount);

      const allTransactions = await fetchAllTransactions(walletAddress);
      setApiDebugInfo(prev => prev + `Total transactions fetched: ${allTransactions.length}\n`);

      if (allTransactions.length === 0 && transactionsCount > 0) {
        console.warn(`Mismatch: Counters API shows ${transactionsCount} txs, but explorer API returned 0.`);
        setApiDebugInfo(prev => prev + `WARNING: Tx count mismatch. Counters: ${transactionsCount}, Explorer: 0.\nCheck explorer API for address: ${SAHARA_EXPLORER_URL}/address/${walletAddress}\n`);
      }
      if (allTransactions.length !== transactionsCount && transactionsCount > 0) {
        console.warn(`Tx count discrepancy: Counters API reports ${transactionsCount}, but fetched ${allTransactions.length} from explorer.`);
        setApiDebugInfo(prev => prev + `WARNING: Tx count discrepancy. Counters: ${transactionsCount}, Explorer: ${allTransactions.length}. Using explorer count for details.\n`);
      }


      const processedData = processTransactions(allTransactions, walletAddress);

      const fullWalletData: WalletData = {
        address: walletAddress,
        balance,
        transactionsCount: transactionsCount,
        tokenTransfersCount: tokenTransfersCount,
        gasUsageCount: gasUsageCount,
        firstTransaction: processedData.firstTransaction ?? null,
        walletAge: processedData.walletAge ?? 'N/A',
        firstTxDate: processedData.firstTxDate ?? 'N/A',
        uniqueDays: processedData.uniqueDays ?? new Set<string>(),
        uniqueWeeks: processedData.uniqueWeeks ?? new Set<string>(),
        uniqueMonths: processedData.uniqueMonths ?? new Set<string>(),
        totalVolume: processedData.totalVolume ?? 0,
        totalGasSpent: processedData.totalGasSpent ?? 0,
        contractsCreated: processedData.contractsCreated ?? [],
        contractsInteracted: processedData.contractsInteracted ?? new Set<string>(),
        allTransactions: processedData.allTransactions ?? [],
        contractInteractionCounts: processedData.contractInteractionCounts ?? new Map<string, number>(),
        isOlderThan3Months: processedData.isOlderThan3Months ?? false,
      };

      setWalletData(fullWalletData);

      if (fullWalletData.allTransactions.length > 0 || fullWalletData.contractsCreated.length > 0 || fullWalletData.contractsInteracted.size > 0) {
        const score = calculateWalletScore(fullWalletData);
        setWalletScore(score);
        setApiDebugInfo(prev => prev + `Wallet Score Calculated: ${JSON.stringify(score, null, 2)}\n`);
      } else {
        setWalletScore(null);
        setApiDebugInfo(prev => prev + `No score calculated due to no activity.\n`);
      }

    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setApiDebugInfo(prev => prev + `Error encountered: ${err instanceof Error ? err.message : String(err)}\n`);
    } finally {
      setIsLoading(false);
      setApiDebugInfo(prev => prev + 'Fetch complete.\n');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (walletAddress && isValidAddress) {
      fetchWalletData();
    } else if (!isValidAddress) {
      setError("Invalid wallet address format.");
    } else {
      setError("Please enter a wallet address.");
    }
  };

  const formatAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (timestamp: string | number) => {
    if (!timestamp) return 'N/A';
    try {
      const date = typeof timestamp === 'string' && timestamp.includes('T') ? parseISO(timestamp) : new Date(Number(timestamp) * 1000);
      return format(date, 'PPpp');
    } catch (e) {
      console.error("Error formatting date:", timestamp, e);
      return "Invalid Date";
    }
  };

  const generateTwitterShareText = () => {
    if (!walletData || !walletScore) return '';
    const text = `Check out my ${CHAIN_NAME} stats! 🚀
Address: ${formatAddress(walletData.address)}
Transactions: ${walletData.transactionsCount}
Volume: ${walletData.totalVolume.toFixed(2)} ${CHAIN_SYMBOL}
Score: ${walletScore.totalScore.toFixed(2)}
Full details: https://cryptowalletsx.com/sahara-ai-stats-checker?address=${walletData.address}
#${CHAIN_NAME.replace(/\s+/g, '')} #SaharaAI #${CHAIN_SYMBOL.replace('$', '')} #CryptoWalletsX`;
    return encodeURIComponent(text);
  };

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${generateTwitterShareText()}`;
    window.open(twitterUrl, '_blank');
  };

  // Auto-fetch data if address is in URL query params
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const addressFromQuery = queryParams.get('address');
    if (addressFromQuery && isValidEthAddress(addressFromQuery)) {
      setWalletAddress(addressFromQuery);
      setIsValidAddress(true);
      // Trigger fetch: Wrap in a timeout to ensure state update for walletAddress is processed
      setTimeout(() => fetchWalletData(), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount.

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg p-6 md:p-10 border border-gray-200">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-green-600 to-green-700 mb-3">
            {CHAIN_NAME} Stats Checker
          </h1>
          <p className="text-lg text-gray-600">
            Enter your wallet address to check your activity on the {CHAIN_NAME}.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mb-8 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-grow w-full sm:w-auto">
            <input
              type="text"
              value={walletAddress}
              onChange={handleAddressChange}
              placeholder="Enter 0x... wallet address"
              className={`w-full px-4 py-3 rounded-lg bg-white text-gray-700 border ${isValidAddress ? 'border-gray-300' : 'border-red-500'
                } focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300 shadow-sm placeholder-gray-400`}
            />
            {!isValidAddress && walletAddress && (
              <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">Invalid address format.</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || !isValidAddress || !walletAddress}
            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking...
              </>
            ) : (
              <>
                <Search size={18} /> Check Stats
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg shadow-md animate-fadeIn">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-10">
            <div className="animate-pulse">
              <Cpu size={48} className="mx-auto text-green-600 mb-3" />
              <p className="text-xl text-gray-600">Fetching wallet data from {CHAIN_NAME}...</p>
              <p className="text-sm text-gray-500">This might take a moment.</p>
            </div>
          </div>
        )}

        {!isLoading && walletData && (
          <div className="space-y-8 animate-fadeIn">
            {/* Wallet Overview Section */}
            <section className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-green-700 flex items-center gap-2">
                  <Wallet size={24} /> Wallet Overview
                </h2>
                <a
                  href={`${SAHARA_EXPLORER_URL}/address/${walletData.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:text-green-500 transition-colors flex items-center gap-1"
                  title="View on Explorer"
                >
                  View on Explorer <ExternalLink size={14} />
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-500">Address:</span>
                  <span className="text-gray-700 font-mono break-all" title={walletData.address}>
                    {formatAddress(walletData.address)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-500">Balance:</span>
                  <span className="text-gray-700 font-semibold">
                    {formatEthBalance(walletData.balance)} {CHAIN_SYMBOL}
                  </span>
                </div>
                {walletData.firstTxDate !== 'N/A' && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-500">First Transaction:</span>
                      <span className="text-gray-700">{walletData.firstTxDate}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-500">Wallet Age:</span>
                      <span className="text-gray-700">{walletData.walletAge}</span>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Score Section */}
            {walletScore && (
              <section className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-green-700 flex items-center gap-2">
                    <Award size={24} /> Wallet Score
                  </h2>
                  <button
                    onClick={shareOnTwitter}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                    title="Share your score on Twitter"
                  >
                    <Twitter size={14} /> Share
                  </button>
                </div>
                <div className="text-center mb-4">
                  <p className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-green-600 to-green-700">
                    {walletScore.totalScore.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-center mb-6">
                  <Link href="/post/sahara-ai-score-calculation" legacyBehavior>
                    <a className="text-sm text-green-600 hover:text-green-700 underline hover:no-underline transition-colors inline-flex items-center gap-1">
                      How is this score calculated? <Info size={14} />
                    </a>
                  </Link>
                </div>

                <h3 className="text-lg font-semibold text-gray-700 mb-3 mt-6 pt-4 border-t border-gray-200">Score Breakdown:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {[
                    { label: "Transactions", score: walletScore.transactionsScore, icon: <FileText size={16} className="text-green-600" /> },
                    { label: "Contract Creations", score: walletScore.contractCreationScore, icon: <Cpu size={16} className="text-green-600" /> },
                    { label: "Contract Interactions", score: walletScore.contractInteractionScore, icon: <Zap size={16} className="text-green-600" /> },
                    { label: "Volume", score: walletScore.volumeScore, icon: <Coins size={16} className="text-green-600" /> },
                    { label: "Unique Days Active", score: walletScore.uniqueDaysScore, icon: <Calendar size={16} className="text-green-600" /> },
                    { label: "Unique Weeks Active", score: walletScore.uniqueWeeksScore, icon: <Calendar size={16} className="text-green-600" /> },
                    { label: "Unique Months Active", score: walletScore.uniqueMonthsScore, icon: <Calendar size={16} className="text-green-600" /> },
                    { label: "Wallet Age Bonus (>3mo)", score: walletScore.walletAgeBonusScore, icon: <Star size={16} className="text-green-600" /> },
                  ].map(item => (
                    <div key={item.label} className="bg-white p-3.5 rounded-lg flex items-center justify-between border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <span className="text-gray-600">{item.label}:</span>
                      </div>
                      <span className="font-semibold text-gray-800 bg-green-50 px-2 py-1 rounded-md border border-green-200">
                        {item.score.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} pts
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Activity Stats Section */}
            <section className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-2xl font-semibold text-green-700 mb-4 flex items-center gap-2">
                <Activity size={24} /> Activity Stats
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                {[
                  { label: "Total Transactions", value: walletData.transactionsCount.toLocaleString(), icon: <FileText size={18} className="text-green-600" /> },
                  { label: "Token Transfers", value: walletData.tokenTransfersCount.toLocaleString(), icon: <Package size={18} className="text-green-600" /> },
                  { label: "Total Volume", value: `${walletData.totalVolume.toFixed(4)} ${CHAIN_SYMBOL}`, icon: <Coins size={18} className="text-green-600" /> },
                  { label: "Total Gas Spent", value: `${walletData.totalGasSpent.toFixed(6)} ${CHAIN_SYMBOL}`, icon: <Zap size={18} className="text-green-600" /> },
                  { label: "Contracts Created", value: walletData.contractsCreated.length.toLocaleString(), icon: <Cpu size={18} className="text-green-600" /> },
                  { label: "Unique Contracts Interacted", value: walletData.contractsInteracted.size.toLocaleString(), icon: <Zap size={18} className="text-green-600" /> },
                  { label: "Unique Days Active", value: walletData.uniqueDays.size.toLocaleString(), icon: <Calendar size={18} className="text-green-600" /> },
                  { label: "Unique Weeks Active", value: walletData.uniqueWeeks.size.toLocaleString(), icon: <Calendar size={18} className="text-green-600" /> },
                  { label: "Unique Months Active", value: walletData.uniqueMonths.size.toLocaleString(), icon: <Calendar size={18} className="text-green-600" /> },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between py-2.5 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-gray-500">
                      {stat.icon} {stat.label}:
                    </div>
                    <span className="text-gray-700 font-medium">{stat.value}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Contracts Created Section */}
            <section className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Cpu size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-green-700">
                      Contracts Created
                    </h2>
                    <span className="text-xs text-gray-500">
                      {walletData.contractsCreated.length} contract{walletData.contractsCreated.length === 1 ? '' : 's'} deployed
                    </span>
                  </div>
                </div>
                <button onClick={() => setShowCreatedContracts(!showCreatedContracts)} className="text-sm text-green-600 hover:text-green-500 transition-colors flex items-center gap-1 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md border border-green-200">
                  {showCreatedContracts ? <EyeOff size={16} /> : <Eye size={16} />} {showCreatedContracts ? 'Hide' : 'Show'}
                </button>
              </div>
              {showCreatedContracts && (
                walletData.contractsCreated.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                    <table className="min-w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contract Address</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creation Date</th>
                          <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {walletData.contractsCreated.map(tx => (
                          <tr key={tx.hash} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-700">
                              <a href={`${SAHARA_EXPLORER_URL}/address/${tx.contractAddress}`} target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors" title={tx.contractAddress}>
                                {formatAddress(tx.contractAddress!)} <ExternalLink size={12} className="inline-block ml-1" />
                              </a>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(tx.timeStamp)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                              <a href={`${SAHARA_EXPLORER_URL}/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-500 transition-colors font-mono" title={tx.hash}>
                                {formatAddress(tx.hash)} <ExternalLink size={12} className="inline-block ml-1" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-white rounded-lg border border-gray-200">
                    <Cpu size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No contracts created by this wallet.</p>
                  </div>
                )
              )}
            </section>

            {/* Interacted Contracts Section */}
            <section className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Zap size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-green-700">
                      Contracts Interacted With
                    </h2>
                    <span className="text-xs text-gray-500">
                      {walletData.contractsInteracted.size} unique contract{walletData.contractsInteracted.size === 1 ? '' : 's'},&nbsp;
                      {Array.from(walletData.contractInteractionCounts.values()).reduce((sum, count) => sum + count, 0)} total interactions
                    </span>
                  </div>
                </div>
                <button onClick={() => setShowInteractedContracts(!showInteractedContracts)} className="text-sm text-green-600 hover:text-green-500 transition-colors flex items-center gap-1 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md border border-green-200">
                  {showInteractedContracts ? <EyeOff size={16} /> : <Eye size={16} />} {showInteractedContracts ? 'Hide' : 'Show'}
                </button>
              </div>
              {showInteractedContracts && (
                walletData.contractsInteracted.size > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                    <table className="min-w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contract Address</th>
                          <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Interactions</th>
                          <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Explorer</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {Array.from(walletData.contractsInteracted).sort((a, b) => (walletData.contractInteractionCounts.get(b) || 0) - (walletData.contractInteractionCounts.get(a) || 0)).map(address => (
                          <tr key={address} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-700">
                              <a href={`${SAHARA_EXPLORER_URL}/address/${address}`} target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors" title={address}>
                                {formatAddress(address)}
                              </a>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">
                              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium border border-green-200">
                                {walletData.contractInteractionCounts.get(address) || 0}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                              <a href={`${SAHARA_EXPLORER_URL}/address/${address}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-500 transition-colors">
                                View <ExternalLink size={12} className="inline-block ml-1" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-white rounded-lg border border-gray-200">
                    <Zap size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No contract interactions found for this wallet.</p>
                  </div>
                )
              )}
            </section>

            {/* All Transactions Section */}
            {walletData.allTransactions.length > 0 && (
              <section className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-green-700 flex items-center gap-2">
                    <FileText size={20} /> All Transactions ({totalTxCount > walletData.allTransactions.length ? `${walletData.allTransactions.length} shown / ${totalTxCount} total` : walletData.allTransactions.length})
                  </h2>
                  <button onClick={() => setShowAllTransactions(!showAllTransactions)} className="text-sm text-green-600 hover:text-green-500 transition-colors flex items-center gap-1 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md border border-green-200">
                    {showAllTransactions ? <EyeOff size={16} /> : <Eye size={16} />} {showAllTransactions ? 'Hide' : 'Show All'}
                  </button>
                </div>
                {totalTxCount > walletData.allTransactions.length && walletData.allTransactions.length < 50 && (
                  <p className="text-xs text-yellow-500 mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                    Note: Explorer API returned fewer transactions ({walletData.allTransactions.length}) than reported by counters ({totalTxCount}). Displaying available data.
                    This can happen with new wallets or if the explorer API has indexing delays.
                  </p>
                )}
                {walletData.allTransactions.length >= 50 && totalTxCount > walletData.allTransactions.length && (
                  <p className="text-xs text-yellow-500 mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                    Displaying the latest {walletData.allTransactions.length} transactions out of {totalTxCount} total. Full history on explorer.
                  </p>
                )}
                {showAllTransactions && (
                  <div className="space-y-3 text-xs max-h-96 overflow-y-auto pr-2 custom-scrollbar-light">
                    {walletData.allTransactions.slice(0).reverse().map((tx, index) => ( // Reverse to show latest first
                      <div key={tx.hash + index} className={`p-3 rounded-lg ${tx.isError === '1' || tx.txreceipt_status === '0' ? 'bg-red-50 border border-red-200' : 'bg-white border border-gray-200 shadow-sm'}`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Hash:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-gray-700" title={tx.hash}>{formatAddress(tx.hash)}</span>
                              <a href={`${SAHARA_EXPLORER_URL}/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-500">
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Date:</span>
                            <span className="text-gray-700">{formatDate(tx.timeStamp)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">From:</span>
                            <span className={`font-mono ${tx.from.toLowerCase() === walletData.address.toLowerCase() ? 'text-orange-500' : 'text-gray-700'}`} title={tx.from}>
                              {formatAddress(tx.from)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">To:</span>
                            <span className={`font-mono ${tx.to && tx.to.toLowerCase() === walletData.address.toLowerCase() ? 'text-teal-500' : 'text-gray-700'}`} title={tx.to ?? 'N/A'}>
                              {tx.to ? formatAddress(tx.to) : (tx.contractAddress ? 'Contract Deployed' : 'N/A')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Value:</span>
                            <span className="text-gray-800 font-semibold">{parseFloat(ethers.formatUnits(tx.value, CHAIN_DECIMALS)).toFixed(6)} {CHAIN_SYMBOL}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Gas Fee:</span>
                            <span className="text-gray-700">{parseFloat(ethers.formatUnits(BigInt(tx.gasUsed) * BigInt(tx.gasPrice), CHAIN_DECIMALS)).toFixed(8)} {CHAIN_SYMBOL}</span>
                          </div>
                          {tx.method && (
                            <div className="flex justify-between items-center col-span-full sm:col-span-1">
                              <span className="text-gray-500">Method:</span>
                              <span className="text-gray-700 truncate max-w-[150px] sm:max-w-[200px]" title={tx.method}>{tx.method}</span>
                            </div>
                          )}
                          {(tx.isError === '1' || tx.txreceipt_status === '0') && (
                            <div className="col-span-full text-center text-red-600 text-[11px] font-semibold p-1 bg-red-100 rounded-b-md border-t border-red-200">
                              Failed Transaction
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {walletData.allTransactions.length === 0 && walletData.transactionsCount > 0 && !isLoading && (
              <section className="bg-yellow-50 p-6 rounded-xl shadow-lg border border-yellow-200 text-center">
                <Info size={24} className="mx-auto text-yellow-500 mb-2" />
                <p className="text-yellow-700">
                  The Counters API indicates {walletData.transactionsCount} transactions, but the Explorer API did not return detailed transaction data for this address.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  This can sometimes happen for very new wallets or if the explorer is experiencing indexing delays. You can check directly on the <a href={`${SAHARA_EXPLORER_URL}/address/${walletData.address}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Sahara AI Explorer</a>.
                </p>
              </section>
            )}

            {walletData.allTransactions.length === 0 && walletData.transactionsCount === 0 && !isLoading && (
              <section className="bg-gray-100 p-6 rounded-xl shadow-lg border border-gray-200 text-center">
                <Info size={24} className="mx-auto text-gray-500 mb-2" />
                <p className="text-gray-700">No transactions found for this address on {CHAIN_NAME}.</p>
              </section>
            )}

          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar-light::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar-light::-webkit-scrollbar-track {
          background: #f1f1f1; 
          border-radius: 10px;
        }
        .custom-scrollbar-light::-webkit-scrollbar-thumb {
          background: #ccc; 
          border-radius: 10px;
        }
        .custom-scrollbar-light::-webkit-scrollbar-thumb:hover {
          background: #bbb; 
        }
      `}</style>
    </div>
  );
} 