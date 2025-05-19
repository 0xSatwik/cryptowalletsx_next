// Removed the unused import 'ERC1155Balance'

// Instead of worker URLs, now using direct ThirdWeb API URL
const THIRDWEB_API_BASE_URL = 'https://insight.thirdweb.com/v1';
const CHAIN_ID = '10143'; // Monad Testnet
const RPC_URL = 'https://testnet-rpc.monad.xyz/';
const FALLBACK_RPC_URL = 'https://monad-testnet.g.alchemy.com/v2/Y6U2X0V3ZctvYO58CKfsEvCWQNNZgpVp';
const SOCIALSCAN_API_BASE_URL = 'https://api.socialscan.io/rest/monad-testnet/v1/explorer';

// Load Alchemy API keys from environment variables
const ALCHEMY_API_KEYS = [
  process.env.VITE_ALCHEMY_API_KEY_1 || 'FBKOVxVYW0yobV1ntzs7u5qM0E6_xRwO',
  process.env.VITE_ALCHEMY_API_KEY_2 || 'FBKOVxVYW0yobV1ntzs7u5qM0E6_xRwO',
  process.env.VITE_ALCHEMY_API_KEY_3 || 'FBKOVxVYW0yobV1ntzs7u5qM0E6_xRwO',
  process.env.VITE_ALCHEMY_API_KEY_4 || 'FBKOVxVYW0yobV1ntzs7u5qM0E6_xRwO',
  process.env.VITE_ALCHEMY_API_KEY_5 || 'FBKOVxVYW0yobV1ntzs7u5qM0E6_xRwO',
  process.env.VITE_ALCHEMY_API_KEY_6 || 'FBKOVxVYW0yobV1ntzs7u5qM0E6_xRwO',
  process.env.VITE_ALCHEMY_API_KEY_7 || 'FBKOVxVYW0yobV1ntzs7u5qM0E6_xRwO',
  process.env.VITE_ALCHEMY_API_KEY_8 || 'FBKOVxVYW0yobV1ntzs7u5qM0E6_xRwO',
  process.env.VITE_ALCHEMY_API_KEY_9 || 'FBKOVxVYW0yobV1ntzs7u5qM0E6_xRwO',
  process.env.VITE_ALCHEMY_API_KEY_10 || 'FBKOVxVYW0yobV1ntzs7u5qM0E6_xRwO',
];

// Track usage of Alchemy API keys to distribute load
const alchemyApiUsageCount: Record<string, number> = {};
ALCHEMY_API_KEYS.forEach(key => {
  alchemyApiUsageCount[key] = 0;
});

// Function to get a randomized Alchemy API key, with preference for less used keys
function getAlchemyApiKey(): string {
  // Sort keys by usage count (ascending)
  const sortedKeys = [...ALCHEMY_API_KEYS].sort((a, b) => 
    (alchemyApiUsageCount[a] || 0) - (alchemyApiUsageCount[b] || 0)
  );
  
  // Take one of the least used keys (random selection from the 3 least used)
  const leastUsedCount = Math.min(3, sortedKeys.length);
  const randomIndex = Math.floor(Math.random() * leastUsedCount);
  const selectedKey = sortedKeys[randomIndex];
  
  // Increment usage count
  alchemyApiUsageCount[selectedKey] = (alchemyApiUsageCount[selectedKey] || 0) + 1;
  
  return selectedKey;
}

// Generate Alchemy API URL for transaction endpoints
function getAlchemyTransactionApiUrl(): string {
  const apiKey = getAlchemyApiKey();
  return `https://monad-testnet.g.alchemy.com/v2/${apiKey}`;
}

// Generate Alchemy API URL for NFT endpoints
function getAlchemyNftApiUrl(): string {
  const apiKey = getAlchemyApiKey();
  return `https://monad-testnet.g.alchemy.com/nft/v3/${apiKey}`;
}

// Load multiple ThirdWeb client IDs from environment variables (supporting up to 18 keys)
const THIRDWEB_CLIENT_ID_1 = process.env.VITE_THIRDWEB_CLIENT_ID_1 || '';
const THIRDWEB_CLIENT_ID_2 = process.env.VITE_THIRDWEB_CLIENT_ID_2 || '';
const THIRDWEB_CLIENT_ID_3 = process.env.VITE_THIRDWEB_CLIENT_ID_3 || '';

const THIRDWEB_CLIENT_ID_7 = process.env.VITE_THIRDWEB_CLIENT_ID_7 || '';

const THIRDWEB_CLIENT_ID_9 = process.env.VITE_THIRDWEB_CLIENT_ID_9 || '';
const THIRDWEB_CLIENT_ID_10 = process.env.VITE_THIRDWEB_CLIENT_ID_10 || '';
const THIRDWEB_CLIENT_ID_11 = process.env.VITE_THIRDWEB_CLIENT_ID_11 || '';
const THIRDWEB_CLIENT_ID_12 = process.env.VITE_THIRDWEB_CLIENT_ID_12 || '';
const THIRDWEB_CLIENT_ID_13 = process.env.VITE_THIRDWEB_CLIENT_ID_13 || '';
const THIRDWEB_CLIENT_ID_14 = process.env.VITE_THIRDWEB_CLIENT_ID_14 || '';
const THIRDWEB_CLIENT_ID_15 = process.env.VITE_THIRDWEB_CLIENT_ID_15 || '';
const THIRDWEB_CLIENT_ID_16 = process.env.VITE_THIRDWEB_CLIENT_ID_16 || '';
const THIRDWEB_CLIENT_ID_17 = process.env.VITE_THIRDWEB_CLIENT_ID_17 || '';
const THIRDWEB_CLIENT_ID_18 = process.env.VITE_THIRDWEB_CLIENT_ID_18 || '';

// For backward compatibility - if individual IDs aren't set but the old variable is
const LEGACY_CLIENT_ID = process.env.VITE_THIRDWEB_CLIENT_ID || '';

// Create an array of token-specific client IDs (first 3 keys)
const TOKEN_CLIENT_IDS = [
  THIRDWEB_CLIENT_ID_1, 
  THIRDWEB_CLIENT_ID_2, 
  THIRDWEB_CLIENT_ID_3
].filter(id => id !== '');

// Create an array of transaction-specific client IDs (excluding problematic ones)
const TRANSACTION_CLIENT_IDS = [
  // Skip client IDs 4, 5, 6, and 8 as they're causing timeouts
  THIRDWEB_CLIENT_ID_7,
  THIRDWEB_CLIENT_ID_9,
  THIRDWEB_CLIENT_ID_10,
  THIRDWEB_CLIENT_ID_11,
  THIRDWEB_CLIENT_ID_12,
  THIRDWEB_CLIENT_ID_13,
  THIRDWEB_CLIENT_ID_14,
  THIRDWEB_CLIENT_ID_15,
  THIRDWEB_CLIENT_ID_16,
  THIRDWEB_CLIENT_ID_17,
  THIRDWEB_CLIENT_ID_18
].filter(id => id !== '');

