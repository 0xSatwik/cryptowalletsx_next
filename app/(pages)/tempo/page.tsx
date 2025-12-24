'use client';

import { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { ExternalLink, Search, Loader2, AlertCircle, TrendingUp, Activity, Clock, Calendar, Building2, Sparkles, Hash, Flame, ChevronDown, ChevronUp, Users, Twitter, Star, Info } from 'lucide-react';

// Constants for API and Explorer
const TEMPO_TOTAL_VALUE_API = '/api/tempo/total-value';
const TEMPO_TRANSACTIONS_API = '/api/tempo/transactions';
const TEMPO_TXS_COUNT_API = '/api/tempo/txs-count';
const TEMPO_EXPLORER_URL = 'https://explore.tempo.xyz';

export default function TempoChainStatsChecker() {
    const [searchInput, setSearchInput] = useState('');
    const [isValidInput, setIsValidInput] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState('');
    const [walletData, setWalletData] = useState<WalletData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showContracts, setShowContracts] = useState(false);
    const [showInteractions, setShowInteractions] = useState(false);
    const [showPointSystem, setShowPointSystem] = useState(false);

    interface Transaction {
        blockHash: string | null;
        blockNumber: string;
        chainId: string;
        from: string;
        gas: string;
        gasPrice: string;
        hash: string;
        input: string;
        nonce: string;
        to: string | null;
        transactionIndex: string | null;
        value: string;
        type: string;
        v: string;
        r: string;
        s: string;
    }

    interface TransactionsResponse {
        transactions: Transaction[];
        total: number;
        offset: number;
        limit: number;
        hasMore: boolean;
        error: string | null;
    }

    interface TotalValueResponse {
        totalValue: number;
    }

    interface ContractDeployed {
        hash: string;
        timestamp: string;
        txHash: string;
    }

    interface ContractInteracted {
        address: string;
        interactionCount: number;
    }

    interface WalletData {
        address: string;
        totalValue: number;
        totalTransactions: number;
        totalGasSpentUSD: number;
        uniqueContractsDeployed: number;
        uniqueContractsInteracted: number;
        totalContractInteractions: number;
        uniqueDays: number;
        uniqueWeeks: number;
        uniqueMonths: number;
        firstTransaction: Transaction | null;
        lastTransaction: Transaction | null;
        walletAge: string;
        walletAgeDays: number;
        firstTxDate: string;
        firstTxHash: string;
        lastActivity: string;
        lastActivityDays: number;
        lastTxDate: string;
        lastTxHash: string;
        contractsCreated: ContractDeployed[];
        contractsInteracted: ContractInteracted[];
        walletScore: number;
    }

    const isValidEthAddress = (address: string): boolean => {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value.trim();
        setSearchInput(input);
        setIsValidInput(input === '' || isValidEthAddress(input));
    };

    // Score calculation function
    const calculateWalletScore = (data: {
        uniqueDays: number;
        uniqueWeeks: number;
        uniqueMonths: number;
        totalTransactions: number;
        uniqueContractsInteracted: number;
        uniqueContractsDeployed: number;
    }): number => {
        const daysScore = data.uniqueDays * 1;
        const weeksScore = data.uniqueWeeks * 3;
        const monthsScore = data.uniqueMonths * 5;
        const txScore = Math.min(data.totalTransactions * 0.1, 20);
        const interactionScore = Math.min(data.uniqueContractsInteracted * 1, 30);
        const deployScore = Math.min(data.uniqueContractsDeployed * 1, 5);
        return Math.round((daysScore + weeksScore + monthsScore + txScore + interactionScore + deployScore) * 10) / 10;
    };

    // Cache helpers (30 minutes)
    const CACHE_DURATION = 30 * 60 * 1000;
    const getCachedData = (address: string): WalletData | null => {
        if (typeof window === 'undefined') return null;
        const cached = localStorage.getItem(`tempo_wallet_${address.toLowerCase()}`);
        if (!cached) return null;
        try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp > CACHE_DURATION) {
                localStorage.removeItem(`tempo_wallet_${address.toLowerCase()}`);
                return null;
            }
            return data;
        } catch {
            return null;
        }
    };
    const setCachedData = (address: string, data: WalletData) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(`tempo_wallet_${address.toLowerCase()}`, JSON.stringify({ data, timestamp: Date.now() }));
    };

    const fetchTotalValue = async (address: string): Promise<number> => {
        const response = await fetch(`${TEMPO_TOTAL_VALUE_API}/${address}`);
        if (!response.ok) throw new Error(`Failed to fetch total value: ${response.status}`);
        const data: TotalValueResponse = await response.json();
        return data.totalValue;
    };

    const fetchTxCount = async (address: string): Promise<number> => {
        const response = await fetch(`${TEMPO_TXS_COUNT_API}/${address}`);
        if (!response.ok) throw new Error(`Failed to fetch tx count: ${response.status}`);
        const data = await response.json();
        return data.data;
    };

    const fetchAllTransactions = async (address: string): Promise<Transaction[]> => {
        const limit = 15; // API fails with 500 if limit >= 20

        // Step 1: Get total count from specialized endpoint as requested
        const countRes = await fetch(`${TEMPO_TXS_COUNT_API}/${address}`);
        if (!countRes.ok) throw new Error(`Failed to fetch count: ${countRes.status}`);
        const countData = await countRes.json();
        const totalTransactions = countData.data;

        if (totalTransactions === 0) return [];

        // Step 2: Calculate needed offsets
        const offsets: number[] = [];
        for (let offset = 0; offset < totalTransactions; offset += limit) {
            offsets.push(offset);
        }

        const allTransactions: Transaction[] = [];

        // Step 3: Fetch in batches
        const BATCH_SIZE = 5;
        for (let i = 0; i < offsets.length; i += BATCH_SIZE) {
            const batchOffsets = offsets.slice(i, i + BATCH_SIZE);
            const batchPromises = batchOffsets.map(async (offset) => {
                // Ensure we don't request more than needed for the last batch? 
                // No, API handles limit correctly if fewer items exist.
                // But user suggested "if 20 transactions then place 20".
                // Since limit 15 is max safe, we stick to 15.
                const url = `${TEMPO_TRANSACTIONS_API}/${address}?include=all&limit=${limit}&offset=${offset}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Failed to fetch transactions at offset ${offset}`);
                return res.json() as Promise<TransactionsResponse>;
            });

            const batchResults = await Promise.all(batchPromises);

            for (const result of batchResults) {
                if (result.transactions) {
                    allTransactions.push(...result.transactions);
                }
            }

            // Update loading progress
            const progress = Math.min(100, Math.round(((i + BATCH_SIZE) / offsets.length) * 100));
            setLoadingProgress(`Fetching transactions... ${progress}%`);

            // Small delay between batches to be nice to API
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        console.log(`Successfully fetched ${allTransactions.length} transactions (Expected: ${totalTransactions})`);
        return allTransactions;
    };

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

    const processTransactions = (transactions: Transaction[], address: string) => {
        if (transactions.length === 0) {
            return {
                totalGasSpentWei: BigInt(0),
                uniqueContractsDeployed: 0,
                uniqueContractsInteracted: 0,
                totalContractInteractions: 0,
                uniqueDays: 0,
                uniqueWeeks: 0,
                uniqueMonths: 0,
                firstTransaction: null,
                lastTransaction: null,
                contractsCreated: [],
                contractsInteracted: [],
            };
        }

        const uniqueDatesSet = new Set<string>();
        const uniqueWeeksSet = new Set<string>();
        const uniqueMonthsSet = new Set<string>();
        const deployedContracts = new Map<string, { timestamp: string; txHash: string }>();
        const interactedContracts = new Map<string, number>();
        let totalGasSpentWei = BigInt(0);

        const sortedTransactions = [...transactions].sort((a, b) => {
            return parseInt(a.blockNumber, 16) - parseInt(b.blockNumber, 16);
        });

        const firstTransaction = sortedTransactions[0];
        const lastTransaction = sortedTransactions[sortedTransactions.length - 1];

        sortedTransactions.forEach((tx) => {
            const blockNum = parseInt(tx.blockNumber, 16);
            const now = Date.now();
            const SECONDS_PER_BLOCK = 2;
            const blockAge = (parseInt(lastTransaction.blockNumber, 16) - blockNum) * SECONDS_PER_BLOCK * 1000;
            const txDate = new Date(now - blockAge);

            if (tx.from.toLowerCase() === address.toLowerCase()) {
                totalGasSpentWei += BigInt(tx.gas) * BigInt(tx.gasPrice);

                const toAddress = tx.to ? tx.to.toLowerCase() : '';
                if (!toAddress || toAddress === '' || toAddress === '0x0000000000000000000000000000000000000000') {
                    deployedContracts.set(tx.hash, {
                        timestamp: txDate.toISOString(),
                        txHash: tx.hash
                    });
                }

                if (toAddress && tx.input && tx.input.length > 2 && tx.input !== '0x') {
                    const contractAddr = toAddress;
                    interactedContracts.set(contractAddr, (interactedContracts.get(contractAddr) || 0) + 1);
                }
            }

            uniqueDatesSet.add(txDate.toISOString().split('T')[0]);
            const year = txDate.getFullYear();
            const weekNum = getISOWeek(txDate);
            uniqueWeeksSet.add(`${year}-W${weekNum}`);
            uniqueMonthsSet.add(`${year}-${(txDate.getMonth() + 1).toString().padStart(2, '0')}`);
        });

        const contractsCreated: ContractDeployed[] = Array.from(deployedContracts.entries()).map(([hash, data]) => ({
            hash,
            timestamp: data.timestamp,
            txHash: data.txHash
        }));

        const contractsInteracted: ContractInteracted[] = Array.from(interactedContracts.entries())
            .map(([address, count]) => ({
                address,
                interactionCount: count
            }))
            .sort((a, b) => b.interactionCount - a.interactionCount);

        const totalContractInteractions = contractsInteracted.reduce((sum, c) => sum + c.interactionCount, 0);

        return {
            totalGasSpentWei,
            uniqueContractsDeployed: deployedContracts.size,
            uniqueContractsInteracted: interactedContracts.size,
            totalContractInteractions,
            uniqueDays: uniqueDatesSet.size,
            uniqueWeeks: uniqueWeeksSet.size,
            uniqueMonths: uniqueMonthsSet.size,
            firstTransaction,
            lastTransaction,
            contractsCreated,
            contractsInteracted,
        };
    };

    const fetchWalletData = async () => {
        if (!isValidInput || !searchInput) {
            setError('Please enter a valid Ethereum address');
            return;
        }

        const address = searchInput;

        // Check cache first
        const cachedData = getCachedData(address);
        if (cachedData) {
            setWalletData(cachedData);
            return;
        }

        setIsLoading(true);
        setError(null);
        setWalletData(null);
        setLoadingProgress('Starting...');

        try {
            setLoadingProgress('Fetching wallet data...');

            const [totalValue, transactions, txCount] = await Promise.all([
                fetchTotalValue(address),
                fetchAllTransactions(address),
                fetchTxCount(address)
            ]);

            setLoadingProgress('Processing data...');
            const processedData = processTransactions(transactions, address);

            const totalGasSpentETH = Number(processedData.totalGasSpentWei) / 1e18;
            const totalGasSpentUSD = totalGasSpentETH * 1;

            let walletAge = 'Unknown';
            let walletAgeDays = 0;
            let firstTxDate = '';
            let firstTxHash = '';
            let lastActivity = 'Unknown';
            let lastActivityDays = 0;
            let lastTxDate = '';
            let lastTxHash = '';

            if (processedData.firstTransaction) {
                const firstBlockNum = parseInt(processedData.firstTransaction.blockNumber, 16);
                const lastBlockNum = parseInt(processedData.lastTransaction!.blockNumber, 16);
                const SECONDS_PER_BLOCK = 2;

                const now = new Date();
                const blockDiff = lastBlockNum - firstBlockNum;
                const timeDiffMs = blockDiff * SECONDS_PER_BLOCK * 1000;
                const firstTxDateObj = new Date(now.getTime() - timeDiffMs);

                walletAgeDays = Math.floor((now.getTime() - firstTxDateObj.getTime()) / (1000 * 60 * 60 * 24));
                walletAge = formatDistanceToNow(firstTxDateObj, { addSuffix: true });
                firstTxDate = format(firstTxDateObj, 'PPpp');
                firstTxHash = processedData.firstTransaction.hash;
            }

            if (processedData.lastTransaction) {
                const lastTxDateObj = new Date();
                lastActivityDays = 0;
                lastActivity = 'Recently';
                lastTxDate = format(lastTxDateObj, 'PPpp');
                lastTxHash = processedData.lastTransaction.hash;
            }

            // Calculate wallet score
            const walletScore = calculateWalletScore({
                uniqueDays: processedData.uniqueDays,
                uniqueWeeks: processedData.uniqueWeeks,
                uniqueMonths: processedData.uniqueMonths,
                totalTransactions: txCount,
                uniqueContractsInteracted: processedData.uniqueContractsInteracted,
                uniqueContractsDeployed: processedData.uniqueContractsDeployed,
            });

            const fullWalletData: WalletData = {
                address,
                totalValue: Math.floor(totalValue),
                totalTransactions: txCount,
                totalGasSpentUSD,
                uniqueContractsDeployed: processedData.uniqueContractsDeployed,
                uniqueContractsInteracted: processedData.uniqueContractsInteracted,
                totalContractInteractions: processedData.totalContractInteractions,
                uniqueDays: processedData.uniqueDays,
                uniqueWeeks: processedData.uniqueWeeks,
                uniqueMonths: processedData.uniqueMonths,
                firstTransaction: processedData.firstTransaction,
                lastTransaction: processedData.lastTransaction,
                walletAge,
                walletAgeDays,
                firstTxDate,
                firstTxHash,
                lastActivity,
                lastActivityDays,
                lastTxDate,
                lastTxHash,
                contractsCreated: processedData.contractsCreated,
                contractsInteracted: processedData.contractsInteracted,
                walletScore,
            };

            // Save to cache
            setCachedData(address, fullWalletData);
            setWalletData(fullWalletData);
            setLoadingProgress('');
        } catch (error) {
            console.error('Error fetching wallet data:', error);
            setError(`Failed to fetch wallet data: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setLoadingProgress('');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchWalletData();
    };

    const formatAddress = (address: string) => {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <Sparkles className="w-6 h-6 text-indigo-600" />
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Tempo Chain Stats
                        </h1>
                        <Sparkles className="w-6 h-6 text-indigo-600" />
                    </div>
                    <p className="text-gray-600 text-sm">Comprehensive wallet analytics on Tempo Chain</p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={handleInputChange}
                            placeholder="Enter wallet address (0x...)"
                            className={`w-full px-5 py-4 text-base rounded-xl border-2 ${!isValidInput
                                ? 'border-red-400 focus:border-red-500'
                                : 'border-gray-200 focus:border-indigo-500'
                                } bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all shadow-lg`}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !isValidInput || !searchInput}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            <span className="hidden sm:inline">{isLoading ? 'Loading...' : 'Check'}</span>
                        </button>
                    </div>
                    {!isValidInput && searchInput && (
                        <p className="text-red-500 text-sm mt-2 ml-2">⚠️ Invalid Ethereum address</p>
                    )}
                </form>

                {/* Point System Legend */}
                <div className="max-w-2xl mx-auto mb-8">
                    <button
                        onClick={() => setShowPointSystem(!showPointSystem)}
                        className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-white border-2 border-indigo-200 text-indigo-700 rounded-full mx-auto hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm"
                    >
                        <Info className="w-4 h-4" />
                        {showPointSystem ? 'Hide' : 'View'} Scoring System
                        {showPointSystem ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {showPointSystem && (
                        <div className="mt-4 bg-white rounded-xl p-4 shadow-md border border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500" /> Point System
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                <div className="bg-pink-50 p-2 rounded-lg border border-pink-100">
                                    <span className="font-semibold text-pink-700">+1</span>
                                    <span className="text-gray-600"> / unique day</span>
                                </div>
                                <div className="bg-orange-50 p-2 rounded-lg border border-orange-100">
                                    <span className="font-semibold text-orange-700">+3</span>
                                    <span className="text-gray-600"> / unique week</span>
                                </div>
                                <div className="bg-teal-50 p-2 rounded-lg border border-teal-100">
                                    <span className="font-semibold text-teal-700">+5</span>
                                    <span className="text-gray-600"> / unique month</span>
                                </div>
                                <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                                    <span className="font-semibold text-green-700">+0.1</span>
                                    <span className="text-gray-600"> / TX (max 20)</span>
                                </div>
                                <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                                    <span className="font-semibold text-blue-700">+1</span>
                                    <span className="text-gray-600"> / contract (max 30)</span>
                                </div>
                                <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                                    <span className="font-semibold text-purple-700">+1</span>
                                    <span className="text-gray-600"> / deploy (max 5)</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Twitter Share & Circular Score */}
                {walletData && (
                    <div className="flex flex-col items-center gap-5 mb-8">
                        {/* Twitter Share Button */}
                        <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`My Tempo Chain Stats 🚀\n\n⭐ Score: ${walletData.walletScore}\n💰 Value: $${walletData.totalValue.toLocaleString()}\n📊 TXs: ${walletData.totalTransactions}\n🔥 Gas: $${walletData.totalGasSpentUSD.toFixed(2)}\n📆 Age: ${walletData.walletAgeDays} days\n\nCheck yours:`)} ${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            <Twitter className="w-5 h-5" />
                            Share on Twitter
                        </a>

                        {/* Circular Score Display */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 p-1 shadow-2xl">
                                <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center">
                                    <Star className="w-6 h-6 text-amber-500 mb-1" />
                                    <p className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">{walletData.walletScore}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Wallet Score</p>
                                </div>
                            </div>
                            <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="max-w-2xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Stats Display */}
                {walletData && (
                    <div className="space-y-4">
                        {/* Wallet Address Bar */}
                        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">{walletData.address.substring(2, 4).toUpperCase()}</span>
                                </div>
                                <p className="font-mono text-gray-700 text-sm break-all">{walletData.address}</p>
                            </div>
                            <a
                                href={`${TEMPO_EXPLORER_URL}/address/${walletData.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all"
                            >
                                Explorer <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>

                        {/* Main Stats Grid - 4 columns */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-5 h-5 text-amber-500" />
                                    <span className="text-xs text-gray-500 font-medium">Total Value</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-800">${walletData.totalValue.toLocaleString()}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity className="w-5 h-5 text-green-500" />
                                    <span className="text-xs text-gray-500 font-medium">Transactions</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-800">{walletData.totalTransactions.toLocaleString()}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Flame className="w-5 h-5 text-red-500" />
                                    <span className="text-xs text-gray-500 font-medium">Gas Spent</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-800">${walletData.totalGasSpentUSD.toFixed(2)}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-5 h-5 text-blue-500" />
                                    <span className="text-xs text-gray-500 font-medium">Wallet Age</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-800">{walletData.walletAgeDays} <span className="text-sm font-normal text-gray-500">days</span></p>
                            </div>
                        </div>

                        {/* First TX & Last Active - Side by Side */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1">First Transaction</p>
                                        <p className="text-sm font-semibold text-gray-800">{walletData.firstTxDate}</p>
                                        <p className="text-xs text-gray-400">{walletData.walletAge}</p>
                                    </div>
                                    <a href={`${TEMPO_EXPLORER_URL}/tx/${walletData.firstTxHash}`} target="_blank" rel="noopener noreferrer"
                                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 flex items-center gap-1">
                                        View <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1">Last Active</p>
                                        <p className="text-sm font-semibold text-gray-800">{walletData.lastTxDate}</p>
                                        <p className="text-xs text-gray-400">{walletData.lastActivity}</p>
                                    </div>
                                    <a href={`${TEMPO_EXPLORER_URL}/tx/${walletData.lastTxHash}`} target="_blank" rel="noopener noreferrer"
                                        className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-100 flex items-center gap-1">
                                        View <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Activity Timeline - Horizontal */}
                        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar className="w-5 h-5 text-indigo-600" />
                                <span className="text-sm font-semibold text-gray-800">Activity Timeline</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg border border-pink-100">
                                    <p className="text-2xl font-bold text-gray-800">{walletData.uniqueDays}</p>
                                    <p className="text-xs text-gray-500">Days</p>
                                </div>
                                <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                                    <p className="text-2xl font-bold text-gray-800">{walletData.uniqueWeeks}</p>
                                    <p className="text-xs text-gray-500">Weeks</p>
                                </div>
                                <div className="text-center p-3 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg border border-teal-100">
                                    <p className="text-2xl font-bold text-gray-800">{walletData.uniqueMonths}</p>
                                    <p className="text-xs text-gray-500">Months</p>
                                </div>
                            </div>
                        </div>

                        {/* Contracts - Side by Side */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Contracts Deployed */}
                            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-5 h-5 text-white" />
                                            <span className="text-sm font-semibold text-white">Contracts Deployed</span>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-white">{walletData.uniqueContractsDeployed}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    {walletData.contractsCreated.length > 0 ? (
                                        <>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs text-gray-500">Contract Addresses</span>
                                                <button onClick={() => setShowContracts(!showContracts)} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors flex items-center gap-1">
                                                    {showContracts ? 'Hide' : 'Show'} {showContracts ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                                </button>
                                            </div>
                                            {showContracts && (
                                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                                    {walletData.contractsCreated.map((contract) => (
                                                        <div key={contract.hash} className="flex items-center justify-between p-2 bg-purple-50 rounded-lg text-xs border border-purple-100">
                                                            <span className="font-mono text-purple-700">{formatAddress(contract.hash)}</span>
                                                            <a href={`${TEMPO_EXPLORER_URL}/tx/${contract.txHash}`} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800">
                                                                <ExternalLink size={14} />
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-xs text-gray-400 text-center py-2">No contracts deployed</p>
                                    )}
                                </div>
                            </div>

                            {/* Contracts Interacted */}
                            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-5 h-5 text-white" />
                                            <span className="text-sm font-semibold text-white">Contracts Interacted</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-white">{walletData.uniqueContractsInteracted}</p>
                                                <p className="text-[10px] text-blue-100">Unique</p>
                                            </div>
                                            <div className="w-px h-8 bg-blue-400"></div>
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-white">{walletData.totalContractInteractions}</p>
                                                <p className="text-[10px] text-blue-100">Total</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    {walletData.contractsInteracted.length > 0 ? (
                                        <>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs text-gray-500">Top Contracts</span>
                                                <button onClick={() => setShowInteractions(!showInteractions)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors flex items-center gap-1">
                                                    {showInteractions ? 'Hide' : 'Show'} {showInteractions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                                </button>
                                            </div>
                                            {showInteractions && (
                                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                                    {walletData.contractsInteracted.map((contract) => (
                                                        <div key={contract.address} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg text-xs border border-blue-100">
                                                            <span className="font-mono text-blue-700">{formatAddress(contract.address)}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full text-[10px] font-medium">{contract.interactionCount}x</span>
                                                                <a href={`${TEMPO_EXPLORER_URL}/address/${contract.address}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                                                    <ExternalLink size={14} />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-xs text-gray-400 text-center py-2">No contract interactions</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
