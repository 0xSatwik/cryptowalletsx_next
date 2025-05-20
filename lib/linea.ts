import { getRandomApiKey, LINEA_EXPLORER_URL, LINEA_API_BASE, LINEA_EXPLORER_API, LXP_API } from './config';

interface Transaction {
  hash: string;
  timeStamp: string;
  from: string;
  to: string;
  contractAddress: string;
  isError: string;
  input: string;
}

interface LineaStats {
  balance: {
    eth: string;
    usd: string;
  };
  gasUsed: {
    eth: string;
    usd: string;
  };
  lxp: {
    balance: string;
    rank: number;
  };
  lxpL: {
    xp: number;
    rank: number;
    alp: number;
    plp: number;
    ep: number;
    rp: number;
    vp: number;
    bp: number;
    ea_flag?: number;
  };
  walletAge: {
    days: number;
    creationDate: string;
  };
  activity: {
    totalDays: number;
    totalWeeks: number;
    totalMonths: number;
  };
  transactions: {
    total: number;
    transfers: number;
  };
  contracts: {
    created: {
      total: number;
      verified: number;
      list: Array<{
        address: string;
        name?: string;
        isVerified: boolean;
        timestamp: string;
      }>;
    };
    interacted: {
      total: number;
      verified: number;
      list: Array<{
        address: string;
        name?: string;
        isVerified: boolean;
        interactionCount: number;
      }>;
    };
  };
}

interface NFTCollection {
  amount: string;
  token: {
    address: string;
    name: string;
    symbol: string;
    holders: string;
    total_supply: string | null;
    type: string;
  };
  token_instances: Array<{
    id: string;
    image_url: string | null;
    metadata: {
      name: string;
      description: string;
      image?: string;
      attributes?: Array<{
        trait_type: string;
        value: string | number;
      }>;
    };
    token_type: string;
    value: string;
  }>;
}

interface TokenHolding {
  token: {
    address: string;
    decimals: string;
    holders: string;
    name: string;
    symbol: string;
    total_supply: string;
    type: string;
  };
  value: string;
}

const RETRY_DELAY = 1000; // 1 second
const MAX_RETRIES = 3;