// If we don't have enough client IDs in either category, use fallbacks
if (TOKEN_CLIENT_IDS.length === 0) {
  // If no token IDs, try to use transaction IDs first, then legacy
  if (TRANSACTION_CLIENT_IDS.length > 0) {
    // Take the first transaction ID for tokens if available
    TOKEN_CLIENT_IDS.push(TRANSACTION_CLIENT_IDS[0]);
  } else if (LEGACY_CLIENT_ID) {
    TOKEN_CLIENT_IDS.push(LEGACY_CLIENT_ID);
  }
}

if (TRANSACTION_CLIENT_IDS.length === 0) {
  // If no transaction IDs, try to use token IDs first, then legacy
  if (TOKEN_CLIENT_IDS.length > 0) {
    // Use a token ID for transactions if available
    TRANSACTION_CLIENT_IDS.push(...TOKEN_CLIENT_IDS);
  } else if (LEGACY_CLIENT_ID) {
    TRANSACTION_CLIENT_IDS.push(LEGACY_CLIENT_ID);
  }
}

// Track the last used token client ID index to rotate through them
let lastTokenClientIdIndex = -1;
// Track usage frequency of each client ID to prioritize less-used ones
const clientIdUsageCount: Record<string, number> = {};

// Initialize usage count for all client IDs
[...TOKEN_CLIENT_IDS, ...TRANSACTION_CLIENT_IDS].forEach(id => {
  clientIdUsageCount[id] = 0;
});

// Function to get the next client ID for token/NFT requests (rotating through the first 3)
function getTokenClientId(forceRotate = false): string {
  if (TOKEN_CLIENT_IDS.length === 0) {
    throw new Error("No ThirdWeb client ID configured for token requests");
  }
  
  if (forceRotate || lastTokenClientIdIndex === -1) {
    // Find the least used client ID
    const sortedIds = [...TOKEN_CLIENT_IDS].sort((a, b) => 
      (clientIdUsageCount[a] || 0) - (clientIdUsageCount[b] || 0)
    );
    
    const clientId = sortedIds[0];
    lastTokenClientIdIndex = TOKEN_CLIENT_IDS.indexOf(clientId);
    clientIdUsageCount[clientId] = (clientIdUsageCount[clientId] || 0) + 1;
    return clientId;
  }
  
  // Regular rotation
  const clientId = TOKEN_CLIENT_IDS[lastTokenClientIdIndex];
  clientIdUsageCount[clientId] = (clientIdUsageCount[clientId] || 0) + 1;
  return clientId;
}

// Function to get a client ID for transaction requests
// Optional index parameter to get a specific client ID for parallel requests
function getTransactionClientId(index?: number, forceRotate = false): string {
  if (TRANSACTION_CLIENT_IDS.length === 0) {
    throw new Error("No ThirdWeb client IDs configured for transaction requests");
  }
  
  if (index !== undefined && !forceRotate) {
    // Use modulo to cycle through available IDs if index exceeds array length
    const clientIdIndex = index % TRANSACTION_CLIENT_IDS.length;
    const clientId = TRANSACTION_CLIENT_IDS[clientIdIndex];
    clientIdUsageCount[clientId] = (clientIdUsageCount[clientId] || 0) + 1;
    return clientId;
  }
  
  // If forceRotate is true or no index specified, get the least used client ID
  const sortedIds = [...TRANSACTION_CLIENT_IDS].sort((a, b) => 
    (clientIdUsageCount[a] || 0) - (clientIdUsageCount[b] || 0)
  );
  
  const clientId = sortedIds[0];
  clientIdUsageCount[clientId] = (clientIdUsageCount[clientId] || 0) + 1;
  return clientId;
}

// Maximum number of retries for rate limiting
const MAX_RATE_LIMIT_RETRIES = 2; // Reduced from 3
// Maximum number of retries for gateway timeouts (504 errors)
const MAX_GATEWAY_TIMEOUT_RETRIES = 2; // Reduced from 4
// Request timeout in milliseconds (20 seconds - reduced from 30)
const REQUEST_TIMEOUT_MS = 30000;

// Cache for transaction data to avoid redundant fetches
const transactionCache = new Map<string, Transaction[]>();
// Cache expiry time - 5 minutes
const CACHE_EXPIRY_MS = 5 * 60 * 1000;

// Helper function to implement fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

