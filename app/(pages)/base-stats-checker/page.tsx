'use client';

import { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { ExternalLink, Search, Loader2, AlertCircle, TrendingUp, Zap, Activity, Clock, Calendar, Frame, Boxes, Building2, Users, ImageIcon, Coins, ChevronDown, ChevronUp, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { JsonRpcProvider } from 'ethers';

// Constants for API and Explorer
const BASE_DOMAIN_API_URL = 'https://bens.services.blockscout.com/api/v1/8453/domains';
const BASE_RPC_URL = 'https://base-rpc.publicnode.com';
const BASE_COUNTERS_API_URL = 'https://base.blockscout.com/api/v2/addresses';
const BASE_TRANSACTIONS_API_URL = 'https://api.routescan.io/v2/network/mainnet/evm/8453/etherscan/api';
const BASE_NFT_API_URL = 'https://base.blockscout.com/api/v2/addresses';
const BASE_TOKEN_API_URL = 'https://base.blockscout.com/api/v2/addresses';
const BASE_EXPLORER_URL = 'https://basescan.org';
const ALCHEMY_API_KEY = 'kdP7I6BPv7RcZGjrVqzLexheN0IpEhas';
const ALCHEMY_BASE_URL = 'https://base-mainnet.g.alchemy.com/nft/v3';
const ALCHEMY_ETH_URL = 'https://eth-mainnet.g.alchemy.com/nft/v3';
const BASE_BUILDER_NFT_CONTRACT = '0x8DC80A209A3362f0586e6C116973Bb6908170c84';
const BASE_INTRODUCED_NFT_CONTRACT = '0xD4307E0acD12CF46fD6cf93BC264f5D5D1598792';
// Base bridge contract addresses
const BASE_BRIDGE_ADDRESS = '0x3154Cf16ccdb4C6d922629664174b904d80F2C35'.toLowerCase();
const BASE_PORTAL_ADDRESS = '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e'.toLowerCase();

// Component for Base Stats Checker
export default function BaseStatsChecker() {
    // State variables
    const [searchInput, setSearchInput] = useState('');
    const [resolvedAddress, setResolvedAddress] = useState('');
    const [isValidInput, setIsValidInput] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState('');
    const [walletData, setWalletData] = useState<WalletData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showAllTransactions, setShowAllTransactions] = useState(false);
    const [showContracts, setShowContracts] = useState(false);
    const [showInteractions, setShowInteractions] = useState(false);
    const [showNFTs, setShowNFTs] = useState(false);
    const [showTokens, setShowTokens] = useState(false);
    const [nfts, setNfts] = useState<NFTCollection[]>([]);
    const [tokens, setTokens] = useState<TokenHolding[]>([]);

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
    }

    interface CountersResponse {
        transactions_count: string;
        token_transfers_count: string;
        gas_usage_count: string;
        validations_count: string;
    }

    interface DomainResponse {
        id: string;
        name: string;
        owner: {
            hash: string;
        };
        resolved_address: {
            hash: string;
        };
    }

    interface NFTToken {
        address: string;
        name: string;
        symbol: string;
        type: string;
        total_supply: string;
        holders: string;
    }

    interface NFTMetadata {
        name: string;
        description: string;
        image?: string;
    }

    interface NFTInstance {
        id: string;
        image_url: string | null;
        metadata: NFTMetadata;
        token_type: string;
    }

    interface NFTCollection {
        amount: string;
        token: NFTToken;
        token_instances: NFTInstance[];
    }

    interface TokenData {
        address: string;
        name: string;
        symbol: string;
        decimals: string;
        total_supply: string;
        holders: string;
        type: string;
        icon_url?: string;
    }

    interface TokenHolding {
        token: TokenData;
        value: string;
    }

    interface WalletData {
        address: string;
        balance: string;
        transactionsCount: number;
        tokenTransfersCount: number;
        gasUsageCount: string;
        totalVolume: number;
        firstTransaction: Transaction | null;
        lastTransaction: Transaction | null;
        walletAge: string;
        walletAgeDays: number;
        firstTxDate: string;
        lastActivity: string;
        uniqueDays: number;
        uniqueWeeks: number;
        uniqueMonths: number;
        totalDeposited: number;
        isBaseBuilderNFTHolder: boolean;
        isBaseIntroducedNFTHolder: boolean;
        contractsCreated: Array<{ hash: string; timestamp: string; isVerified: boolean; name?: string }>;
        contractsInteracted: Array<{ address: string; name?: string; isVerified: boolean; interactionCount: number }>;
        allTransactions: Transaction[];
    }

    // Function to validate Ethereum address
    const isValidEthAddress = (address: string): boolean => {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    };

    // Function to check if input is a domain
    const isDomain = (input: string): boolean => {
        return input.includes('.') && !input.startsWith('0x');
    };

    // Handle search input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value.trim();
        setSearchInput(input);

        if (input === '') {
            setIsValidInput(true);
        } else if (isDomain(input)) {
            setIsValidInput(true);
        } else {
            setIsValidInput(isValidEthAddress(input));
        }
    };

    // Function to resolve domain to address
    const resolveDomain = async (domain: string): Promise<string> => {
        try {
            const url = `${BASE_DOMAIN_API_URL}/${domain}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Domain not found or resolution failed: ${response.status}`);
            }

            const data: DomainResponse = await response.json();

            if (!data.resolved_address?.hash) {
                throw new Error('Domain does not have a resolved address');
            }

            return data.resolved_address.hash;
        } catch (error) {
            console.error('Error resolving domain:', error);
            throw error;
        }
    };

    // Function to fetch balance using RPC
    const fetchBalance = async (address: string): Promise<string> => {
        try {
            const provider = new JsonRpcProvider(BASE_RPC_URL);
            const balanceWei = await provider.getBalance(address);
            return balanceWei.toString();
        } catch (error) {
            console.error('Error fetching balance:', error);
            throw error;
        }
    };

    // Function to fetch account counters
    const fetchAccountCounters = async (address: string): Promise<CountersResponse> => {
        try {
            const url = `${BASE_COUNTERS_API_URL}/${address}/counters`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to fetch account data: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching account counters:', error);
            throw error;
        }
    };

    // Function to fetch transactions with pagination
    const fetchTransactionsWithPagination = async (address: string, totalTxCount: number): Promise<Transaction[]> => {
        try {
            const PAGE_SIZE = 10000;
            const requiredPages = Math.ceil(totalTxCount / PAGE_SIZE);

            console.log(`Fetching ${totalTxCount} transactions across ${requiredPages} pages`);
            setLoadingProgress(`Fetching transactions (0/${requiredPages} pages)...`);

            const allTransactions: Transaction[] = [];

            for (let page = 1; page <= requiredPages; page++) {
                setLoadingProgress(`Fetching transactions (${page}/${requiredPages} pages)...`);

                const url = `${BASE_TRANSACTIONS_API_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=${PAGE_SIZE}&sort=asc&apikey=rs_8c4944a53f84cb626441b373`;

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`Failed to fetch transactions page ${page}: ${response.status}`);
                }

                const data = await response.json();

                if (data.status === "1" && Array.isArray(data.result)) {
                    allTransactions.push(...data.result);
                }

                // Small delay to avoid rate limiting
                if (page < requiredPages) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }

            console.log(`Successfully fetched ${allTransactions.length} transactions`);
            return allTransactions;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    };

    // Function to fetch NFTs
    const fetchNFTs = async (address: string): Promise<NFTCollection[]> => {
        try {
            const url = `${BASE_NFT_API_URL}/${address}/nft/collections?type=ERC-721,ERC-404,ERC-1155`;
            const response = await fetch(url);

            if (!response.ok) {
                console.error(`Failed to fetch NFTs: ${response.status}`);
                return [];
            }

            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error('Error fetching NFTs:', error);
            return [];
        }
    };

    // Function to fetch tokens
    const fetchTokens = async (address: string): Promise<TokenHolding[]> => {
        try {
            const url = `${BASE_TOKEN_API_URL}/${address}/tokens?type=ERC-20`;
            const response = await fetch(url);

            if (!response.ok) {
                console.error(`Failed to fetch tokens: ${response.status}`);
                return [];
            }

            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error('Error fetching tokens:', error);
            return [];
        }
    };

    // Function to check if wallet holds Base Builder NFT
    const checkBaseBuilderNFT = async (address: string): Promise<boolean> => {
        try {
            const url = `${ALCHEMY_BASE_URL}/${ALCHEMY_API_KEY}/isHolderOfContract?wallet=${address}&contractAddress=${BASE_BUILDER_NFT_CONTRACT}`;
            const response = await fetch(url);

            if (!response.ok) {
                console.error(`Failed to check Base Builder NFT: ${response.status}`);
                return false;
            }

            const data = await response.json();
            return data.isHolderOfContract === true;
        } catch (error) {
            console.error('Error checking Base Builder NFT:', error);
            return false;
        }
    };

    // Function to check if wallet holds Base Introduced NFT
    const checkBaseIntroducedNFT = async (address: string): Promise<boolean> => {
        try {
            const url = `${ALCHEMY_ETH_URL}/${ALCHEMY_API_KEY}/isHolderOfContract?wallet=${address}&contractAddress=${BASE_INTRODUCED_NFT_CONTRACT}`;
            const response = await fetch(url);

            if (!response.ok) {
                console.error(`Failed to check Base Introduced NFT: ${response.status}`);
                return false;
            }

            const data = await response.json();
            return data.isHolderOfContract === true;
        } catch (error) {
            console.error('Error checking Base Introduced NFT:', error);
            return false;
        }
    };

    // Function to get ISO week number
    const getISOWeek = (date: Date): number => {
        const target = new Date(date.valueOf());
        const dayNum = (date.getUTCDay() + 6) % 7;
        target.setUTCDate(target.getUTCDate() - dayNum + 3);
        const firstThursday = target.valueOf();
        target.setUTCMonth(0, 1);
        if (target.getUTCDay() !== 4) {
            target.setUTCMonth(0, 1 + ((4 - target.getUTCDay()) + 7) % 7);
        }
        return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    };

    // Process transactions to calculate stats
    const processTransactions = (transactions: Transaction[], address: string) => {
        const uniqueDatesSet = new Set<string>();
        const uniqueWeeksSet = new Set<string>();
        const uniqueMonthsSet = new Set<string>();
        const createdContracts: Array<{ hash: string; timestamp: string; isVerified: boolean; name?: string }> = [];
        const contractInteractions = new Map<string, { name?: string; isVerified: boolean; count: number }>();
        let firstTransaction: Transaction | null = null;
        let lastTransaction: Transaction | null = null;
        let totalGasSpentWei = BigInt(0);
        let totalDepositedWei = BigInt(0);
        let bridgeUsed = false;

        transactions.forEach(tx => {
            const txDate = new Date(Number(tx.timeStamp) * 1000);

            // Find first transaction
            if (!firstTransaction || txDate < new Date(Number(firstTransaction.timeStamp) * 1000)) {
                firstTransaction = tx;
            }

            // Find last transaction
            if (!lastTransaction || txDate > new Date(Number(lastTransaction.timeStamp) * 1000)) {
                lastTransaction = tx;
            }

            // Track bridge usage - check if transaction is to/from Base bridge
            if (tx.to && (tx.to.toLowerCase() === BASE_BRIDGE_ADDRESS || tx.to.toLowerCase() === BASE_PORTAL_ADDRESS)) {
                bridgeUsed = true;
            }
            if (tx.from && (tx.from.toLowerCase() === BASE_BRIDGE_ADDRESS || tx.from.toLowerCase() === BASE_PORTAL_ADDRESS)) {
                bridgeUsed = true;
            }

            // Calculate total deposited (incoming transactions to this wallet)
            if (tx.to && tx.to.toLowerCase() === address.toLowerCase()) {
                const value = BigInt(tx.value || 0);
                totalDepositedWei += value;
            }

            // Calculate gas spent (only for transactions from this address)
            if (tx.from.toLowerCase() === address.toLowerCase()) {
                const gasUsed = BigInt(tx.gasUsed || 0);
                const gasPrice = BigInt(tx.gasPrice || 0);
                totalGasSpentWei += gasUsed * gasPrice;
            }

            // Track unique dates, weeks, months
            uniqueDatesSet.add(txDate.toISOString().split('T')[0]);

            const year = txDate.getFullYear();
            const weekNum = getISOWeek(txDate);
            uniqueWeeksSet.add(`${year}-W${weekNum}`);

            uniqueMonthsSet.add(`${year}-${(txDate.getMonth() + 1).toString().padStart(2, '0')}`);

            // Track contract creations
            if (tx.from.toLowerCase() === address.toLowerCase() && tx.contractAddress && tx.contractAddress !== '') {
                createdContracts.push({
                    hash: tx.contractAddress,
                    timestamp: new Date(Number(tx.timeStamp) * 1000).toISOString(),
                    isVerified: false,
                    name: undefined
                });
            }

            // Track contract interactions
            if (tx.from.toLowerCase() === address.toLowerCase() && tx.to && tx.input && tx.input.length > 2 && tx.input !== '0x') {
                const contractAddress = tx.to.toLowerCase();
                const current = contractInteractions.get(contractAddress) || {
                    isVerified: false,
                    count: 0
                };
                current.count++;
                contractInteractions.set(contractAddress, current);
            }
        });

        const contractsInteracted = Array.from(contractInteractions.entries()).map(([address, data]) => ({
            address,
            name: data.name,
            isVerified: data.isVerified,
            interactionCount: data.count
        })).sort((a, b) => b.interactionCount - a.interactionCount);

        // Convert values from Wei to ETH
        const totalGasSpentETH = Number(totalGasSpentWei) / 1e18;
        const totalDeposited = Number(totalDepositedWei) / 1e18;

        return {
            firstTransaction,
            lastTransaction,
            uniqueDays: uniqueDatesSet.size,
            uniqueWeeks: uniqueWeeksSet.size,
            uniqueMonths: uniqueMonthsSet.size,
            contractsCreated: createdContracts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
            contractsInteracted,
            totalGasSpentETH,
            totalDeposited,
            bridgeUsed
        };
    };

    // Format ETH balance
    const formatEthBalance = (wei: string): string => {
        const etherValue = Number(wei) / 1e18;
        return etherValue.toFixed(6);
    };

    // Main function to fetch wallet data
    const fetchWalletData = async () => {
        if (!isValidInput || !searchInput) {
            setError('Please enter a valid Ethereum address or domain');
            return;
        }

        setIsLoading(true);
        setError(null);
        setWalletData(null);
        setResolvedAddress('');
        setNfts([]);
        setTokens([]);
        setLoadingProgress('Starting...');

        try {
            // Resolve address if input is a domain
            let address = searchInput;
            if (isDomain(searchInput)) {
                setLoadingProgress('Resolving domain...');
                address = await resolveDomain(searchInput);
                setResolvedAddress(address);
            }

            // First, get counters to know total transaction count
            setLoadingProgress('Fetching account info...');
            const countersData = await fetchAccountCounters(address);
            const totalTxCount = parseInt(countersData.transactions_count);

            // Fetch all data in parallel (except transactions which need pagination)
            setLoadingProgress('Fetching wallet data...');
            const [balance, transactions, nftData, tokenData, isBaseBuilderHolder, isBaseIntroducedHolder] = await Promise.all([
                fetchBalance(address),
                fetchTransactionsWithPagination(address, totalTxCount),
                fetchNFTs(address),
                fetchTokens(address),
                checkBaseBuilderNFT(address),
                checkBaseIntroducedNFT(address)
            ]);

            setLoadingProgress('Processing data...');

            // Process transactions
            const processedData = processTransactions(transactions, address);

            // Calculate wallet age and first transaction date
            let walletAge = 'Unknown';
            let walletAgeDays = 0;
            let firstTxDate = '';
            let lastActivity = 'Unknown';

            if (processedData.firstTransaction) {
                const parsedDate = new Date(Number(processedData.firstTransaction.timeStamp) * 1000);
                const today = new Date();
                walletAgeDays = Math.floor((today.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24));
                walletAge = formatDistanceToNow(parsedDate, { addSuffix: true });
                firstTxDate = format(parsedDate, 'PPpp');
            }

            if (processedData.lastTransaction) {
                const lastTxDate = new Date(Number(processedData.lastTransaction.timeStamp) * 1000);
                lastActivity = formatDistanceToNow(lastTxDate, { addSuffix: true });
            }

            // Set complete wallet data
            const fullWalletData: WalletData = {
                address,
                balance,
                transactionsCount: totalTxCount,
                tokenTransfersCount: parseInt(countersData.token_transfers_count),
                gasUsageCount: countersData.gas_usage_count,
                totalVolume: processedData.totalVolume,
                firstTransaction: processedData.firstTransaction,
                lastTransaction: processedData.lastTransaction,
                walletAge,
                walletAgeDays,
                firstTxDate,
                lastActivity,
                uniqueDays: processedData.uniqueDays,
                uniqueWeeks: processedData.uniqueWeeks,
                uniqueMonths: processedData.uniqueMonths,
                totalDeposited: processedData.totalDeposited,
                isBaseBuilderNFTHolder: isBaseBuilderHolder,
                isBaseIntroducedNFTHolder: isBaseIntroducedHolder,
                contractsCreated: processedData.contractsCreated,
                contractsInteracted: processedData.contractsInteracted,
                allTransactions: transactions,
            };

            setWalletData(fullWalletData);
            setNfts(nftData);
            setTokens(tokenData);
            setLoadingProgress('');

        } catch (error) {
            console.error('Error fetching wallet data:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setError(`Failed to fetch wallet data: ${errorMessage}`);
            setLoadingProgress('');
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

    // Format transaction value
    const formatTxValue = (value: string) => {
        const eth = Number(value) / 1e18;
        return eth.toFixed(6);
    };

    // Format token balance
    const formatTokenBalance = (value: string, decimals: string): string => {
        if (!value) return '0';
        const decimalPlaces = parseInt(decimals || '0');
        const balance = parseFloat(value) / Math.pow(10, decimalPlaces);
        return balance.toLocaleString();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="container mx-auto px-4 py-12 relative z-10">
                {/* Header */}
                <div className="text-center mb-12 animate-fade-in">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Base Stats Checker
                        </h1>
                        <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                    </div>
                    <p className="text-xl text-gray-300 font-light">
                        Discover and analyze wallet statistics on Base Network
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-300">Supports addresses & ENS domains</span>
                    </div>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto mb-12 animate-slide-up">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={handleInputChange}
                                placeholder="Enter wallet address or domain (e.g., vitalik.eth)"
                                className={`w-full px-8 py-5 text-lg rounded-2xl border-2 ${!isValidInput
                                    ? 'border-red-500 focus:border-red-600'
                                    : 'border-transparent focus:border-purple-500'
                                    } bg-white/10 backdrop-blur-md text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/30 transition-all shadow-2xl`}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !isValidInput || !searchInput}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {loadingProgress || 'Loading...'}
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        Check Stats
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    {!isValidInput && searchInput && (
                        <p className="text-red-400 text-sm mt-3 ml-2 animate-shake">
                            ⚠️ Please enter a valid Ethereum address or domain
                        </p>
                    )}
                </form>

                {/* Error Display */}
                {error && (
                    <div className="max-w-3xl mx-auto mb-8 bg-red-500/20 backdrop-blur-md border border-red-500/50 text-red-200 px-6 py-4 rounded-2xl flex items-center gap-3 animate-shake">
                        <AlertCircle className="w-6 h-6 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Resolved Address Display */}
                {resolvedAddress && (
                    <div className="max-w-3xl mx-auto mb-8 bg-blue-500/20 backdrop-blur-md border border-blue-500/50 text-blue-200 px-6 py-4 rounded-2xl animate-fade-in">
                        <p className="font-semibold flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            Domain resolved successfully
                        </p>
                        <p className="font-mono text-sm mt-1 ml-7">{resolvedAddress}</p>
                    </div>
                )}

                {/* Wallet Data Display */}
                {walletData && (
                    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
                        {/* Main Stats Grid */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:border-white/30 transition-all">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Balance Card */}
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition"></div>
                                    <div className="relative bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-5 border border-purple-500/30">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-purple-500/30 rounded-lg">
                                                <TrendingUp className="w-6 h-6 text-purple-300" />
                                            </div>
                                            <p className="text-sm text-gray-300 font-medium">Balance</p>
                                        </div>
                                        <p className="text-3xl font-bold text-white mb-1">
                                            {formatEthBalance(walletData.balance)}
                                        </p>
                                        <p className="text-sm text-purple-300">ETH</p>
                                    </div>
                                </div>

                                {/* Wallet Age Card */}
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition"></div>
                                    <div className="relative bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl p-5 border border-blue-500/30">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-blue-500/30 rounded-lg">
                                                <Clock className="w-6 h-6 text-blue-300" />
                                            </div>
                                            <p className="text-sm text-gray-300 font-medium">Wallet Age</p>
                                        </div>
                                        <p className="text-3xl font-bold text-white mb-1">
                                            {walletData.walletAgeDays}
                                        </p>
                                        <p className="text-sm text-blue-300">Days</p>
                                    </div>
                                </div>

                                {/* Transactions Card */}
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition"></div>
                                    <div className="relative bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-5 border border-green-500/30">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-green-500/30 rounded-lg">
                                                <Activity className="w-6 h-6 text-green-300" />
                                            </div>
                                            <p className="text-sm text-gray-300 font-medium">Transactions</p>
                                        </div>
                                        <p className="text-3xl font-bold text-white mb-1">
                                            {walletData.transactionsCount.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-green-300">Total TXs</p>
                                    </div>
                                </div>

                                {/* Token Transfers Card */}
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition"></div>
                                    <div className="relative bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-5 border border-yellow-500/30">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-yellow-500/30 rounded-lg">
                                                <Coins className="w-6 h-6 text-yellow-300" />
                                            </div>
                                            <p className="text-sm text-gray-300 font-medium">Token Transfers</p>
                                        </div>
                                        <p className="text-3xl font-bold text-white mb-1">
                                            {walletData.tokenTransfersCount.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-yellow-300">Transfers</p>
                                    </div>
                                </div>
                            </div>

                            {/* Activity Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                                <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-sm rounded-2xl p-4 border border-pink-500/30 hover:border-pink-500/50 transition-all">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-6 h-6 text-pink-300" />
                                        <div>
                                            <p className="text-xs text-gray-300">Unique Days</p>
                                            <p className="text-2xl font-bold text-white">{walletData.uniqueDays}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 backdrop-blur-sm rounded-2xl p-4 border border-orange-500/30 hover:border-orange-500/50 transition-all">
                                    <div className="flex items-center gap-3">
                                        <Frame className="w-6 h-6 text-orange-300" />
                                        <div>
                                            <p className="text-xs text-gray-300">Unique Weeks</p>
                                            <p className="text-2xl font-bold text-white">{walletData.uniqueWeeks}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl p-4 border border-teal-500/30 hover:border-teal-500/50 transition-all">
                                    <div className="flex items-center gap-3">
                                        <Boxes className="w-6 h-6 text-teal-300" />
                                        <div>
                                            <p className="text-xs text-gray-300">Unique Months</p>
                                            <p className="text-2xl font-bold text-white">{walletData.uniqueMonths}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* New Extended Stats - Updated with Total Volume */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                {/* Last Activity */}
                                <div className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-4 border border-violet-500/30 hover:border-violet-500/50 transition-all">
                                    <div className="flex items-center gap-3">
                                        <Activity className="w-6 h-6 text-violet-300" />
                                        <div>
                                            <p className="text-xs text-gray-300">Last Activity</p>
                                            <p className="text-lg font-bold text-white">{walletData.lastActivity}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Volume */}
                                <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-4 border border-indigo-500/30 hover:border-indigo-500/50 transition-all">
                                    <div className="flex items-center gap-3">
                                        <Zap className="w-6 h-6 text-indigo-300" />
                                        <div>
                                            <p className="text-xs text-gray-300">Total Volume</p>
                                            <p className="text-lg font-bold text-white">{walletData.totalVolume.toFixed(4)} ETH</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Deposited */}
                                <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-sm rounded-2xl p-4 border border-emerald-500/30 hover:border-emerald-500/50 transition-all">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="w-6 h-6 text-emerald-300" />
                                        <div>
                                            <p className="text-xs text-gray-300">Total Deposited</p>
                                            <p className="text-lg font-bold text-white">{walletData.totalDeposited.toFixed(4)} ETH</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Base, Introduced Holder */}
                                <div className="bg-gradient-to-br from-rose-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-4 border border-rose-500/30 hover:border-rose-500/50 transition-all">
                                    <div className="flex items-center gap-3">
                                        {walletData.isBaseIntroducedNFTHolder ? <Sparkles className="w-6 h-6 text-rose-300" /> : <Frame className="w-6 h-6 text-gray-500" />}
                                        <div>
                                            <p className="text-xs text-gray-300">Base, Introduced</p>
                                            <p className="text-lg font-bold text-white">{walletData.isBaseIntroducedNFTHolder ? 'Yes' : 'No'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Base Builder NFT - Separate Row */}
                            <div className="grid grid-cols-1 gap-4 mt-4">
                                <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 backdrop-blur-sm rounded-2xl p-4 border border-amber-500/30 hover:border-amber-500/50 transition-all">
                                    <div className="flex items-center gap-3">
                                        {walletData.isBaseBuilderNFTHolder ? <Sparkles className="w-6 h-6 text-amber-300" /> : <Frame className="w-6 h-6 text-gray-500" />}
                                        <div>
                                            <p className="text-xs text-gray-300">Base Builder NFT Holder</p>
                                            <p className="text-lg font-bold text-white">{walletData.isBaseBuilderNFTHolder ? 'Yes' : 'No'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contracts Created */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:border-white/30 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/30 rounded-lg">
                                        <Building2 className="w-6 h-6 text-purple-300" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">Contracts Created</h2>
                                        <p className="text-sm text-gray-400">
                                            {walletData.contractsCreated.length} contracts deployed
                                        </p>
                                    </div>
                                </div>
                                {walletData.contractsCreated.length > 0 && (
                                    <button
                                        onClick={() => setShowContracts(!showContracts)}
                                        className="text-purple-400 hover:text-purple-300 transition-colors p-2 hover:bg-white/10 rounded-lg"
                                    >
                                        {showContracts ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                    </button>
                                )}
                            </div>

                            {showContracts && walletData.contractsCreated.length > 0 && (
                                <div className="mt-4 space-y-3">
                                    {walletData.contractsCreated.map((contract) => (
                                        <div
                                            key={contract.hash}
                                            className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all group"
                                        >
                                            <div>
                                                <p className="font-medium text-white font-mono text-sm group-hover:text-purple-300 transition-colors">
                                                    {formatAddress(contract.hash)}
                                                </p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    {new Date(contract.timestamp).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <a
                                                href={`${BASE_EXPLORER_URL}/address/${contract.hash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                                            >
                                                View <ExternalLink size={16} />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {showContracts && walletData.contractsCreated.length === 0 && (
                                <div className="text-center py-8 text-gray-400">
                                    No contracts created by this wallet
                                </div>
                            )}
                        </div>

                        {/* Contracts Interacted */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:border-white/30 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/30 rounded-lg">
                                        <Users className="w-6 h-6 text-blue-300" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">Contracts Interacted</h2>
                                        <p className="text-sm text-gray-400">
                                            {walletData.contractsInteracted.length} unique contracts
                                        </p>
                                    </div>
                                </div>
                                {walletData.contractsInteracted.length > 0 && (
                                    <button
                                        onClick={() => setShowInteractions(!showInteractions)}
                                        className="text-blue-400 hover:text-blue-300 transition-colors p-2 hover:bg-white/10 rounded-lg"
                                    >
                                        {showInteractions ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                    </button>
                                )}
                            </div>

                            {showInteractions && walletData.contractsInteracted.length > 0 && (
                                <div className="mt-4 overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Contract</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Interactions</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/10">
                                            {walletData.contractsInteracted.slice(0, showInteractions ? undefined : 5).map((contract) => (
                                                <tr key={contract.address} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-white">
                                                        {formatAddress(contract.address)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
                                                            {contract.interactionCount.toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <a
                                                            href={`${BASE_EXPLORER_URL}/address/${contract.address}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 transition-colors"
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
                        </div>

                        {/* NFT Holdings */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:border-white/30 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-pink-500/30 rounded-lg">
                                        <Frame className="w-6 h-6 text-pink-300" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">NFT Holdings</h2>
                                        <p className="text-sm text-gray-400">
                                            {nfts.length} collections
                                        </p>
                                    </div>
                                </div>
                                {nfts.length > 0 && (
                                    <button
                                        onClick={() => setShowNFTs(!showNFTs)}
                                        className="text-pink-400 hover:text-pink-300 transition-colors p-2 hover:bg-white/10 rounded-lg"
                                    >
                                        {showNFTs ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                    </button>
                                )}
                            </div>

                            {showNFTs && nfts.length > 0 && (
                                <div className="space-y-6">
                                    {nfts.map((item) => (
                                        <div key={item.token.address} className="border border-white/10 rounded-2xl p-4 bg-white/5 hover:bg-white/10 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white">
                                                        {item.token.name} ({item.token.symbol})
                                                    </h3>
                                                    <p className="text-sm text-gray-400">
                                                        Type: {item.token.type} | Holdings: {item.amount}
                                                    </p>
                                                </div>
                                                <a
                                                    href={`${BASE_EXPLORER_URL}/token/${item.token.address}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-pink-400 hover:text-pink-300 flex items-center gap-1 transition-colors"
                                                >
                                                    View <ExternalLink size={16} />
                                                </a>
                                            </div>

                                            {item.token_instances && item.token_instances.length > 0 && (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                                    {item.token_instances.slice(0, 8).map((instance) => (
                                                        <div key={instance.id} className="border border-white/10 rounded-xl p-2 bg-white/5 hover:bg-white/10 hover:scale-105 transition-all group">
                                                            {instance.image_url ? (
                                                                <img
                                                                    src={instance.image_url}
                                                                    alt={instance.metadata?.name || 'NFT'}
                                                                    className="w-full h-32 object-cover rounded-lg mb-2 group-hover:shadow-lg transition-shadow"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg mb-2 flex items-center justify-center">
                                                                    <ImageIcon className="text-gray-500" size={32} />
                                                                </div>
                                                            )}
                                                            <p className="font-medium text-xs text-white truncate">
                                                                {instance.metadata?.name || `#${instance.id}`}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {instance.token_type}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {showNFTs && nfts.length === 0 && (
                                <div className="text-center py-8 text-gray-400">
                                    No NFTs found for this wallet
                                </div>
                            )}
                        </div>

                        {/* Token Holdings */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:border-white/30 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-500/30 rounded-lg">
                                        <Coins className="w-6 h-6 text-yellow-300" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">Token Holdings</h2>
                                        <p className="text-sm text-gray-400">
                                            {tokens.length} different tokens
                                        </p>
                                    </div>
                                </div>
                                {tokens.length > 0 && (
                                    <button
                                        onClick={() => setShowTokens(!showTokens)}
                                        className="text-yellow-400 hover:text-yellow-300 transition-colors p-2 hover:bg-white/10 rounded-lg"
                                    >
                                        {showTokens ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                    </button>
                                )}
                            </div>

                            {showTokens && tokens.length > 0 && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Token</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Balance</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Holders</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/10">
                                            {tokens.map((token) => (
                                                <tr key={token.token.address} className="hover:bg-white/5 transition-colors">
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
                                                                <div className="text-sm font-medium text-white">
                                                                    {token.token.name}
                                                                </div>
                                                                <div className="text-sm text-gray-400">
                                                                    {token.token.symbol}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                                                        {formatTokenBalance(token.value, token.token.decimals)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                        {parseInt(token.token.holders).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <a
                                                            href={`${BASE_EXPLORER_URL}/token/${token.token.address}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-yellow-400 hover:text-yellow-300 inline-flex items-center gap-1 transition-colors"
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

                            {showTokens && tokens.length === 0 && (
                                <div className="text-center py-8 text-gray-400">
                                    No tokens found for this wallet
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </div>

            <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
        </div>
    );
}
