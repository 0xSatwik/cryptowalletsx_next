/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['cdn.example.com'], // Add any external image domains here
  },
  async redirects() {
    return [
      // Original redirects
      {
        source: '/zora',
        destination: '/web3-tools',
        permanent: true,
      },


      {
        source: '/sahara',
        destination: '/sahara-ai-stats-checker',
        permanent: true,
      },

      {
        source: '/mitosis-matrix',
        destination: '/mitosis',
        permanent: true,
      },


      {
        source: '/pharos',
        destination: '/pharos-stats-checker',
        permanent: true,
      },

      {
        source: '/mitosis-rank',
        destination: '/mitosis',
        permanent: true,
      },
      {
        source: '/zora-eligibility',
        destination: '/zora',
        permanent: true,
      },
      {
        source: '/mito/single',
        destination: '/mitosis-rank',
        permanent: true,
      },
      {
        source: '/mito/bulk',
        destination: '/mitosis-rank',
        permanent: true,
      },
      
      // New redirects
      {
        source: '/monad',
        destination: '/monad-testnet',
        permanent: true,
      },
      {
        source: '/how-monad-stats-score-works',
        destination: '/post/monad-testnet-score-calculation',
        permanent: true,
      },
    ];
  },
  // Add rewrites to ensure direct API access
  async rewrites() {
    return {
      fallback: [
        // Ensure Somnia API calls go directly to the intended endpoints
        {
          source: '/api/somnia/:path*',
          destination: 'https://somnia-poc.w3us.site/api/v2/:path*',
        },
        {
          source: '/api/shannon/:path*',
          destination: 'https://shannon-explorer.somnia.network/api/:path*',
        },
        {
          source: '/api/somnia/v1/explorer/address/:address/profile',
          destination: 'https://api.socialscan.io/somnia-testnet/v1/explorer/address/:address/profile',
        },
        {
          source: '/api/somnia/v1/explorer/transactions',
          destination: 'https://api.socialscan.io/somnia-testnet/v1/explorer/transactions',
        },
        {
          source: '/api/somnia/v2/explorer/address/:address/token_holdings',
          destination: 'https://api.socialscan.io/somnia-testnet/v2/explorer/address/:address/token_holdings',
        },
      ],
    };
  },
  env: {
    // Alchemy API keys (10 keys as mentioned by user)
    VITE_ALCHEMY_API_KEY_1: process.env.VITE_ALCHEMY_API_KEY_1 || 'FBKOVxVYW0yobV1ntzs7u5qM0E6_xRwO',
    VITE_ALCHEMY_API_KEY_2: process.env.VITE_ALCHEMY_API_KEY_2 || 'FBKOVxVYW0yobV1ntzs7u5qM0E6_xRwO',
    VITE_ALCHEMY_API_KEY_3: process.env.VITE_ALCHEMY_API_KEY_3 || 'FBKOVxVYW0yobV1ntzs7u5qM0E6_xRwO',
    VITE_ALCHEMY_API_KEY_4: process.env.VITE_ALCHEMY_API_KEY_4 || 'FBKOVxVYW0yobV1ntzs7u5qM0E6_xRwO',
    VITE_ALCHEMY_API_KEY_5: process.env.VITE_ALCHEMY_API_KEY_5 || 'FBKOVxVYW0yobV1ntzs7u5qM0E6_xRwO',
    VITE_ALCHEMY_API_KEY_6: process.env.VITE_ALCHEMY_API_KEY_6 || 'FBKOVxVYW0yobV1ntzs7u5qM0E6_xRwO',
    VITE_ALCHEMY_API_KEY_7: process.env.VITE_ALCHEMY_API_KEY_7 || 'FBKOVxVYW0yobV1ntzs7u5qM0E6_xRwO',
    VITE_ALCHEMY_API_KEY_8: process.env.VITE_ALCHEMY_API_KEY_8 || 'FBKOVxVYW0yobV1ntzs7u5qM0E6_xRwO',
    VITE_ALCHEMY_API_KEY_9: process.env.VITE_ALCHEMY_API_KEY_9 || 'FBKOVxVYW0yobV1ntzs7u5qM0E6_xRwO',
    VITE_ALCHEMY_API_KEY_10: process.env.VITE_ALCHEMY_API_KEY_10 || 'FBKOVxVYW0yobV1ntzs7u5qM0E6_xRwO',
    
    // Lineascan API keys
    VITE_LINEASCAN_API_KEY_1: process.env.VITE_LINEASCAN_API_KEY_1 || 'ZUXE1TFGQHSXPVKBDXCK2YFQ1CQ33XK1A3',
    VITE_LINEASCAN_API_KEY_2: process.env.VITE_LINEASCAN_API_KEY_2 || '8GR7KCJBGDJBPP2WCGG36MI87SVFW8JCSY',
    VITE_LINEASCAN_API_KEY_3: process.env.VITE_LINEASCAN_API_KEY_3 || 'TK37XWG5B3V21RHF7HU9Y2ZW8RYDXB3KPZ',
    
    // ThirdWeb Client IDs (1-17 excluding 13)
    VITE_THIRDWEB_CLIENT_ID_1: process.env.VITE_THIRDWEB_CLIENT_ID_1 || '',
    VITE_THIRDWEB_CLIENT_ID_2: process.env.VITE_THIRDWEB_CLIENT_ID_2 || '',
    VITE_THIRDWEB_CLIENT_ID_3: process.env.VITE_THIRDWEB_CLIENT_ID_3 || '',
    VITE_THIRDWEB_CLIENT_ID_4: process.env.VITE_THIRDWEB_CLIENT_ID_4 || '',
    VITE_THIRDWEB_CLIENT_ID_5: process.env.VITE_THIRDWEB_CLIENT_ID_5 || '',
    VITE_THIRDWEB_CLIENT_ID_6: process.env.VITE_THIRDWEB_CLIENT_ID_6 || '',
    VITE_THIRDWEB_CLIENT_ID_7: process.env.VITE_THIRDWEB_CLIENT_ID_7 || '',
    VITE_THIRDWEB_CLIENT_ID_8: process.env.VITE_THIRDWEB_CLIENT_ID_8 || '',
    VITE_THIRDWEB_CLIENT_ID_9: process.env.VITE_THIRDWEB_CLIENT_ID_9 || '',
    VITE_THIRDWEB_CLIENT_ID_10: process.env.VITE_THIRDWEB_CLIENT_ID_10 || '',
    VITE_THIRDWEB_CLIENT_ID_11: process.env.VITE_THIRDWEB_CLIENT_ID_11 || '',
    VITE_THIRDWEB_CLIENT_ID_12: process.env.VITE_THIRDWEB_CLIENT_ID_12 || '',
    VITE_THIRDWEB_CLIENT_ID_14: process.env.VITE_THIRDWEB_CLIENT_ID_14 || '',
    VITE_THIRDWEB_CLIENT_ID_15: process.env.VITE_THIRDWEB_CLIENT_ID_15 || '',
    VITE_THIRDWEB_CLIENT_ID_16: process.env.VITE_THIRDWEB_CLIENT_ID_16 || '',
    VITE_THIRDWEB_CLIENT_ID_17: process.env.VITE_THIRDWEB_CLIENT_ID_17 || '',
    VITE_THIRDWEB_CLIENT_ID: process.env.VITE_THIRDWEB_CLIENT_ID || '',
    
    // Make ThirdWeb API keys available in browser with NEXT_PUBLIC_ prefix
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID_1: process.env.VITE_THIRDWEB_CLIENT_ID_1 || '',
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID_2: process.env.VITE_THIRDWEB_CLIENT_ID_2 || '',
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID_3: process.env.VITE_THIRDWEB_CLIENT_ID_3 || '',
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID_4: process.env.VITE_THIRDWEB_CLIENT_ID_4 || '',
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID_5: process.env.VITE_THIRDWEB_CLIENT_ID_5 || '',
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID_6: process.env.VITE_THIRDWEB_CLIENT_ID_6 || '',
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID_7: process.env.VITE_THIRDWEB_CLIENT_ID_7 || '',
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID_8: process.env.VITE_THIRDWEB_CLIENT_ID_8 || '',
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID_9: process.env.VITE_THIRDWEB_CLIENT_ID_9 || '',
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID_10: process.env.VITE_THIRDWEB_CLIENT_ID_10 || '',
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID_11: process.env.VITE_THIRDWEB_CLIENT_ID_11 || '',
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID_12: process.env.VITE_THIRDWEB_CLIENT_ID_12 || '',
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID_14: process.env.VITE_THIRDWEB_CLIENT_ID_14 || '',
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID_15: process.env.VITE_THIRDWEB_CLIENT_ID_15 || '',
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID_16: process.env.VITE_THIRDWEB_CLIENT_ID_16 || '',
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID_17: process.env.VITE_THIRDWEB_CLIENT_ID_17 || '',
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID: process.env.VITE_THIRDWEB_CLIENT_ID || '',
  },
};

module.exports = nextConfig; 