// Function to help with paginated data fetching from ThirdWeb API
async function fetchSingleRequest(url: string, requestType: 'token' | 'transaction', index?: number, retryCount = 0, timeoutRetry = 0): Promise<any> {
  // Get the appropriate client ID based on request type
  const forceRotate = retryCount > 0; // Force rotation on retries
  const clientId = requestType === 'token' 
    ? getTokenClientId(forceRotate) 
    : getTransactionClientId(index, forceRotate);
  
  if (!clientId) {
    throw new Error(`No ThirdWeb client ID configured for ${requestType} requests`);
  }
  
  const finalUrl = url.includes("clientId=") ? url : `${url}&clientId=${clientId}`;
  
  // Only log detailed info on first attempt or retries
  if (retryCount === 0 && timeoutRetry === 0) {
    console.log(`Making ${requestType} request with ClientID: ${clientId.substring(0, 8)}...`);
  } else {
    console.log(`Retry: ${requestType} request (retry ${retryCount}/${MAX_RATE_LIMIT_RETRIES}, timeout retry ${timeoutRetry}/${MAX_GATEWAY_TIMEOUT_RETRIES}, ClientID: ${clientId.substring(0, 8)}...)`);
  }
  
  try {
    // Use fetch with timeout to prevent hanging requests
    const response = await fetchWithTimeout(finalUrl, {
      headers: {
        "Accept": "application/json"
      }
    }, REQUEST_TIMEOUT_MS);
    
    // Handle rate limiting with retries - use a different client ID each time
    if (response.status === 429 && retryCount < MAX_RATE_LIMIT_RETRIES) {
      const waitTime = Math.pow(1.5, retryCount) * 1000; // Reduced backoff
      console.log(`Rate limit hit for ${requestType} request, retrying after ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return fetchSingleRequest(url, requestType, index, retryCount + 1, timeoutRetry);
    }
    
    // Special handling for 504 Gateway Timeout with more aggressive retries
    if (response.status === 504 && timeoutRetry < MAX_GATEWAY_TIMEOUT_RETRIES) {
      // Use a different exponential backoff for gateway timeouts
      const waitTime = Math.pow(1.5, timeoutRetry) * 1500; // Reduced waiting time
      console.log(`Gateway Timeout (504), retrying after ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Always use a different client ID for the next attempt
      return fetchSingleRequest(url, requestType, index, retryCount, timeoutRetry + 1);
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Thirdweb API Error:", {
        status: response.status,
        statusText: response.statusText,
        url: finalUrl.split('?')[0] // Log base URL without parameters for brevity
      });
      
      // If not a rate limit error but we can retry, do so with a different client ID
      if (retryCount < MAX_RATE_LIMIT_RETRIES) {
        const waitTime = Math.pow(1.5, retryCount) * 1000; // Reduced waiting time
        console.log(`API error, retrying after ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return fetchSingleRequest(url, requestType, index, retryCount + 1, timeoutRetry);
      }
      
      throw new Error(`Thirdweb API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    // Handle specific AbortController timeout errors
    if (error.name === 'AbortError') {
      console.error(`Request timeout after ${REQUEST_TIMEOUT_MS}ms`);
      
      // Special handling for timeout errors
      if (timeoutRetry < MAX_GATEWAY_TIMEOUT_RETRIES) {
        const waitTime = Math.pow(1.5, timeoutRetry) * 1500;
        console.log(`Request timed out, retrying after ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        // Always use a different client ID for the next attempt
        return fetchSingleRequest(url, requestType, index, retryCount, timeoutRetry + 1);
      }
      
      throw new Error(`Request timeout after ${MAX_GATEWAY_TIMEOUT_RETRIES} retries`);
    }
    
    console.error(`Error in fetchSingleRequest:`, error.message || 'Unknown error');
    
    // Retry on network errors if we can
    if (retryCount < MAX_RATE_LIMIT_RETRIES) {
      const waitTime = Math.pow(1.5, retryCount) * 1000;
      console.log(`Network error, retrying after ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return fetchSingleRequest(url, requestType, index, retryCount + 1, timeoutRetry);
    }
    
    throw error;
  }
}

// Function to check if an NFT is a 1 Million Nad NFT
function isNadNFT(nft: any, nadsContractAddress: string): boolean {
  if (!nft) return false;
  
  let nftAddress = null;
  if (nft.contract && nft.contract.address) {
    nftAddress = nft.contract.address;
  } else if (nft.token_address) {
    nftAddress = nft.token_address;
  } else if (nft.asset_contract && nft.asset_contract.address) {
    nftAddress = nft.asset_contract.address;
  } else if (nft.contract_address) {
    nftAddress = nft.contract_address;
  }
  
  if (!nftAddress) {
    console.log("Could not extract address from NFT:", JSON.stringify(nft).substring(0, 200));
    return false;
  }
  
  const isNad = nftAddress.toLowerCase() === nadsContractAddress.toLowerCase();
  if (isNad) {
    console.log("Found NAD NFT with address:", nftAddress);
    console.log("NAD NFT details:", JSON.stringify({
      tokenId: nft.token_id || nft.tokenId || nft.id,
      name: nft.name || nft.metadata && nft.metadata.name,
      symbol: nft.symbol || nft.metadata && nft.metadata.symbol
    }));
  }
  
  return isNad;
}

// Function to fetch paginated data with support for checking for Nad NFTs
async function fetchPaginatedData(baseUrl: string, options: { checkForNad?: boolean } = {}): Promise<any> {
  let allData: any[] = [];
  let currentPage = 0;
  let emptyResponseCount = 0;
  let isNadHolder = false;
  let errorCount = 0;
  const nadsContractAddress = "0x922da3512e2bebbe32bcce59adf7e6759fb8cea2";
  const MAX_EMPTY_RESPONSES = 2;
  const MAX_ERRORS_BEFORE_CIRCUIT_BREAK = 3;
  const isNFTRequest = baseUrl.includes('/erc721/') || baseUrl.includes('/erc1155/');
  const requestType = isNFTRequest ? (baseUrl.includes('/erc721/') ? 'NFT' : 'ERC1155') : 'token';
  const MAX_PAGES = 20; // Hard cap at 20 pages for transaction requests
  
  try {
    console.log(`Starting paginated fetch for ${requestType} data: ${baseUrl}`);
    
    while (emptyResponseCount < MAX_EMPTY_RESPONSES && errorCount < MAX_ERRORS_BEFORE_CIRCUIT_BREAK) {
      // Check if we've hit the maximum page limit for non-NFT requests
      if (!isNFTRequest && currentPage >= MAX_PAGES) {
        console.log(`Reached maximum page limit (${MAX_PAGES}) for ${requestType} data`);
        break;
      }
      
      const pageUrl = `${baseUrl}&page=${currentPage}`;
      console.log(`Fetching ${requestType} page ${currentPage}: ${pageUrl}`);
      
      try {
        // Alternate between token client IDs
        const pageResult = await fetchSingleRequest(pageUrl, 'token');
        
        if (!pageResult.data || pageResult.data.length === 0) {
          console.log(`No more ${requestType} data at page ${currentPage}, incrementing empty count`);
          emptyResponseCount++;
          currentPage++;
          continue;
        }
        
        // Reset error count on success
        errorCount = 0;
        emptyResponseCount = 0;
        console.log(`${requestType} page ${currentPage} has ${pageResult.data.length} items`);
        allData = [...allData, ...pageResult.data];
        
        if (options.checkForNad && !isNadHolder && requestType === 'NFT') {
          for (const nft of pageResult.data) {
            if (isNadNFT(nft, nadsContractAddress)) {
              console.log(`Found 1 Million Nad NFT in page ${currentPage}!`);
              isNadHolder = true;
              break;
            }
          }
        }
        
        currentPage++;
      } catch (error) {
        console.error(`Error fetching ${requestType} page ${currentPage} after all retries:`, error);
        
        // Increment error count for circuit breaker
        errorCount++;
        
        if (errorCount >= MAX_ERRORS_BEFORE_CIRCUIT_BREAK) {
          console.warn(`Circuit breaker triggered after ${errorCount} errors for ${requestType} data. Returning partial data.`);
          break;
        }
        
        // In case of intermediate errors, still move forward
        emptyResponseCount++;
        currentPage++;
      }
    }
    
    // If circuit breaker was triggered but we have no data at all, throw error for fallback handling
    if (errorCount >= MAX_ERRORS_BEFORE_CIRCUIT_BREAK && allData.length === 0) {
      throw new Error(`Circuit breaker triggered and no ${requestType} data retrieved`);
    }
    
    if (options.checkForNad && requestType === 'NFT' && allData.length > 0) {
      const directNadCheck = allData.some((nft) => isNadNFT(nft, nadsContractAddress));
      if (directNadCheck) {
        console.log("Verified 1 Million Nad NFT holder through direct check of all data");
        isNadHolder = true;
      }
    }
    
    console.log(`${requestType} data fetch complete: ${allData.length} items across ${currentPage} pages`);
    if (requestType === 'NFT') {
      console.log(`Final Nad holder status: ${isNadHolder}`);
    }
    
    return { data: allData, isNadHolder, partial: errorCount > 0 && allData.length > 0 };
  } catch (error) {
    console.error(`Error in fetchPaginatedData for ${requestType}:`, error);
    return { data: allData, isNadHolder, error: true };
  }
}

// Updated Transaction interface to match Cloudflare Worker API response
export interface Transaction {
  chain_id: string;
  hash: string;
  nonce: number;
  block_hash: string;
  block_number: number;
  block_timestamp: number;
  transaction_index: number;
  from_address: string;
  to_address: string;
  value: string;
  gas: number;
  gas_price: string;
  data: string;
  function_selector: string;
  max_fee_per_gas: string;
  max_priority_fee_per_gas: string;
  transaction_type: number;
  r: string;
  s: string;
  v: string;
  access_list_json: any;
  contract_address: string | null;
  gas_used: number;
  cumulative_gas_used: number;
  effective_gas_price: string;
  blob_gas_used: number;
  blob_gas_price: string;
  logs_bloom: string;
  status: number;
  original_timestamp: string;
}

export interface ContractInfo {
  address: string;
  timestamp: number;
  formattedTimestamp: string;
}

export interface ERC20Token {
  chainId: number;
  chain_id: number;
  tokenAddress: string;
  token_address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
}

export interface ERC721NFT {
  chainId: number;
  chain_id: number;
  tokenAddress: string;
  token_address: string;
  tokenId: string;
  token_id: string;
  balance: string;
  name?: string;
  description?: string;
  image_url?: string;
  metadata_url?: string;
  extra_metadata?: {
    image_url?: string;
    image_original_url?: string;
    attributes?: Array<{
      trait_type: string;
      display_type?: string;
      value: string | number;
    }>;
  };
  collection?: {
    name?: string;
    description?: string;
    image_url?: string;
  };
  contract?: {
    chain_id: number;
    address: string;
    type: string;
    name?: string;
    symbol?: string;
  };
}

export interface ERC1155Token {
  chainId: number;
  chain_id: number;
  tokenAddress: string;
  token_address: string;
  tokenId: string;
  token_id: string;
  balance: string;
  name?: string;
  description?: string;
  image_url?: string;
  metadata_url?: string;
  extra_metadata?: {
    image_url?: string;
    image_original_url?: string;
    attributes?: Array<{
      trait_type: string;
      display_type?: string;
      value: string | number;
    }>;
  };
  collection?: {
    name?: string;
    description?: string;
    image_url?: string;
  };
  contract?: {
    chain_id: number;
    address: string;
    type: string;
    name?: string;
    symbol?: string;
  };
}

export interface MonadTestnetStats {
  address: string;
  score: number;
  activityScore: number;
  volumeScore: number;
  nftScore: number;
  tokenScore: number;
  contractScore: number;
  activityByDay: number;
  activityByWeek: number;
  activityByMonth: number;
  totalVolume: string;
  totalTransactions: number;
  contractsCreated: {
    total: number;
    list: ContractInfo[];
    addresses: string[];
    timestamps: Record<string, number>;
  };
  contractsInteracted: {
    total: number;
    list: ContractInfo[];
    addresses: string[];
    interactionCounts: Record<string, number>;
    timestamps: Record<string, number>;
  };
  transactions: Transaction[];
  tokens: ERC20Token[];
  nfts: ERC721NFT[];
  erc1155Tokens: ERC1155Token[];
}

// Function to get transaction count for an address
async function getTransactionCount(address: string): Promise<number> {
  // Create an array of RPCs to try in order
  const rpcUrls = [RPC_URL, FALLBACK_RPC_URL];
  
  for (const rpcUrl of rpcUrls) {
    try {
      console.log(`Trying to fetch transaction count from RPC: ${rpcUrl}`);
      
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getTransactionCount',
          params: [address, 'latest']
        })
      });

      if (!response.ok) {
        console.warn(`HTTP error from RPC ${rpcUrl}! status: ${response.status}`);
        continue; // Try next RPC
      }

      const data = await response.json();
      if (data.error) {
        console.warn(`RPC error from ${rpcUrl}: ${data.error.message}`);
        continue; // Try next RPC
      }

      // Convert hex to decimal
      return parseInt(data.result, 16);
    } catch (error) {
      console.warn(`Error fetching transaction count from ${rpcUrl}:`, error);
      // Continue to next RPC
    }
  }
  
  // If we reach here, all RPCs failed
  console.error('All RPCs failed to fetch transaction count');
  return 0; // Return 0 as a fallback
}

