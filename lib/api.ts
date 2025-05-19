import { TokenHolding, NFTHolding, WalletStats } from '../types';

// Cache for wallet data
const statsCache = new Map<string, {
  data: WalletStats;
  timestamp: number;
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function fetchWalletStats(address: string): Promise<WalletStats> {
  const cached = statsCache.get(address);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const stats: WalletStats = {
      address,
      balance: '0',
      transactionCount: 0,
      firstActivity: 'N/A',
      erc20TransfersCount: 0,
      erc721TransfersCount: 0,
      erc1155TransfersCount: 0,
      contractsInteracted: [],
      contractsCreated: [],
      verifiedContractsCount: 0,
      mitoBalance: '0',
      wmitoBalance: '0',
      totalBalance: '0'
    };

    statsCache.set(address, {
      data: stats,
      timestamp: Date.now()
    });

    return stats;
  } catch (error) {
    console.error('Error fetching wallet stats:', error);
    return {
      address,
      balance: '0',
      transactionCount: 0,
      firstActivity: 'N/A',
      erc20TransfersCount: 0,
      erc721TransfersCount: 0,
      erc1155TransfersCount: 0,
      contractsInteracted: [],
      contractsCreated: [],
      verifiedContractsCount: 0,
      mitoBalance: '0',
      wmitoBalance: '0',
      totalBalance: '0'
    };
  }
}

export async function fetchMultipleWalletStats(addresses: string[]): Promise<WalletStats[]> {
  try {
    return addresses.map(address => ({
      address,
      balance: '0',
      transactionCount: 0,
      firstActivity: 'N/A',
      erc20TransfersCount: 0,
      erc721TransfersCount: 0,
      erc1155TransfersCount: 0,
      contractsInteracted: [],
      contractsCreated: [],
      verifiedContractsCount: 0,
      mitoBalance: '0',
      wmitoBalance: '0',
      totalBalance: '0'
    }));
  } catch (error) {
    console.error('Error fetching multiple wallet stats:', error);
    return addresses.map(address => ({
      address,
      balance: '0',
      transactionCount: 0,
      firstActivity: 'N/A',
      erc20TransfersCount: 0,
      erc721TransfersCount: 0,
      erc1155TransfersCount: 0,
      contractsInteracted: [],
      contractsCreated: [],
      verifiedContractsCount: 0,
      mitoBalance: '0',
      wmitoBalance: '0',
      totalBalance: '0'
    }));
  }
}

export async function fetchTokenHoldings(_address: string): Promise<TokenHolding[]> {
  return [];
}

export async function fetchNFTHoldings(_address: string): Promise<NFTHolding[]> {
  return [];
}

export async function fetchERC1155Holdings(_address: string): Promise<NFTHolding[]> {
  return [];
}