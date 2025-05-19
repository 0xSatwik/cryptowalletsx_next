// ERC20 Token interface
export interface ERC20Token {
  chainId: number;
  chain_id?: number;
  tokenAddress: string;
  token_address?: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  logo?: string;
  thumbnail?: string;
}

// ERC721 NFT interface
export interface ERC721NFT {
  chainId: number;
  chain_id?: number;
  tokenAddress: string;
  token_address?: string;
  tokenId: string;
  token_id?: string;
  owner_of?: string;
  block_number?: string;
  block_number_minted?: string;
  token_hash?: string;
  amount?: string;
  contract_type?: string;
  name?: string;
  symbol?: string;
  token_uri?: string;
  metadata?: string;
  last_token_uri_sync?: string;
  last_metadata_sync?: string;
  minter_address?: string;
  image?: string;
  image_url?: string;
  extra_metadata?: {
    attributes?: any[];
    description?: string;
    image?: string;
    name?: string;
    image_url?: string;
  };
  collection?: {
    name?: string;
  };
  contract?: {
    chain_id?: number;
    address?: string;
    name?: string;
  };
}

// ERC1155 Balance interface
export interface ERC1155Balance {
  chainId: number;
  chain_id?: number;
  tokenAddress: string;
  token_address?: string;
  tokenId: string;
  token_id?: string;
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
    chain_id?: number;
    address?: string;
    name?: string;
  };
} 