// Function to fetch with automatic retries and API key rotation
async function fetchWithRetry(
  url: string, 
  options: RequestInit = {}, 
  retries = MAX_RETRIES
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    // If we get rate limited (429) or server error (5xx), retry with a different API key
    if ((response.status === 429 || (response.status >= 500 && response.status < 600)) && retries > 0) {
      console.log(`Request failed with status ${response.status}, retrying... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      // The next attempt will automatically get a different API key through getRandomApiKey()
      return fetchWithRetry(url, options, retries - 1);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Fetch error, retrying... (${retries} retries left):`, error);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export async function fetchTransactions(address: string) {
  try {
    // Use getRandomApiKey from config.ts to rotate through available API keys
    const apiKey = getRandomApiKey();
    const url = `${LINEA_API_BASE}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
    
    const response = await fetchWithRetry(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.status === '0' && data.message === 'No transactions found') {
      return [];
    }
    
    if (data.status !== '1') {
      throw new Error(`API error: ${data.message}`);
    }
    
    return data.result;
  } catch (error) {
    console.error('Error fetching Linea transactions:', error);
    throw new Error('Failed to fetch transaction data. Please try again.');
  }
}

async function fetchBalance(address: string): Promise<string> {
  const apiKey = getRandomApiKey();
  const response = await fetch(
    `${LINEA_API_BASE}?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
  );
  const data = await response.json();
  return data.result || '0';
}

async function fetchEthPrice(): Promise<number> {
  try {
    const response = await fetch('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD');
    const data = await response.json();
    return data.USD || 0;
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    return 0;
  }
}

async function fetchLXPBalance(address: string): Promise<{ balance: string; rank: number }> {
  try {
    const response = await fetch(
      `${LINEA_EXPLORER_API}/addresses/${address}/tokens?type=ERC-20`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const LXP_CONTRACT_ADDRESS = '0xd83af4fbD77f3AB65C3B1Dc4B38D7e67AEcf599A';
    
    const lxpToken = data.items?.find(
      (token: any) => token.token.address.toLowerCase() === LXP_CONTRACT_ADDRESS.toLowerCase()
    );

    if (lxpToken) {
      return {
        balance: lxpToken.value,
        rank: 0 // Placeholder for ranking data
      };
    }

    return { balance: '0', rank: 0 };
  } catch (error) {
    console.error('Error fetching LXP balance:', error);
    return { balance: '0', rank: 0 };
  }
}

async function fetchLXPLStats(address: string) {
  try {
    // Convert address to lowercase to ensure consistency
    const lowerAddress = address.toLowerCase();
    
    // Add cache-busting query parameter
    const timestamp = Date.now();
    const response = await fetch(
      `${LXP_API}/getUserPointsSearch?user=${lowerAddress}&_t=${timestamp}`,
      {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if we have data and it's an array
    if (!Array.isArray(data) || data.length === 0) {
      console.log('No LXP-L data found for address:', lowerAddress);
      return {
        rank: 0,
        xp: 0,
        alp: 0,
        plp: 0,
        ep: 0,
        rp: 0,
        vp: 0,
        bp: 0
      };
    }

    // Get the first item from the array
    const stats = data[0];
    
    // Map the response fields correctly
    return {
      rank: parseInt(stats.rank_xp) || 0,
      xp: parseInt(stats.xp) || 0,
      alp: parseInt(stats.alp) || 0,
      plp: parseInt(stats.plp) || 0,
      ep: parseInt(stats.ep) || 0,
      rp: parseInt(stats.rp) || 0,
      vp: parseInt(stats.vp) || 0,
      bp: parseInt(stats.bp) || 0,
      ea_flag: stats.ea_flag
    };
  } catch (error) {
    console.error('Error fetching LXP-L stats:', error);
    // Return default values in case of error
    return {
      rank: 0,
      xp: 0,
      alp: 0,
      plp: 0,
      ep: 0,
      rp: 0,
      vp: 0,
      bp: 0
    };
  }
}

async function fetchWalletCounters(address: string) {
  const response = await fetch(`${LINEA_EXPLORER_API}/addresses/${address}/counters`);
  return await response.json();
}

async function fetchNFTs(address: string): Promise<NFTCollection[]> {
  const response = await fetch(
    `${LINEA_EXPLORER_API}/addresses/${address}/nft/collections?type=ERC-721,ERC-404,ERC-1155`
  );
  const data = await response.json();
  return data.items || [];
}

async function fetchTokens(address: string): Promise<TokenHolding[]> {
  const response = await fetch(
    `${LINEA_EXPLORER_API}/addresses/${address}/tokens?type=ERC-20`
  );
  const data = await response.json();
  return data.items || [];
}

function calculateActivityStats(transactions: Transaction[]) {
  const uniqueDates = new Set<string>();
  const uniqueWeeks = new Set<string>();
  const uniqueMonths = new Set<string>();

  transactions.forEach(tx => {
    const date = new Date(parseInt(tx.timeStamp) * 1000);
    uniqueDates.add(date.toISOString().split('T')[0]);
    uniqueWeeks.add(`${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`);
    uniqueMonths.add(`${date.getFullYear()}-${date.getMonth() + 1}`);
  });

  return {
    totalDays: uniqueDates.size,
    totalWeeks: uniqueWeeks.size,
    totalMonths: uniqueMonths.size,
  };
}

function calculateWalletAge(transactions: Transaction[]) {
  if (!transactions.length) return { days: 0, creationDate: 'N/A' };
  
  const firstTx = transactions[0];
  const firstDate = new Date(parseInt(firstTx.timeStamp) * 1000);
  const now = new Date();
  const days = Math.floor((now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    days,
    creationDate: firstDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };
}

function processContractInteractions(transactions: Transaction[]) {
  const contractsCreated = new Map<string, {
    name?: string;
    isVerified: boolean;
    timestamp: string;
  }>();

  const contractInteractions = new Map<string, {
    name?: string;
    isVerified: boolean;
    count: number;
  }>();

  transactions.forEach(tx => {
    if (tx.contractAddress) {
      contractsCreated.set(tx.contractAddress.toLowerCase(), {
        isVerified: false,
        timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
      });
    }

    if (tx.to && tx.input !== '0x') {
      const addr = tx.to.toLowerCase();
      const current = contractInteractions.get(addr) || {
        isVerified: false,
        count: 0,
      };
      current.count++;
      contractInteractions.set(addr, current);
    }
  });

  return {
    created: {
      total: contractsCreated.size,
      verified: 0,
      list: Array.from(contractsCreated.entries()).map(([address, data]) => ({
        address,
        ...data,
      })),
    },
    interacted: {
      total: contractInteractions.size,
      verified: 0,
      list: Array.from(contractInteractions.entries()).map(([address, data]) => ({
        address,
        ...data,
        interactionCount: data.count,
      })),
    },
  };
}

export async function fetchLineaStats(address: string): Promise<LineaStats> {
  try {
    const [
      transactions,
      balanceWei,
      lxpData,
      lxpLData,
      counters,
      ethPrice
    ] = await Promise.all([
      fetchTransactions(address),
      fetchBalance(address),
      fetchLXPBalance(address),
      fetchLXPLStats(address),
      fetchWalletCounters(address),
      fetchEthPrice()
    ]);

    const balanceEth = Number(balanceWei) / 1e18;
    const balanceUsd = balanceEth * ethPrice;

    const activityStats = calculateActivityStats(transactions);
    const walletAge = calculateWalletAge(transactions);
    const contracts = processContractInteractions(transactions);

    // Convert gas used from Gwei to ETH and then to USD
    const gasUsedEth = Number(counters.gas_usage_count || '0') / 1e9;
    const gasUsedUsd = gasUsedEth * ethPrice;

    return {
      balance: {
        eth: balanceEth.toFixed(4),
        usd: balanceUsd.toFixed(2),
      },
      gasUsed: {
        eth: gasUsedEth.toFixed(9),
        usd: gasUsedUsd.toFixed(2),
      },
      lxp: {
        balance: lxpData.balance,
        rank: lxpData.rank,
      },
      lxpL: {
        xp: lxpLData.xp || 0,
        rank: lxpLData.rank || 0,
        alp: lxpLData.alp || 0,
        plp: lxpLData.plp || 0,
        ep: lxpLData.ep || 0,
        rp: lxpLData.rp || 0,
        vp: lxpLData.vp || 0,
        bp: lxpLData.bp || 0,
        ea_flag: lxpLData.ea_flag
      },
      walletAge,
      activity: activityStats,
      transactions: {
        total: parseInt(counters.transactions_count || '0'),
        transfers: parseInt(counters.token_transfers_count || '0'),
      },
      contracts,
    };
  } catch (error) {
    console.error('Error fetching Linea stats:', error);
    throw new Error('Failed to fetch wallet statistics');
  }
}

export async function fetchLineaNFTs(address: string): Promise<NFTCollection[]> {
  try {
    return await fetchNFTs(address);
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
}

export async function fetchLineaTokens(address: string): Promise<TokenHolding[]> {
  try {
    return await fetchTokens(address);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return [];
  }
}