// Interface for SocialScan API transaction response
interface SocialScanTransaction {
  address: string;
  block_number: number;
  transaction_index: number;
  transaction_hash: string;
  block_timestamp: string;
  block_hash: string;
  txn_type: number;
  related_address: string;
  value: string;
  transaction_fee: string;
  receipt_status: number;
  method: string;
  create_time: string;
  update_time: string;
  hash: string;
  method_id: string;
  is_contract: boolean;
  contract_name: string | null;
  from_address: string;
  to_address: string;
  gas_fee_token_price: string;
  value_dollar: string;
  total_transaction_fee: string;
  from_address_display_name: string;
  to_address_display_name: string;
}

interface SocialScanTransactionResponse {
  data: SocialScanTransaction[];
  total: number;
  max_display: number;
  page: number;
  size: number;
}

// Convert SocialScan transaction to our Transaction interface
function convertSocialScanTransaction(tx: SocialScanTransaction): Transaction {
  // Parse the timestamp to get a Unix timestamp
  const timestampDate = new Date(tx.block_timestamp);
  const unixTimestamp = Math.floor(timestampDate.getTime() / 1000);

  // Check if this is a contract creation transaction
  // Contract creation transactions typically have method_id starting with 0x60806040
  const isContractCreation = tx.method_id && tx.method_id.startsWith('0x60806040');
  
  // For contract creations, the created contract address is in the to_address field
  const contractAddress = isContractCreation ? tx.to_address : (tx.is_contract ? tx.to_address : null);

  return {
    chain_id: CHAIN_ID,
    hash: tx.hash,
    nonce: 0, // Not provided in SocialScan API
    block_hash: tx.block_hash,
    block_number: tx.block_number,
    block_timestamp: unixTimestamp,
    transaction_index: tx.transaction_index,
    from_address: tx.from_address,
    to_address: tx.to_address,
    value: tx.value,
    gas: 0, // Not provided in SocialScan API
    gas_price: "0", // Not provided directly
    data: "", // Not provided in SocialScan API
    function_selector: tx.method_id,
    max_fee_per_gas: "0", // Not provided in SocialScan API
    max_priority_fee_per_gas: "0", // Not provided in SocialScan API
    transaction_type: tx.txn_type,
    r: "", // Not provided in SocialScan API
    s: "", // Not provided in SocialScan API
    v: "", // Not provided in SocialScan API
    access_list_json: null, // Not provided in SocialScan API
    contract_address: contractAddress,
    gas_used: 0, // Not provided directly
    cumulative_gas_used: 0, // Not provided in SocialScan API
    effective_gas_price: tx.transaction_fee, // Using transaction_fee as an approximation
    blob_gas_used: 0, // Not provided in SocialScan API
    blob_gas_price: "0", // Not provided in SocialScan API
    logs_bloom: "", // Not provided in SocialScan API
    status: tx.receipt_status,
    original_timestamp: tx.block_timestamp
  };
}

