// Common types used across the application

// Token types
export interface ERC20Token {
  tokenAddress: string;
  token_address: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenQuantity: string;
  tokenValueInUsd: string;
  balance: string;
  decimals: number;
  name: string;
  symbol: string;
}

// Interface for INK Chain tokens
export interface InkToken {
  value: string;
  token: {
    address: string;
    name: string;
    symbol: string;
    decimals: string;
    total_supply: string;
    holders: string;
    icon_url?: string;
  };
}

export interface ERC721NFT {
  token_address: string;
  token_id: string;
  contract_type: string;
  name: string;
  symbol: string;
  image_url?: string;
  metadata?: string;
  extra_metadata?: {
    image_url?: string;
    name?: string;
    description?: string;
  };
  collection?: {
    name?: string;
  };
}

export interface ERC1155Balance {
  chainId: string;
  chain_id: string;
  tokenAddress: string;
  token_address: string;
  tokenId: string;
  token_id: string;
  balance: string;
  metadata_url?: string;
  extra_metadata?: {
    id?: string;
    type?: string;
    uri?: string;
  };
  collection?: {
    name?: string;
  };
  contract?: {
    chain_id?: string;
    address?: string;
    type?: string;
    name?: string;
    symbol?: string;
  };
}

// NFT Collection interface
export interface NFTCollection {
  token: {
    address: string;
    name: string;
    symbol: string;
    type: string;
    holders: string;
    total_supply: string;
  };
  amount: string;
  token_count: number;
  token_instances?: Array<{
    token_id: string;
    token_type: string;
    name?: string;
    description?: string;
    image_url?: string;
    metadata?: {
      name?: string;
      description?: string;
      image?: string;
      attributes?: Array<{
        trait_type: string;
        value: string | number;
      }>;
    };
  }>;
}

// Token Holding interface
export interface TokenHolding {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenQuantity: string;
  tokenValueInUsd: string;
}

// Mitosis specific types
export interface MitosisRankData {
  address: string;
  mitoBalance: string;
  wmitoBalance: string;
  totalBalance: string;
  rank: number;
  percentile: number;
  erc20Holdings: any[];
  erc721Holdings: any[];
  mitoPercentile: string;
  wmitoPercentile: string;
  totalPercentile: string;
}

// Monad Testnet types
export interface MonadTestnetStats {
  address: string;
  nativeBalance: string;
  rpcTransactionCount: number;
  totalTransactions: number;
  totalVolume: string;
  firstSeen: string;
  firstTransactionHash: string;
  walletAge: {
    days: number;
    creationDate: string;
  };
  contractsCreated: {
    total: number;
    list: any[];
  };
  contractsInteracted: {
    total: number;
    list: any[];
  };
  transactions: any[];
  uniqueDays: Set<string>;
  uniqueWeeks: Set<string>;
  uniqueMonths: Set<string>;
  tokens: ERC20Token[];
  nfts: ERC721NFT[];
  erc1155tokens: ERC1155Balance[];
  is1MillionNadHolder: boolean;
  isSecondNftHolder: boolean;
}

// Soneium types
export interface SoneiumStats {
  address: string;
  nativeBalance: string;
  transactionCount: number;
  balanceHistory: any[];
  contractsCreated: any[];
  contractsInteracted: any[];
  uniqueDays: Set<string>;
  uniqueWeeks: Set<string>;
  uniqueMonths: Set<string>;
  walletAge: {
    days: number;
    creationDate: string;
  };
  firstSeen: string;
  firstTransactionHash: string;
} 