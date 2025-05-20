// Array of API keys for Lineascan
export const LINEASCAN_API_KEYS = [
    process.env.VITE_LINEASCAN_API_KEY_1 || 'ZUXE1TFGQHSXPVKBDXCK2YFQ1CQ33XK1A3',
    process.env.VITE_LINEASCAN_API_KEY_2 || '8GR7KCJBGDJBPP2WCGG36MI87SVFW8JCSY',
    process.env.VITE_LINEASCAN_API_KEY_3 || 'TK37XWG5B3V21RHF7HU9Y2ZW8RYDXB3KPZ',
    process.env.VITE_LINEASCAN_API_KEY_4,
    process.env.VITE_LINEASCAN_API_KEY_5,
  ].filter(Boolean) as string[]; // Only keep non-empty keys and assert as string array
  
  // Get a random API key from the pool
  export function getRandomApiKey(): string {
    if (LINEASCAN_API_KEYS.length === 0) {
      throw new Error('No Lineascan API keys configured. Please add at least one API key to your .env file.');
    }
    const index = Math.floor(Math.random() * LINEASCAN_API_KEYS.length);
    return LINEASCAN_API_KEYS[index];
  }
  
  export const LINEA_EXPLORER_URL = 'https://lineascan.build';
  export const LINEA_API_BASE = 'https://api.lineascan.build/api';
  export const LINEA_EXPLORER_API = 'https://api-explorer.linea.build/api/v2';
  export const LXP_API = 'https://kx58j6x5me.execute-api.us-east-1.amazonaws.com/linea';