async function fetchTransactions(address: string, statusCallback?: (status: string) => void): Promise<Transaction[]> {
  // Normalize the address to lowercase for consistency
  address = address.toLowerCase();
  
  // Check cache first
  const cacheKey = `transactions_${address}`;
  const cachedData = transactionCache.get(cacheKey);
  if (cachedData) {
    console.log(`Using cached transaction data for ${address}`);
    return cachedData;
  }
  
  try {
    // First get the total transaction count from RPC to know minimum pages to fetch
    if (statusCallback) statusCallback("Checking transaction count...");
    const rpcTxCount = await getTransactionCount(address);
    
    if (rpcTxCount === 0) {
      console.log(`No transactions found for ${address}`);
      return [];
    }
    
    // Calculate the number of pages needed (2000 transactions per page)
    const PAGE_SIZE = 2000;
    const estimatedPages = Math.ceil(rpcTxCount / PAGE_SIZE);
    // Use the estimated pages as a starting point, but never more than 5 pages initially
    const initialPages = Math.min(estimatedPages, 5); 
    
    if (statusCallback) {
      const message = `Found ${rpcTxCount} transactions via RPC (estimated ${estimatedPages} pages). Fetching data...`;
      console.log(message);
      statusCallback(message);
    }
    
    // STEP 1: Fetch all estimated pages in parallel
    if (statusCallback) statusCallback(`Fetching ${initialPages} pages in parallel...`);
    
    // Create an array of promises for parallel page fetching
    const pagePromises = Array.from({ length: initialPages }, (_, i) => {
      const page = i + 1;
      return (async () => {
        try {
          if (statusCallback) statusCallback(`Preparing page ${page} of ${initialPages}...`);
          
          const url = `${SOCIALSCAN_API_BASE_URL}/transactions?size=${PAGE_SIZE}&page=${page}&address=${address}`;
          const response = await fetchWithTimeout(url, {}, REQUEST_TIMEOUT_MS);
          
          if (!response.ok) {
            console.error(`Error fetching transactions page ${page}: ${response.status} ${response.statusText}`);
            return {
              page,
              transactions: [] as Transaction[],
              isFullPage: false
            };
          }
          
          const data: SocialScanTransactionResponse = await response.json();
          
          // Convert SocialScan transactions to our Transaction interface
          const transactions = data.data.map(convertSocialScanTransaction);
          
          if (statusCallback) statusCallback(`Processed page ${page} with ${transactions.length} transactions.`);
          
          return {
            page,
            transactions,
            isFullPage: transactions.length === PAGE_SIZE
          };
        } catch (error) {
          console.error(`Error fetching page ${page}:`, error);
          return {
            page,
            transactions: [] as Transaction[],
            isFullPage: false
          };
        }
      })();
    });
    
    // Wait for all parallel requests to complete
    const pageResults = await Promise.all(pagePromises);
    
    // Combine all transactions, respecting the page order
    let allTransactions: Transaction[] = [];
    pageResults.sort((a, b) => a.page - b.page).forEach(result => {
      allTransactions = [...allTransactions, ...result.transactions];
    });
    
    if (statusCallback) statusCallback(`Completed fetching ${allTransactions.length} transactions in initial batch.`);
    
    // STEP 2: Check if we need to fetch additional pages
    // If the last page is full, we may need to fetch more pages
    const lastPageResult = pageResults.find(result => result.page === initialPages);
    const lastPageIsFull = lastPageResult ? lastPageResult.isFullPage : false;
    
    // Continue fetching additional pages if needed and under the max limit
    let currentPage = initialPages + 1;
    const maxPages = 5; // Hard limit of 5 pages (10K transactions)
    
    if (lastPageIsFull && currentPage <= maxPages) {
      if (statusCallback) statusCallback(`Last page is full, checking for additional pages...`);
      
      let hasMoreData = true;
      
      while (hasMoreData && currentPage <= maxPages) {
        if (statusCallback) {
          statusCallback(`Fetching additional page ${currentPage}...`);
        }
        
        try {
          const url = `${SOCIALSCAN_API_BASE_URL}/transactions?size=${PAGE_SIZE}&page=${currentPage}&address=${address}`;
          const response = await fetchWithTimeout(url, {}, REQUEST_TIMEOUT_MS);
          
          if (!response.ok) {
            console.error(`Error fetching transactions page ${currentPage}: ${response.status} ${response.statusText}`);
            break;
          }
          
          const data: SocialScanTransactionResponse = await response.json();
          
          // Convert SocialScan transactions to our Transaction interface
          const transactions = data.data.map(convertSocialScanTransaction);
          
          if (transactions.length === 0) {
            // No more transactions found, stop fetching
            console.log(`No more transactions found on page ${currentPage}`);
            hasMoreData = false;
            break;
          }
          
          // Add transactions to the full array
          allTransactions = [...allTransactions, ...transactions];
          
          if (statusCallback) {
            statusCallback(`Processed additional page ${currentPage} with ${transactions.length} transactions. Total: ${allTransactions.length}`);
          }
          
          // Check if we need to fetch more pages or we've reached the limit
          if (transactions.length < PAGE_SIZE) {
            console.log(`Page ${currentPage} returned ${transactions.length} < ${PAGE_SIZE} transactions, this is the last page.`);
            hasMoreData = false;
          } else if (currentPage >= maxPages) {
            console.log(`Reached maximum page limit of ${maxPages}`);
            hasMoreData = false;
          } else {
            console.log(`Page ${currentPage} returned full ${PAGE_SIZE} transactions, continuing to next page.`);
            hasMoreData = true;
          }
          
          currentPage++;
          
          // Add a small delay between sequential requests to avoid rate limiting
          if (hasMoreData && currentPage <= maxPages) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error(`Error fetching page ${currentPage}:`, error);
          break; // Stop on error
        }
      }
    }
    
    // Update the total transactions count in the status message
    if (statusCallback) {
      const finalMessage = `Completed fetching ${allTransactions.length} transactions from ${Math.max(initialPages, currentPage - 1)} pages`;
      console.log(finalMessage);
      statusCallback(finalMessage);
    }

    // Cache the results
    transactionCache.set(cacheKey, allTransactions);
    setTimeout(() => {
      transactionCache.delete(cacheKey);
    }, CACHE_EXPIRY_MS);
    
    return allTransactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

async function fetchNativeBalance(address: string): Promise<string> {
  // Create an array of RPCs to try in order
  const rpcUrls = [RPC_URL, FALLBACK_RPC_URL];
  
  for (const rpcUrl of rpcUrls) {
    try {
      console.log(`Trying to fetch native balance from RPC: ${rpcUrl}`);
      
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1,
        }),
      });

      if (!response.ok) {
        console.warn(`HTTP error from RPC ${rpcUrl}! status: ${response.status}`);
        continue; // Try next RPC
      }

      const data = await response.json();
      if (data.error) {
        console.warn(`RPC error from ${rpcUrl}: ${data.error.message}`);
        continue; // Try next RPC
      }
      
      return data.result || '0';
    } catch (error) {
      console.warn(`Error fetching native balance from ${rpcUrl}:`, error);
      // Continue to next RPC
    }
  }
  
  // If we reach here, all RPCs failed
  console.error('All RPCs failed to fetch native balance');
  return '0'; // Return 0 as a fallback
}

// Fix the getISOWeek function
function getISOWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7) + 1;
  return `${d.getFullYear()}-${String(weekNum).padStart(2, '0')}`;
}

