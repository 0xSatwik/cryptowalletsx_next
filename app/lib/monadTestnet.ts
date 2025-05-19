import { ERC20Token, ERC721NFT, ERC1155Balance } from '../types';

export interface MonadTestnetStats {
  address: string;
  totalTransactions: number;
  totalVolume: string;
  transactions: {
    hash: string;
    block_timestamp: number;
    from_address: string;
    to_address: string;
    value: string;
    gas_price: string;
    gas_used: string;
    method: string;
    status: boolean;
  }[];
  uniqueDays: Set<string>;
  uniqueWeeks: Set<string>;
  uniqueMonths: Set<string>;
  contractsCreated: {
    total: number;
    addresses: string[];
    timestamps: Record<string, number>;
  };
  contractsInteracted: {
    total: number;
    addresses: string[];
    interactionCounts: Record<string, number>;
    timestamps: Record<string, number>;
  };
  is1MillionNadHolder: boolean;
  isSecondNftHolder: boolean;
  tokens: ERC20Token[];
  nfts: ERC721NFT[];
  erc1155tokens: ERC1155Balance[];
  firstSeen: Date;
  nativeBalance: string;
  rpcTransactionCount: number;
  walletAge: {
    days: number;
    text: string;
    creationDate: string;
  };
  firstTransactionHash: string;
}

export async function fetchMonadTestnetStats(
  address: string, 
  statusCallback?: (status: string) => void
): Promise<MonadTestnetStats> {
  // This is a mock implementation - in a real app, you'd fetch data from an API
  statusCallback?.('Initializing...');
  await delay(500);
  
  statusCallback?.('Fetching transaction history...');
  await delay(1000);
  
  statusCallback?.('Processing transaction data...');
  await delay(800);
  
  statusCallback?.('Analyzing contract interactions...');
  await delay(700);
  
  statusCallback?.('Checking token balances...');
  await delay(600);
  
  statusCallback?.('Checking 1 Million Nad NFT ownership...');
  await delay(900);
  
  statusCallback?.('Found 1 Million Nad NFT');
  await delay(300);
  
  statusCallback?.('Checking second NFT ownership...');
  await delay(700);
  
  statusCallback?.('No second NFT found');
  await delay(200);
  
  statusCallback?.('Finalizing data...');
  await delay(500);
  
  const firstSeenDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  
  // Return mock data
  return {
    address,
    totalTransactions: 42,
    totalVolume: '123.456',
    transactions: [
      {
        hash: '0x123abc...',
        block_timestamp: Date.now() / 1000 - 86400, // 1 day ago
        from_address: address,
        to_address: '0xdef456...',
        value: '0.1',
        gas_price: '0.000001',
        gas_used: '21000',
        method: 'transfer',
        status: true
      }
    ],
    uniqueDays: new Set(['2023-04-01', '2023-04-02']),
    uniqueWeeks: new Set(['2023-W13', '2023-W14']),
    uniqueMonths: new Set(['2023-04', '2023-05']),
    contractsCreated: {
      total: 2,
      addresses: ['0xcontract1...', '0xcontract2...'],
      timestamps: {
        '0xcontract1...': Date.now() / 1000 - 604800, // 1 week ago
        '0xcontract2...': Date.now() / 1000 - 1209600 // 2 weeks ago
      }
    },
    contractsInteracted: {
      total: 5,
      addresses: ['0xdapp1...', '0xdapp2...', '0xdapp3...', '0xdapp4...', '0xdapp5...'],
      interactionCounts: {
        '0xdapp1...': 10,
        '0xdapp2...': 5,
        '0xdapp3...': 3,
        '0xdapp4...': 2,
        '0xdapp5...': 1
      },
      timestamps: {
        '0xdapp1...': Date.now() / 1000 - 86400, // 1 day ago
        '0xdapp2...': Date.now() / 1000 - 172800, // 2 days ago
        '0xdapp3...': Date.now() / 1000 - 259200, // 3 days ago
        '0xdapp4...': Date.now() / 1000 - 345600, // 4 days ago
        '0xdapp5...': Date.now() / 1000 - 432000  // 5 days ago
      }
    },
    is1MillionNadHolder: true,
    isSecondNftHolder: false,
    tokens: [],
    nfts: [],
    erc1155tokens: [],
    firstSeen: firstSeenDate,
    nativeBalance: '1.234',
    rpcTransactionCount: 42,
    walletAge: {
      days: 30,
      text: '30 days',
      creationDate: firstSeenDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    firstTransactionHash: '0xfirst123...'
  };
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
} 