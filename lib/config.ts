// Array of API keys for Lineascan
export const LINEASCAN_API_KEYS = [
    process.env.NEXT_PUBLIC_LINEASCAN_API_KEY_1,
    process.env.NEXT_PUBLIC_LINEASCAN_API_KEY_2,
    process.env.NEXT_PUBLIC_LINEASCAN_API_KEY_3,
    process.env.NEXT_PUBLIC_LINEASCAN_API_KEY_4,
    process.env.NEXT_PUBLIC_LINEASCAN_API_KEY_5,
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