// Update the calculateActivityStats function
function calculateActivityStats(transactions: Transaction[]) {
  const uniqueDays = new Set<string>();
  const uniqueWeeks = new Set<string>();
  const uniqueMonths = new Set<string>();
  const contractsCreated: {
    total: number;
    list: ContractInfo[];
    addresses: string[];
    timestamps: Record<string, number>;
  } = {
    total: 0,
    list: [],
    addresses: [],
    timestamps: {}
  };
  
  const contractsInteracted: {
    total: number;
    list: ContractInfo[];
    addresses: string[];
    interactionCounts: Record<string, number>;
    timestamps: Record<string, number>;
  } = {
    total: 0,
    list: [],
    addresses: [],
    interactionCounts: {},
    timestamps: {}
  };
  
  let totalVolume = BigInt(0);
  let totalTransactions = 0;
  
  for (const tx of transactions) {
    // Skip transactions without valid timestamps
    if (!tx.block_timestamp) continue;
    
    // Format date for activity tracking
    const date = new Date(tx.original_timestamp || tx.block_timestamp * 1000);
    const day = date.toISOString().split('T')[0];
    const week = getISOWeek(date);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    uniqueDays.add(day);
    uniqueWeeks.add(week);
    uniqueMonths.add(month);
    
    // Track volume (convert string to BigInt safely)
    try {
      if (tx.value && tx.value !== '0') {
        totalVolume += BigInt(tx.value);
      }
    } catch (e) {
      console.error('Error parsing transaction value:', e);
    }
    
    totalTransactions++;
    
    // Check for contract creation (method_id starts with 0x60806040)
    const isContractCreation = tx.function_selector && tx.function_selector.startsWith('0x60806040');
    
    if (isContractCreation && tx.to_address) {
      const contractAddress = tx.to_address;
      
      if (!contractsCreated.addresses.includes(contractAddress)) {
        contractsCreated.addresses.push(contractAddress);
        contractsCreated.total++;
        
        // Store the actual timestamp from the transaction
        contractsCreated.timestamps[contractAddress] = tx.block_timestamp;
        
        // Add to the list with actual timestamp
        contractsCreated.list.push({
          address: contractAddress,
          timestamp: tx.block_timestamp,
          formattedTimestamp: tx.original_timestamp || new Date(tx.block_timestamp * 1000).toISOString()
        });
      }
    }

    // Check for contract interaction
    if (tx.to_address && !isContractCreation && tx.contract_address) {
      const contractAddress = tx.to_address;
      
      // Update or add contract interaction
      if (!contractsInteracted.addresses.includes(contractAddress)) {
        contractsInteracted.addresses.push(contractAddress);
        contractsInteracted.total++;
        contractsInteracted.interactionCounts[contractAddress] = 1;
        
        // Store the actual timestamp from the transaction
        contractsInteracted.timestamps[contractAddress] = tx.block_timestamp;
        
        // Add to the list with actual timestamp
        contractsInteracted.list.push({
          address: contractAddress,
          timestamp: tx.block_timestamp,
          formattedTimestamp: tx.original_timestamp || new Date(tx.block_timestamp * 1000).toISOString()
        });
      } else {
        contractsInteracted.interactionCounts[contractAddress]++;
        
        // Update the timestamp if this interaction is more recent
        if (tx.block_timestamp > contractsInteracted.timestamps[contractAddress]) {
          contractsInteracted.timestamps[contractAddress] = tx.block_timestamp;
          
          // Update the formatted timestamp in the list
          const index = contractsInteracted.list.findIndex(item => item.address === contractAddress);
          if (index !== -1) {
            contractsInteracted.list[index].timestamp = tx.block_timestamp;
            contractsInteracted.list[index].formattedTimestamp = tx.original_timestamp || new Date(tx.block_timestamp * 1000).toISOString();
          }
        }
      }
    }
  }

  return {
    activityByDay: uniqueDays.size,
    activityByWeek: uniqueWeeks.size,
    activityByMonth: uniqueMonths.size,
    totalVolume: totalVolume.toString(),
    totalTransactions,
    contractsCreated,
    contractsInteracted
  };
}

// Updated token fetching functions to directly use ThirdWeb API
async function fetchTokens(address: string): Promise<{tokens: ERC20Token[], partial: boolean}> {
  try {
    const apiBaseUrl = `${THIRDWEB_API_BASE_URL}/tokens/erc20/${address}?chain=${CHAIN_ID}&metadata=true&include_spam=true&limit=100`;
    // Use token client ID for all token-related requests
    const result = await fetchPaginatedData(apiBaseUrl);
    return { 
      tokens: result.data || [], 
      partial: result.partial || false 
    };
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return { tokens: [], partial: true };
  }
}

async function fetchNFTs(address: string): Promise<{ nfts: ERC721NFT[], is1MillionNadHolder: boolean, partial: boolean }> {
  try {
    const apiBaseUrl = `${THIRDWEB_API_BASE_URL}/tokens/erc721/${address}?chain=${CHAIN_ID}&metadata=true&limit=100`;
    // Use token client ID for all token-related requests
    const result = await fetchPaginatedData(apiBaseUrl, { checkForNad: true });
    
    // Direct check to confirm if any of the NFTs is a 1Million NAD NFT
    const nadsContractAddress = "0x922da3512e2bebbe32bcce59adf7e6759fb8cea2";
    const nadsNFTs = (result.data || []).filter(
      (nft: any) => isNadNFT(nft, nadsContractAddress)
    );
    
    console.log(`Direct check found ${nadsNFTs.length} Nad NFTs`);
    console.log(`Final Nad holder status: ${result.isNadHolder || nadsNFTs.length > 0}`);
    
    return { 
      nfts: result.data || [], 
      is1MillionNadHolder: result.isNadHolder || nadsNFTs.length > 0,
      partial: result.partial || false
    };
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return { nfts: [], is1MillionNadHolder: false, partial: true };
  }
}

async function fetchERC1155Tokens(address: string): Promise<{tokens: ERC1155Token[], partial: boolean}> {
  try {
    const apiBaseUrl = `${THIRDWEB_API_BASE_URL}/tokens/erc1155/${address}?chain=${CHAIN_ID}&metadata=true&limit=100`;
    // Use token client ID for all token-related requests
    const result = await fetchPaginatedData(apiBaseUrl);
    return { 
      tokens: result.data || [],
      partial: result.partial || false
    };
  } catch (error) {
    console.error('Error fetching ERC1155 tokens:', error);
    return { tokens: [], partial: true };
  }
}

// Constant for the 1 Million Nad NFT contract address
const NAD_NFT_CONTRACT_ADDRESS = "0x922da3512e2bebbe32bcce59adf7e6759fb8cea2";
// Constant for the second NFT contract address to check
const SECOND_NFT_CONTRACT_ADDRESS = "0x76D37beDcf864aA2bD848b7286F1be8D42f63Cb6";

