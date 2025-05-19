// Matrix component types
export interface PortfolioItemProps {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  loading?: boolean;
}

export interface MatrixStats {
  totalSupply: string;
  circulatingSupply: string;
  holders: string;
  price: string;
  marketCap: string;
  fullyDilutedValuation: string;
  volume24h: string;
  priceChange24h: string;
  priceChange7d: string;
  priceChange30d: string;
  allTimeHigh: string;
  allTimeLow: string;
}

export interface TokenPrice {
  usd: number;
  usd_24h_change: number;
  usd_7d_change?: number;
  usd_30d_change?: number;
}

export interface TokenData {
  id: string;
  symbol: string;
  name: string;
  market_data: {
    current_price: {
      usd: number;
    };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    market_cap: {
      usd: number;
    };
    fully_diluted_valuation: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
    ath: {
      usd: number;
    };
    atl: {
      usd: number;
    };
  };
}

export interface TokenHolderData {
  total: number;
  holders: Array<{
    address: string;
    balance: string;
    percentage: number;
  }>;
} 