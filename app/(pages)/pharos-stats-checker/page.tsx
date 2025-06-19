'use client';

import { useState } from 'react';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { ExternalLink, Twitter, Activity, Zap, Wallet, Calendar, Image, Package, Coins, FileText, Shield, Repeat, ArrowDown, ArrowUp } from 'lucide-react';

// Constants for API and Explorer
const PHAROS_PROFILE_API_URL = 'https://api.socialscan.io/pharos-testnet/v1/explorer/address';
const PHAROS_TRANSACTIONS_API_URL = 'https://api.socialscan.io/pharos-testnet/v1/explorer/transactions';
const PHAROS_TOKEN_HOLDINGS_API_URL = 'https://api.socialscan.io/pharos-testnet/v2/explorer/address';
const PHAROS_TOKEN_TRANSFERS_API_URL = 'https://api.socialscan.io/pharos-testnet/v1/explorer/token_transfers';
const PHAROS_EXPLORER_URL = 'https://pharos-testnet.socialscan.io';

const TRANSACTIONS_PER_PAGE = 20;

// Component for Pharos Stats Checker
export default function PharosStatsChecker() {
    // State variables
    const [walletAddress, setWalletAddress] = useState('');
    const [isValidAddress, setIsValidAddress] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [walletData, setWalletData] = useState<WalletData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showInteractedContracts, setShowInteractedContracts] = useState(false);
    const [showCreatedContracts, setShowCreatedContracts] = useState(false);
    
    const [visibleTransactions, setVisibleTransactions] = useState(TRANSACTIONS_PER_PAGE);
    const [showTransactions, setShowTransactions] = useState(false);
    const [visibleTokenTransfers, setVisibleTokenTransfers] = useState(TRANSACTIONS_PER_PAGE);
    const [showTokenTransfers, setShowTokenTransfers] = useState(false);

    const [showNfts, setShowNfts] = useState(true);
    const [showTokens, setShowTokens] = useState(true);
    const [walletScore, setWalletScore] = useState<WalletScore | null>(null);
    const [nftCollections, setNftCollections] = useState<NFTCollection[]>([]);
    const [isLoadingNfts, setIsLoadingNfts] = useState(false);
    const [tokenHoldings, setTokenHoldings] = useState<TokenHolding[]>([]);
    const [isLoadingTokens, setIsLoadingTokens] = useState(false);
    const [tokenTransfers, setTokenTransfers] = useState<TokenTransfer[]>([]);
    const [isLoadingTokenTransfers, setIsLoadingTokenTransfers] = useState(false);
    const [swapStats, setSwapStats] = useState<SwapStats | null>(null);

    // Interfaces
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

    interface Transaction {
        transaction_hash: string;
        from_address: string;
        to_address: string | null;
        value: string;
        block_timestamp: string;
        transaction_fee: string;
        is_contract: boolean;
        method?: string;
    }

    interface TokenTransfer {
        transaction_hash: string;
        block_timestamp: string;
        token_symbol: string;
        token_name: string;
        value: string;
        from_address: string;
        to_address: string;
        transfer_type: number; // 1 for out, 2 for in
    }

    interface TokenTransfersResponse {
        data: TokenTransfer[];
        total: number;
    }

    interface SwapStats {
        totalSwaps: number;
        totalVolumeUSD: number; // Assuming a stablecoin peg for now
        uniqueTokensSwapped: number;
    }

    interface TransactionListResponse {
        data: Transaction[];
        total: number;
    }

    interface ProfileResponse {
        balance: string;
        first_transaction: {
            block_timestamp: string;
            transaction_hash: string;
        } | null;
    }

    interface TokenHoldingResponseItem {
        token_address: string;
        balance: string;
        token_name: string;
        token_symbol: string;
        token_type: 'ERC20' | 'ERC721' | 'ERC1155';
    }
    
    interface TokenHoldingsResponse {
        data: TokenHoldingResponseItem[];
    }

    interface NFTCollection {
        token_address: string;
        token_name: string;
        token_symbol: string;
        amount: string;
    }

    interface TokenHolding {
        token_address: string;
        token_name: string;
        token_symbol: string;
        balance: string;
    }
    
    interface WalletData {
        address: string;
        balance: string;
        transactionsCount: number;
        firstTransactionHash: string | null;
        walletAge: string;
        firstTxDate: string;
        uniqueDays: Set<string>;
        uniqueWeeks: Set<string>;
        uniqueMonths: Set<string>;
        totalVolume: number;
        totalGasSpent: number;
        contractsInteracted: Set<string>;
        allTransactions: Transaction[];
        contractInteractionCounts: Map<string, number>;
        tokenTransfers: TokenTransfer[];
        createdContracts: Transaction[];
    }

    const getWalletLevel = (score: number) => {
        if (score >= 1000) return "Diamond";
        if (score >= 500) return "Platinum";
        if (score >= 250) return "Gold";
        if (score >= 100) return "Silver";
        if (score >= 50) return "Bronze";
        if (score >= 10) return "Copper";
        return "Novice";
    };

    const calculateWalletScore = (walletData: WalletData): WalletScore => {
        const transactionsScore = Math.min(walletData.transactionsCount, 1000);
        const contractCreationScore = walletData.createdContracts.length * 20;
        const contractInteractionScore = Math.min(walletData.contractsInteracted.size * 5, 500);
        const volumeScore = Math.min(Math.floor(walletData.totalVolume) * 2, 500);
        const uniqueDaysScore = walletData.uniqueDays.size * 2;
        const uniqueWeeksScore = walletData.uniqueWeeks.size * 5;
        const uniqueMonthsScore = walletData.uniqueMonths.size * 10;
        const totalScore = transactionsScore + contractCreationScore + contractInteractionScore +
            volumeScore + uniqueDaysScore + uniqueWeeksScore + uniqueMonthsScore;
        const level = getWalletLevel(totalScore);
        return { totalScore, transactionsScore, contractCreationScore, contractInteractionScore, volumeScore, uniqueDaysScore, uniqueWeeksScore, uniqueMonthsScore, level };
    };

    const isValidEthAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const address = e.target.value.trim();
        setWalletAddress(address);
        setIsValidAddress(address === '' || isValidEthAddress(address));
    };

    async function fetchAPI<T>(url: string): Promise<T> {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
        return response.json();
    }

    async function fetchAllTransactions(address: string) {
        const firstPage = await fetchAPI<TransactionListResponse>(`${PHAROS_TRANSACTIONS_API_URL}?address=${address}&size=1&page=1`);
        const total = firstPage.total;
        const pageSize = 500;
        const totalPages = Math.ceil(total / pageSize);
        if (totalPages === 0) return [];
        const promises = Array.from({ length: totalPages }, (_, i) =>
            fetchAPI<TransactionListResponse>(`${PHAROS_TRANSACTIONS_API_URL}?address=${address}&size=${pageSize}&page=${i + 1}`)
        );
        const results = await Promise.all(promises);
        return results.flatMap(r => r.data);
    }

    async function fetchTokenTransfers(address: string) {
        const response = await fetchAPI<TokenTransfersResponse>(`${PHAROS_TOKEN_TRANSFERS_API_URL}?address=${address}&size=500&page=1&type=tokentxns`);
        return response.data || [];
    }

    const processTransactions = (transactions: Transaction[], address: string) => {
        const data = {
            uniqueDays: new Set<string>(), uniqueWeeks: new Set<string>(), uniqueMonths: new Set<string>(),
            contractsInteracted: new Set<string>(), contractInteractionCounts: new Map<string, number>(),
            totalVolume: 0, totalGasSpent: 0
        };
        transactions.forEach(tx => {
            const date = parseISO(tx.block_timestamp);
            data.uniqueDays.add(format(date, 'yyyy-MM-dd'));
            data.uniqueWeeks.add(format(date, 'yyyy-ww'));
            data.uniqueMonths.add(format(date, 'yyyy-MM'));
            if (tx.from_address.toLowerCase() === address.toLowerCase()) {
                data.totalVolume += parseFloat(tx.value);
                data.totalGasSpent += parseFloat(tx.transaction_fee);
                if (tx.to_address && tx.is_contract) {
                    const contractAddr = tx.to_address.toLowerCase();
                    data.contractsInteracted.add(contractAddr);
                    data.contractInteractionCounts.set(contractAddr, (data.contractInteractionCounts.get(contractAddr) || 0) + 1);
                }
            }
        });
        return data;
    };

    const processSwapTransactions = (transfers: TokenTransfer[]) => {
        const uniqueTokens = new Set<string>();
        let totalVolume = 0;
        
        transfers.forEach(tx => {
            uniqueTokens.add(tx.token_symbol);
            totalVolume += parseFloat(tx.value);
        });

        return {
            totalSwaps: transfers.length,
            totalVolumeUSD: totalVolume,
            uniqueTokensSwapped: uniqueTokens.size,
        };
    };

    const fetchTokenAndNfts = async (address: string) => {
        setIsLoadingTokens(true);
        setIsLoadingNfts(true);
        try {
            const { data } = await fetchAPI<TokenHoldingsResponse>(`${PHAROS_TOKEN_HOLDINGS_API_URL}/${address}/token_holdings`);
            const tokens: TokenHolding[] = [];
            const nfts = new Map<string, NFTCollection>();
            (data || []).forEach(item => {
                if (item.token_type === 'ERC20') {
                    tokens.push({
                        token_address: item.token_address, token_name: item.token_name,
                        token_symbol: item.token_symbol, balance: parseFloat(item.balance).toFixed(4)
                    });
                } else if (item.token_type === 'ERC721' || item.token_type === 'ERC1155') {
                    const collection = nfts.get(item.token_address);
                    if (collection) {
                        collection.amount = (parseInt(collection.amount) + 1).toString();
                    } else {
                        nfts.set(item.token_address, {
                            token_address: item.token_address, token_name: item.token_name,
                            token_symbol: item.token_symbol, amount: '1'
                        });
                    }
                }
            });
            setTokenHoldings(tokens);
            setNftCollections(Array.from(nfts.values()));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingTokens(false);
            setIsLoadingNfts(false);
        }
    };
    
    const fetchWalletData = async () => {
        if (!isValidAddress || !walletAddress) return;
        setIsLoading(true);
        setError(null);
        setWalletData(null);
        setWalletScore(null);
        setTokenTransfers([]);
        setIsLoadingTokenTransfers(true);
        setVisibleTransactions(TRANSACTIONS_PER_PAGE);
        try {
            const [profileData, allTransactions, tokenTransfersData] = await Promise.all([
                fetchAPI<ProfileResponse>(`${PHAROS_PROFILE_API_URL}/${walletAddress}/profile`),
                fetchAllTransactions(walletAddress),
                fetchTokenTransfers(walletAddress),
                fetchTokenAndNfts(walletAddress)
            ]);

            const processedData = processTransactions(allTransactions, walletAddress);
            const processedSwaps = processSwapTransactions(tokenTransfersData);
            setSwapStats(processedSwaps);
            const createdContracts = allTransactions.filter(tx => tx.method === 'Contract Creation');

            const { first_transaction } = profileData;
            const fullWalletData: WalletData = {
                address: walletAddress,
                balance: profileData.balance,
                transactionsCount: allTransactions.length,
                firstTransactionHash: first_transaction?.transaction_hash || null,
                walletAge: first_transaction ? formatDistanceToNow(parseISO(first_transaction.block_timestamp), { addSuffix: true }) : 'N/A',
                firstTxDate: first_transaction ? format(parseISO(first_transaction.block_timestamp), 'PPpp') : 'N/A',
                allTransactions,
                tokenTransfers: tokenTransfersData,
                createdContracts,
                ...processedData
            };
            setTokenTransfers(tokenTransfersData);
            setWalletData(fullWalletData);
            setWalletScore(calculateWalletScore(fullWalletData));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
            setIsLoadingTokenTransfers(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchWalletData();
    };

    const formatAddress = (address: string) => address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '';

    const generateTwitterShareText = () => {
        if (!walletData || !walletScore) return '';
        return encodeURIComponent(
            `🔍 My #Pharos Wallet Stats on @socialscan_io:\n` +
            `🏆 Wallet SCORE: ${walletScore.totalScore}\n` +
            `🧠 Activity: ${walletData.uniqueDays.size} days | ${walletData.uniqueWeeks.size} weeks\n` +
            `📊 Transactions: ${walletData.transactionsCount}\n` +
            `\nCheck your stats at cryptowalletsx.com/pharos-stats-checker`
        );
    };

    const shareOnTwitter = () => window.open(`https://twitter.com/intent/tweet?text=${generateTwitterShareText()}`, '_blank');
    
    const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
        <div className={`bg-white shadow-lg rounded-2xl p-6 border border-gray-100 ${className}`}>
            {children}
        </div>
    );

    const StatItem = ({ icon, label, value, points }: { icon: React.ReactNode, label: string, value: React.ReactNode, points?: number }) => (
        <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center text-gray-500 mb-1">
                {icon}
                <span className="ml-2 text-sm font-medium">{label}</span>
            </div>
            <div className="text-xl font-semibold text-gray-800">
                {value}
                {points !== undefined && <span className="text-sm font-normal text-green-600 ml-2">({points} pts)</span>}
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="w-full max-w-6xl mx-auto p-4 sm:p-6">
                <div className="flex flex-col space-y-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
                            Pharos testnet stats checker
                        </h1>
                        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                            Explore detailed wallet analytics, transaction history, and calculate your Pharos testnet score.
                        </p>
                    </div>

                    <Card>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <label htmlFor="walletAddress" className="block text-base font-medium text-gray-700">
                                Enter Wallet Address to Analyze
                            </label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Wallet className="h-5 w-5 text-gray-400" /></div>
                                    <input id="walletAddress" type="text" value={walletAddress} onChange={handleAddressChange} placeholder="0x..."
                                        className={`pl-10 w-full py-3 border rounded-xl ${!isValidAddress ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`} />
                                </div>
                                <button type="submit" disabled={!isValidAddress || !walletAddress || isLoading}
                                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center hover:bg-blue-700 transition-colors">
                                    {isLoading ? 'Analyzing...' : <><Zap className="mr-2 h-5 w-5" /> Analyze Wallet</>}
                                </button>
                            </div>
                        </form>
                    </Card>

                    {error && <div className="p-4 rounded-xl bg-red-100 text-red-800 border border-red-200">{error}</div>}
                    
                    {isLoading && (
                        <Card className="flex flex-col justify-center items-center min-h-[300px]">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-blue-100 rounded-full"></div>
                                <div className="w-20 h-20 border-4 border-t-blue-600 animate-spin rounded-full absolute top-0 left-0"></div>
                            </div>
                            <h3 className="mt-6 text-lg font-semibold text-gray-700">Analyzing Wallet Data...</h3>
                        </Card>
                    )}

                    {walletData && walletScore && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <Card className="md:col-span-2">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Wallet Overview</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <StatItem icon={<Wallet size={20} />} label="Balance" value={<>{parseFloat(walletData.balance).toFixed(4)} <span className="text-base">$PHRS</span></>} />
                                        <StatItem icon={<Package size={20} />} label="Transactions" value={walletData.transactionsCount} />
                                        <StatItem icon={<Calendar size={20} />} label="Wallet Age" value={walletData.walletAge} />
                                        <StatItem icon={<FileText size={20} />} label="First Tx" value={<a href={`${PHAROS_EXPLORER_URL}/tx/${walletData.firstTransactionHash || ''}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{walletData.firstTxDate}</a>} />
                                    </div>
                                </Card>
                                <Card className="flex flex-col justify-center items-center text-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl">
                                    <h2 className="text-xl font-semibold mb-2">Wallet Score</h2>
                                    <p className="text-6xl font-bold drop-shadow-md">{walletScore.totalScore}</p>
                                    <button onClick={shareOnTwitter} className="mt-4 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg font-bold hover:bg-white/30 transition-colors">
                                        <Twitter size={18} /> Share
                                    </button>
                                </Card>
                            </div>

                            <Card>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Activity Stats</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <StatItem icon={<Activity size={20} />} label="Unique Active Days" value={walletData.uniqueDays.size} points={walletScore.uniqueDaysScore} />
                                    <StatItem icon={<Activity size={20} />} label="Unique Active Weeks" value={walletData.uniqueWeeks.size} points={walletScore.uniqueWeeksScore} />
                                    <StatItem icon={<Activity size={20} />} label="Unique Active Months" value={walletData.uniqueMonths.size} points={walletScore.uniqueMonthsScore} />
                                    <StatItem icon={<Coins size={20} />} label="Total Volume" value={<>{walletData.totalVolume.toFixed(4)} <span className="text-base">$PHRS</span></>} points={walletScore.volumeScore} />
                                    <StatItem icon={<Coins size={20} />} label="Total Gas Spent" value={<>{walletData.totalGasSpent.toFixed(4)} <span className="text-base">$PHRS</span></>} />
                                    <StatItem icon={<Shield size={20} />} label="Contracts Created" value={walletData.createdContracts.length} points={walletScore.contractCreationScore} />
                                </div>
                            </Card>

                            {swapStats && (
                                <Card>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Swap Stats</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <StatItem icon={<Repeat size={20} />} label="Total Swaps" value={swapStats.totalSwaps} />
                                        <StatItem icon={<Coins size={20} />} label="Total Volume (USD)" value={`$${swapStats.totalVolumeUSD.toFixed(2)}`} />
                                        <StatItem icon={<Shield size={20} />} label="Unique Tokens Swapped" value={swapStats.uniqueTokensSwapped} />
                                    </div>
                                </Card>
                            )}

                            {tokenTransfers.length > 0 && (
                                <Card>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-bold text-gray-800">ERC20 Token Transfers ({tokenTransfers.length})</h2>
                                        <button onClick={() => setShowTokenTransfers(!showTokenTransfers)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">{showTokenTransfers ? 'Hide' : 'Show'}</button>
                                    </div>
                                    {showTokenTransfers && (
                                        <>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hash</th>
                                                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                                                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                                                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {tokenTransfers.slice(0, visibleTokenTransfers).map((tx, i) => (
                                                            <tr key={i}>
                                                                <td className="p-4">
                                                                    {tx.transfer_type === 2 ? (
                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><ArrowDown size={14} className="mr-1"/> In</span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><ArrowUp size={14} className="mr-1"/> Out</span>
                                                                    )}
                                                                </td>
                                                                <td className="p-4 font-mono text-sm"><a href={`${PHAROS_EXPLORER_URL}/tx/${tx.transaction_hash}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{formatAddress(tx.transaction_hash)}</a></td>
                                                                <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{format(parseISO(tx.block_timestamp), 'PPp')}</td>
                                                                <td className="p-4 font-mono text-sm"><a href={`${PHAROS_EXPLORER_URL}/address/${tx.from_address}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{formatAddress(tx.from_address)}</a></td>
                                                                <td className="p-4 font-mono text-sm"><a href={`${PHAROS_EXPLORER_URL}/address/${tx.to_address}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{formatAddress(tx.to_address)}</a></td>
                                                                <td className="p-4 text-sm">{parseFloat(tx.value).toFixed(4)} {tx.token_symbol}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {visibleTokenTransfers < tokenTransfers.length && (
                                                <div className="mt-6 text-center">
                                                    <button onClick={() => setVisibleTokenTransfers(prev => prev + TRANSACTIONS_PER_PAGE)} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                                                        Load More
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </Card>
                            )}
                            
                            <Card>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-gray-800">Interacted Contracts ({walletData.contractsInteracted.size})</h2>
                                    <button onClick={() => setShowInteractedContracts(!showInteractedContracts)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">{showInteractedContracts ? 'Hide' : 'Show'}</button>
                                </div>
                                {showInteractedContracts && (
                                    <div className="overflow-x-auto border rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interactions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {Array.from(walletData.contractsInteracted).map((addr, i) => 
                                                <tr key={i}>
                                                    <td className="p-4 font-mono"><a href={`${PHAROS_EXPLORER_URL}/address/${addr}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{addr}</a></td>
                                                    <td className="p-4">{walletData.contractInteractionCounts.get(addr)}</td>
                                                </tr>)}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Card>

                            {walletData.createdContracts.length > 0 && (
                                <Card>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-bold text-gray-800">Created Contracts ({walletData.createdContracts.length})</h2>
                                        <button onClick={() => setShowCreatedContracts(!showCreatedContracts)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">{showCreatedContracts ? 'Hide' : 'Show'}</button>
                                    </div>
                                    {showCreatedContracts && (
                                        <div className="overflow-x-auto border rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contract Address</th>
                                                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Hash</th>
                                                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {walletData.createdContracts.map((tx, i) =>
                                                        <tr key={i}>
                                                            <td className="p-4 font-mono">
                                                                {tx.to_address && <a href={`${PHAROS_EXPLORER_URL}/address/${tx.to_address}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{tx.to_address}</a>}
                                                            </td>
                                                            <td className="p-4 font-mono">
                                                                <a href={`${PHAROS_EXPLORER_URL}/tx/${tx.transaction_hash}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{formatAddress(tx.transaction_hash)}</a>
                                                            </td>
                                                            <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{format(parseISO(tx.block_timestamp), 'PPp')}</td>
                                                        </tr>)}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </Card>
                            )}

                            <Card>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-gray-800">Transaction History ({walletData.allTransactions.length})</h2>
                                    <button onClick={() => setShowTransactions(!showTransactions)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">{showTransactions ? 'Hide' : 'Show'}</button>
                                </div>
                                {showTransactions && (
                                    <>
                                        <div className="overflow-x-auto border rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hash</th>
                                                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                                                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                                                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {walletData.allTransactions.slice(0, visibleTransactions).map((tx, i) => (
                                                        <tr key={i}>
                                                            <td className="p-4 font-mono text-sm"><a href={`${PHAROS_EXPLORER_URL}/tx/${tx.transaction_hash}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{formatAddress(tx.transaction_hash)}</a></td>
                                                            <td className="p-4 font-mono text-sm"><a href={`${PHAROS_EXPLORER_URL}/address/${tx.from_address}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{formatAddress(tx.from_address)}</a></td>
                                                            <td className="p-4 font-mono text-sm">{tx.to_address ? <a href={`${PHAROS_EXPLORER_URL}/address/${tx.to_address}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{formatAddress(tx.to_address)}</a> : 'N/A'}</td>
                                                            <td className="p-4 text-sm">{parseFloat(tx.value).toFixed(4)} $PHRS</td>
                                                            <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{format(parseISO(tx.block_timestamp), 'PPp')}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {visibleTransactions < walletData.allTransactions.length && (
                                            <div className="mt-6 text-center">
                                                <button onClick={() => setVisibleTransactions(prev => prev + TRANSACTIONS_PER_PAGE)} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                                                    Load More
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </Card>

                            <Card>
                              <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-gray-800">NFT Collections ({nftCollections.length})</h2>
                                <button onClick={() => setShowNfts(!showNfts)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">{showNfts ? 'Hide' : 'Show'}</button>
                              </div>
                              {showNfts && !isLoadingNfts && (
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                  {nftCollections.map((coll, i) => (
                                    <div key={i} className="border p-4 rounded-lg hover:shadow-md transition-shadow">
                                      <h3 className="font-bold text-gray-800 truncate">{coll.token_name ?? 'Unknown Collection'} ({coll.token_symbol ?? '---'})</h3>
                                      <p className="text-gray-600">{coll.amount} items</p>
                                      <a href={`${PHAROS_EXPLORER_URL}/token/${coll.token_address}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm mt-2 inline-block">View Collection <ExternalLink className="inline h-4 w-4 ml-1"/></a>
                                    </div>
                                  ))}
                                </div>
                              )}
                               {showNfts && isLoadingNfts && <div className="text-center p-4 text-gray-500">Loading NFTs...</div>}
                            </Card>

                            <Card>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-gray-800">Token Holdings ({tokenHoldings.length})</h2>
                                    <button onClick={() => setShowTokens(!showTokens)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">{showTokens ? 'Hide' : 'Show'}</button>
                                </div>
                                {showTokens && !isLoadingTokens && (
                                    <div className="overflow-x-auto border rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50"><tr><th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th><th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th></tr></thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {tokenHoldings.map((token, i) => <tr key={i}><td className="p-4">{token.token_name ?? 'Unknown Token'} ({token.token_symbol ?? '---'})</td><td className="p-4">{token.balance}</td></tr>)}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                 {showTokens && isLoadingTokens && <div className="text-center p-4 text-gray-500">Loading Tokens...</div>}
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}