// Function to check if a wallet holds a specific NFT using Alchemy API
async function checkNftOwnership(address: string, contractAddress: string): Promise<boolean> {
  try {
    const url = `${getAlchemyNftApiUrl()}/isHolderOfContract?wallet=${address}&contractAddress=${contractAddress}`;
    console.log(`Checking NFT ownership for contract ${contractAddress} with Alchemy API: ${url}`);
    
    // Try up to 3 times with different API keys
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Alchemy NFT API error (${response.status}): ${errorText}`);
          
          // If this is not the last attempt, try again with a different API key
          if (attempt < 2) {
            console.log(`Retrying with a different API key (attempt ${attempt + 2})...`);
            continue;
          }
          return false;
        }
        
        const data = await response.json();
        console.log(`NFT ownership check result for ${contractAddress}:`, data);
        return data.isHolderOfContract === true;
      } catch (error) {
        console.error(`Error checking NFT ownership for ${contractAddress} (attempt ${attempt + 1}):`, error);
        if (attempt < 2) {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error(`Error checking NFT ownership for ${contractAddress}:`, error);
    return false;
  }
}

// Direct check if a wallet holds a Nad NFT using Alchemy API
async function checkNadNftOwnership(address: string): Promise<boolean> {
  return checkNftOwnership(address, NAD_NFT_CONTRACT_ADDRESS);
}

// Direct check if a wallet holds the second NFT using Alchemy API
async function checkSecondNftOwnership(address: string): Promise<boolean> {
  return checkNftOwnership(address, SECOND_NFT_CONTRACT_ADDRESS);
}

// Update the fetchMonadTestnetStats function to properly calculate scores
export async function fetchMonadTestnetStats(address: string, statusCallback?: (status: string) => void): Promise<MonadTestnetStats> {
  try {
    // Normalize address
    address = address.toLowerCase();
    
    if (statusCallback) statusCallback('Checking wallet on Monad Testnet...');
    
    // Fetch transaction data
    if (statusCallback) statusCallback('Fetching transaction history...');
    const transactions = await fetchTransactions(address, statusCallback);
    
    // Calculate activity statistics
    if (statusCallback) statusCallback('Analyzing transaction patterns...');
    const activityStats = calculateActivityStats(transactions);
    
    // Fetch token balances
    if (statusCallback) statusCallback('Fetching token balances...');
    const tokensResponse = await fetchTokens(address);
    
    // Fetch NFT balances
    if (statusCallback) statusCallback('Fetching NFTs...');
    const nftsResponse = await fetchNFTs(address);
    
    // Fetch ERC1155 balances
    const erc1155Response = await fetchERC1155Tokens(address);
    
    // Calculate scores
    if (statusCallback) statusCallback('Calculating wallet scores...');
    const activityScore = calculateActivityScore(activityStats);
    const volumeScore = calculateVolumeScore(activityStats.totalVolume);
    const nftScore = calculateNFTScore(nftsResponse.nfts.length, erc1155Response.tokens.length);
    const tokenScore = calculateTokenScore(tokensResponse.tokens);
    const contractScore = calculateContractScore(activityStats.contractsCreated.total, activityStats.contractsInteracted.total);
    
    // Calculate overall score
    const overallScore = (activityScore + volumeScore + nftScore + tokenScore + contractScore) / 5;
    
    // Create stats object
    const stats: MonadTestnetStats = {
      address,
      score: overallScore,
      activityScore,
      volumeScore,
      nftScore,
      tokenScore,
      contractScore,
      activityByDay: activityStats.activityByDay,
      activityByWeek: activityStats.activityByWeek,
      activityByMonth: activityStats.activityByMonth,
      totalVolume: activityStats.totalVolume,
      totalTransactions: transactions.length,
      contractsCreated: activityStats.contractsCreated,
      contractsInteracted: activityStats.contractsInteracted,
      transactions,
      tokens: tokensResponse.tokens,
      nfts: nftsResponse.nfts,
      erc1155Tokens: erc1155Response.tokens
    };
    
    if (statusCallback) statusCallback('Analysis complete!');

    return stats;
  } catch (error) {
    console.error('Error fetching Monad testnet stats:', error);
    throw error;
  }
}

// New function to efficiently fetch first transaction timestamp
async function fetchFirstTransaction(address: string): Promise<{ timestamp: number | null, hash: string | null }> {
  try {
    // Use client ID rotation for better reliability
    const clientId = getTransactionClientId(0);
    
    // Create URL to fetch oldest transactions first (ascending order) with the new 500 limit
    const url = `${THIRDWEB_API_BASE_URL}/transactions?chain=${CHAIN_ID}&filter_block_timestamp_gte=1136529618&sort_order=asc&filter_from_address=${address}&limit=5&page=1&clientId=${clientId}`;
    
    console.log('Fetching first transaction with direct API call:', url);
    
    const response = await fetchSingleRequest(url, 'transaction', 0, 2, 1);
    
    if (!response || !response.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.log('No first transaction found via direct API call');
      return { timestamp: null, hash: null };
    }
    
    // The first transaction in the sorted response is the earliest one
    const firstTx = response.data[0];
    console.log('Found first transaction:', firstTx.hash, 'at', new Date(firstTx.block_timestamp * 1000).toISOString());
    
    return { 
      timestamp: firstTx.block_timestamp,
      hash: firstTx.hash
    };
  } catch (error) {
    console.error('Error fetching first transaction:', error);
    return { timestamp: null, hash: null };
  }
}

// New interface for Alchemy's Asset Transfer
export interface AlchemyAssetTransfer {
  blockNum: string;
  uniqueId: string;
  hash: string;
  from: string;
  to: string;
  value: number | null;
  erc721TokenId: string | null;
  erc1155Metadata: any | null;
  tokenId: string | null;
  asset: string | null;
  category: string;
  rawContract: {
    value: string | null;
    address: string | null;
    decimal: string | null;
  };
  metadata: {
    blockTimestamp: string;
  };
}

// Function to convert Alchemy Asset Transfer to our Transaction format
function convertAlchemyTransferToTransaction(transfer: AlchemyAssetTransfer): Transaction {
  const blockNumber = parseInt(transfer.blockNum, 16);
  const timestamp = new Date(transfer.metadata.blockTimestamp).getTime() / 1000;
  
  // For contract interactions, use the 'to' address as the contract
  const toAddress = transfer.to || '0x0000000000000000000000000000000000000000';
  
  // Convert value based on category (should always be 'external' now)
  // Parse hex value properly to ensure volume is calculated correctly
  let value = '0';
  if (transfer.rawContract.value) {
    // Remove 0x prefix if present and convert to decimal
    const valueHex = transfer.rawContract.value.startsWith('0x') ? 
      transfer.rawContract.value.substring(2) : 
      transfer.rawContract.value;
    // Convert hex to decimal string
    value = BigInt(`0x${valueHex}`).toString();
  } else if (transfer.value !== null) {
    value = transfer.value.toString();
  }
  
  // Check if this is a contract creation transaction (to address is null or 0x0)
  const isContractCreation = !transfer.to || transfer.to === '0x0000000000000000000000000000000000000000';
  
  // Determine if this is a contract interaction
  const isLikelyContractCall = (transfer.value === 0 || transfer.value === null) && 
                               toAddress !== '0x0000000000000000000000000000000000000000' &&
                               !isContractCreation;
  
  const data = isLikelyContractCall || isContractCreation ? '0x12345678' : '0x'; // Simplified representation
  
  return {
    chain_id: CHAIN_ID,
    hash: transfer.hash,
    nonce: 0, // Not available in Alchemy data
    block_hash: '', // Not available in Alchemy data
    block_number: blockNumber,
    block_timestamp: timestamp,
    transaction_index: 0, // Not available in Alchemy data
    from_address: transfer.from,
    to_address: toAddress,
    value: value,
    gas: 0, // Not available in Alchemy data
    gas_price: '0', // Not available in Alchemy data
    data: data,
    function_selector: isContractCreation ? 'contract_creation' : 
                        isLikelyContractCall ? 'contract_call' : '',
    max_fee_per_gas: '0', // Not available in Alchemy data
    max_priority_fee_per_gas: '0', // Not available in Alchemy data
    transaction_type: 0, // Not available in Alchemy data
    r: '', // Not available in Alchemy data
    s: '', // Not available in Alchemy data
    v: '', // Not available in Alchemy data
    access_list_json: null, // Not available in Alchemy data
    // For contract creations, set the contract address to match the transaction hash pattern
    // This is a simplification since Alchemy doesn't provide the created contract address
    contract_address: isContractCreation ? `0x${transfer.hash.substring(2, 42)}` : null,
    gas_used: 0, // Not available in Alchemy data
    cumulative_gas_used: 0, // Not available in Alchemy data
    effective_gas_price: '0', // Not available in Alchemy data
    blob_gas_used: 0, // Not available in Alchemy data
    blob_gas_price: '0', // Not available in Alchemy data
    logs_bloom: '', // Not available in Alchemy data
    status: 1, // Assume success since we're looking at completed transfers
    original_timestamp: transfer.metadata.blockTimestamp
  };
}

// Fetch transactions using Alchemy API (for wallets with > 1900 transactions)
async function fetchTransactionsWithAlchemy(address: string, estimatedTxCount: number, statusCallback?: (status: string) => void): Promise<Transaction[]> {
  try {
    const allTransactions: Transaction[] = [];
    const maxCount = 1000; // Maximum 1000 transfers per request from Alchemy
    const maxPages = Math.ceil(estimatedTxCount / maxCount) + 1; // Add one extra page to be safe
    let pageKey: string | undefined = undefined;
    let currentPage = 1;
    
    if (statusCallback) {
      statusCallback(`Analyzing wallet with ${estimatedTxCount} transactions...`);
    }
    
    while (currentPage <= maxPages) {
      if (statusCallback) {
        statusCallback(`Fetching transaction history...`);
      }
      
      // Prepare the request body
      const requestBody: {
        id: number;
        jsonrpc: string;
        method: string;
        params: Array<{
          fromBlock: string;
          toBlock: string;
          category: string[];
          order: string;
          withMetadata: boolean;
          excludeZeroValue: boolean;
          maxCount: string;
          fromAddress: string;
          pageKey?: string;
        }>
      } = {
        id: 1,
        jsonrpc: '2.0',
        method: 'alchemy_getAssetTransfers',
        params: [
          {
            fromBlock: '0x0',
            toBlock: 'latest',
            category: ['external'], // Only include actual transactions, not token transfers
            order: 'desc',
            withMetadata: true,
            excludeZeroValue: false,
            maxCount: '0x3e8', // hex for 1000
            fromAddress: address.toLowerCase(),
            ...(pageKey ? { pageKey } : {})
          }
        ]
      };
      
      try {
        const response = await fetch(getAlchemyTransactionApiUrl(), {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Alchemy API error (${response.status}): ${errorText}`);
          break;
        }
        
        const data: {
          jsonrpc: string;
          id: number;
          result?: {
            transfers: AlchemyAssetTransfer[];
            pageKey?: string;
          }
        } = await response.json();
        
        // Process transfers
        if (data.result && data.result.transfers && Array.isArray(data.result.transfers)) {
          const transfers = data.result.transfers;
          
          if (transfers.length === 0) {
            if (statusCallback) statusCallback(`No more transfers found on page ${currentPage}.`);
            break;
          }
          
          // Convert transfers to our Transaction format
          const transactions = transfers.map(transfer => convertAlchemyTransferToTransaction(transfer));
          allTransactions.push(...transactions);
          
          if (statusCallback) {
            statusCallback(`Retrieved ${allTransactions.length} transactions...`);
          }
          
          // Check if we have a pageKey for the next page
          pageKey = data.result.pageKey;
          if (!pageKey) {
            if (statusCallback) statusCallback('Transaction fetching complete.');
            break;
          }
        } else {
          console.error('Unexpected Alchemy API response format:', data);
          break;
        }
      } catch (error) {
        console.error(`Error fetching Alchemy transfers page ${currentPage}:`, error);
        break;
      }
      
      currentPage++;
    }
    
    return allTransactions;
  } catch (error) {
    console.error('Error in fetchTransactionsWithAlchemy:', error);
    return [];
  }
}

