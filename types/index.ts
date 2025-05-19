// TokenHolding interface
export interface TokenHolding {
  token_address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  logo?: string;
}

// NFTHolding interface
export interface NFTHolding {
  token_address: string;
  token_id: string;
  name?: string;
  symbol?: string;
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
    attributes?: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
  image_url?: string;
  balance?: string;
  contract_type?: string;
}

// WalletStats interface
export interface WalletStats {
  address: string;
  balance: string;
  transactionCount: number;
  firstActivity: string;
  erc20TransfersCount: number;
  erc721TransfersCount: number;
  erc1155TransfersCount: number;
  contractsInteracted: string[];
  contractsCreated: string[];
  verifiedContractsCount: number;
  mitoBalance: string;
  wmitoBalance: string;
  totalBalance: string;
}

// ERC20Token interface
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

// ERC721NFT interface
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

// ERC1155Balance interface
export interface ERC1155Balance {
  chainId: number;
  chain_id: number;
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
    chain_id: number;
    address: string;
    type: string;
    name?: string;
    symbol?: string;
  };
} 