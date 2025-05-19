import { NFTCollection, TokenHolding, InkToken } from './types';

const API_BASE = 'https://explorer.inkonchain.com/api/v2';

interface Transaction {
  hash: string;
  timestamp: string;
  created_contract?: {
    hash: string;
    is_verified: boolean;
    name?: string;
  };
  to?: {
    hash: string;
    name?: string;
    is_contract: boolean;
    is_verified: boolean;
  };
  from: {
    hash: string;
  };
  value: string;
  gas_used: string;
  gas_price: string;
  fee: {
    type: string;
    value: string;
  };
  method?: string;
}

interface ApiResponse {
  items: Transaction[];
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

interface WalletCounters {
  transactions_count: string;
  token_transfers_count: string;
  gas_usage_count: string;
  validations_count: string;
}

interface WalletBalance {
  coin_balance: string;
  exchange_rate: string;
}

interface CoinBalanceHistoryItem {
  block_number: number;
  block_timestamp: string;
  delta: string;
  transaction_hash: string | null;
  value: string;
}

interface CoinBalanceHistoryResponse {
  items: CoinBalanceHistoryItem[];
  next_page_params: any;
}

export interface InkStats {
  walletAgeDays: number;
  firstTransactionDate: string;
  firstTransactionHash: string;
  uniqueContractsCount: number;
  uniqueDays: number;
  uniqueWeeks: number;
  uniqueMonths: number;
  totalTransactions: number;
  gasUsage: string;
  gasUsageEther: string;
  gasUsageUSD: string;
  tokenTransfers: string;
  validations: string;
  nativeBalance: number;
  nativeBalanceUSD: string;
  contractsCreated: Array<{
    hash: string;
    isVerified: boolean;
    name?: string;
    timestamp: string;
  }>;
  verifiedContractsCount: number;
  contractsInteracted: Array<{
    address: string;
    name?: string;
    isVerified: boolean;
    interactionCount: number;
  }>;
  balanceHistory: CoinBalanceHistoryItem[];
}

async function getAllTransactions(address: string): Promise<Transaction[]> {
  let allTransactions: Transaction[] = [];
  let nextPage = null;
  const PAGE_SIZE = 50;

  try {
    do {
      let url = `${API_BASE}/addresses/${address}/transactions?items_count=${PAGE_SIZE}`;
      
      if (nextPage) {
        url += `&block_number=${nextPage.block_number}&fee=${nextPage.fee}&hash=${nextPage.hash}&index=${nextPage.index}&inserted_at=${nextPage.inserted_at}&items_count=${nextPage.items_count}&value=${nextPage.value}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.items && data.items.length > 0) {
        allTransactions = [...allTransactions, ...data.items];
      }

      nextPage = data.next_page_params;
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } while (nextPage);

    return allTransactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

async function getWalletCounters(address: string): Promise<WalletCounters> {
  try {
    const response = await fetch(`${API_BASE}/addresses/${address}/counters`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching wallet counters:', error);
    return {
      transactions_count: '0',
      token_transfers_count: '0',
      gas_usage_count: '0',
      validations_count: '0'
    };
  }
}

async function getWalletBalance(address: string): Promise<WalletBalance> {
  try {
    const response = await fetch(`${API_BASE}/addresses/${address}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return {
      coin_balance: data.coin_balance || '0',
      exchange_rate: data.exchange_rate || '0'
    };
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return {
      coin_balance: '0',
      exchange_rate: '0'
    };
  }
}

async function getBalanceHistory(address: string): Promise<CoinBalanceHistoryItem[]> {
  try {
    const response = await fetch(`${API_BASE}/addresses/${address}/coin-balance-history`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: CoinBalanceHistoryResponse = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching balance history:', error);
    return [];
  }
}

function getISOWeek(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNum = (date.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNum + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function calculateWalletStats(transactions: Transaction[], counters: WalletCounters, balance: WalletBalance, balanceHistory: CoinBalanceHistoryItem[]): InkStats {
  const uniqueDatesSet = new Set<string>();
  const uniqueWeeksSet = new Set<string>();
  const uniqueMonthsSet = new Set<string>();
  const createdContracts: Array<{
    hash: string;
    isVerified: boolean;
    name?: string;
    timestamp: string;
  }> = [];
  const contractInteractions = new Map<string, {
    name?: string;
    isVerified: boolean;
    count: number;
  }>();
  let verifiedContractsCount = 0;
  let firstTransaction: Transaction | null = null;

  const uniqueContractsSet = new Set<string>();

  transactions.forEach(tx => {
    // Find first transaction
    if (!firstTransaction || new Date(tx.timestamp) < new Date(firstTransaction.timestamp)) {
      firstTransaction = tx;
    }

    const txDate = new Date(tx.timestamp);

    if (tx.to?.is_contract) {
      uniqueContractsSet.add(tx.to.hash);
      
      const current = contractInteractions.get(tx.to.hash) || {
        name: tx.to.name,
        isVerified: tx.to.is_verified,
        count: 0
      };
      current.count++;
      contractInteractions.set(tx.to.hash, current);
    }

    if (tx.created_contract) {
      createdContracts.push({
        hash: tx.created_contract.hash,
        isVerified: tx.created_contract.is_verified,
        name: tx.created_contract.name,
        timestamp: tx.timestamp
      });
      if (tx.created_contract.is_verified) {
        verifiedContractsCount++;
      }
    }

    uniqueDatesSet.add(txDate.toISOString().split('T')[0]);
    
    const year = txDate.getFullYear();
    const weekNum = getISOWeek(txDate);
    uniqueWeeksSet.add(`${year}-W${weekNum}`);
    
    uniqueMonthsSet.add(`${year}-${(txDate.getMonth() + 1).toString().padStart(2, '0')}`);
  });

  const contractsInteracted = Array.from(contractInteractions.entries()).map(([address, data]) => ({
    address,
    name: data.name,
    isVerified: data.isVerified,
    interactionCount: data.count
  })).sort((a, b) => b.interactionCount - a.interactionCount);

  const gasUsage = counters.gas_usage_count || '0';
  const gasUsageEther = (parseFloat(gasUsage) / 1e9).toFixed(9);
  const exchangeRate = parseFloat(balance.exchange_rate);
  const gasUsageUSD = (parseFloat(gasUsageEther) * exchangeRate).toFixed(2);
  
  const balanceInEther = parseFloat(balance.coin_balance) / 1e18;
  const usdValue = balanceInEther * exchangeRate;

  // Calculate wallet age
  const today = new Date();
  const firstDate = firstTransaction ? new Date((firstTransaction as Transaction).timestamp) : today;
  const walletAgeDays = Math.floor((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

  return {
    walletAgeDays: Math.max(0, walletAgeDays),
    firstTransactionDate: firstTransaction ? formatDate(new Date((firstTransaction as Transaction).timestamp)) : 'N/A',
    firstTransactionHash: firstTransaction ? (firstTransaction as Transaction).hash : '',
    uniqueContractsCount: uniqueContractsSet.size,
    uniqueDays: uniqueDatesSet.size,
    uniqueWeeks: uniqueWeeksSet.size,
    uniqueMonths: uniqueMonthsSet.size,
    totalTransactions: parseInt(counters.transactions_count || '0'),
    gasUsage,
    gasUsageEther,
    gasUsageUSD,
    tokenTransfers: counters.token_transfers_count || '0',
    validations: counters.validations_count || '0',
    nativeBalance: balanceInEther,
    nativeBalanceUSD: usdValue.toFixed(2),
    contractsCreated: createdContracts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    verifiedContractsCount,
    contractsInteracted,
    balanceHistory
  };
}

export async function fetchInkStats(address: string) {
  try {
    const [transactions, counters, balance, balanceHistory] = await Promise.all([
      getAllTransactions(address),
      getWalletCounters(address),
      getWalletBalance(address),
      getBalanceHistory(address)
    ]);
    
    const stats = calculateWalletStats(transactions, counters, balance, balanceHistory);
    
    return stats;
  } catch (error) {
    console.error('Error fetching INK stats:', error);
    throw new Error('Failed to fetch wallet statistics. Please try again.');
  }
}

export async function fetchInkTokens(address: string): Promise<InkToken[]> {
  try {
    const response = await fetch(`${API_BASE}/addresses/${address}/tokens?type=ERC-20`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return [];
  }
}

export async function fetchInkNFTs(address: string): Promise<NFTCollection[]> {
  try {
    const response = await fetch(`${API_BASE}/addresses/${address}/nft/collections?type=ERC-721,ERC-404,ERC-1155`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
}