// Score calculation functions
function calculateActivityScore(activityStats: ReturnType<typeof calculateActivityStats>): number {
  // Calculate activity score based on daily, weekly, and monthly activity
  const dayScore = Math.min(activityStats.activityByDay / 30, 1) * 100;
  const weekScore = Math.min(activityStats.activityByWeek / 8, 1) * 100;
  const monthScore = Math.min(activityStats.activityByMonth / 3, 1) * 100;
  
  // Calculate transaction count score
  const txCountScore = Math.min(activityStats.totalTransactions / 100, 1) * 100;
  
  // Weighted average
  return Math.round((dayScore * 0.3 + weekScore * 0.2 + monthScore * 0.2 + txCountScore * 0.3) * 10) / 10;
}

function calculateVolumeScore(totalVolumeStr: string): number {
  try {
    // Convert volume to numeric value
    const totalVolume = BigInt(totalVolumeStr);
    const volumeInEther = Number(totalVolume) / 1e18;
    
    // Score based on volume (max score at 100 ETH)
    return Math.min(Math.round((volumeInEther / 100) * 1000) / 10, 100);
  } catch (e) {
    console.error('Error calculating volume score:', e);
    return 0;
  }
}

function calculateNFTScore(nftCount: number, erc1155Count: number): number {
  // Calculate score based on NFT holdings
  const totalNFTs = nftCount + erc1155Count;
  return Math.min(Math.round((totalNFTs / 10) * 1000) / 10, 100);
}

function calculateTokenScore(tokens: ERC20Token[]): number {
  // Calculate score based on number of different tokens held
  const uniqueTokenCount = tokens.length;
  return Math.min(Math.round((uniqueTokenCount / 5) * 1000) / 10, 100);
}

function calculateContractScore(contractsCreated: number, contractsInteracted: number): number {
  // Calculate score based on contract creation and interaction
  const creationScore = Math.min(contractsCreated * 50, 100);
  const interactionScore = Math.min((contractsInteracted / 10) * 100, 100);
  
  // Weighted average (contract creation is weighted more heavily)
  return Math.round((creationScore * 0.7 + interactionScore * 0.3) * 10) / 10;
}