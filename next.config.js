/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['cdn.example.com'], // Add any external image domains here
  },
  async redirects() {
    return [
      {
        source: '/zora',
        destination: '/',
        permanent: true,
      },
      {
        source: '/mitosis-matrix',
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
    ];
  },
  env: {
    // Make Vite environment variables available to Next.js
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
    
    VITE_THIRDWEB_CLIENT_ID_1: process.env.VITE_THIRDWEB_CLIENT_ID_1 || '',
    VITE_THIRDWEB_CLIENT_ID_2: process.env.VITE_THIRDWEB_CLIENT_ID_2 || '',
    VITE_THIRDWEB_CLIENT_ID_3: process.env.VITE_THIRDWEB_CLIENT_ID_3 || '',
    VITE_THIRDWEB_CLIENT_ID_7: process.env.VITE_THIRDWEB_CLIENT_ID_7 || '',
    VITE_THIRDWEB_CLIENT_ID_9: process.env.VITE_THIRDWEB_CLIENT_ID_9 || '',
    VITE_THIRDWEB_CLIENT_ID_10: process.env.VITE_THIRDWEB_CLIENT_ID_10 || '',
    VITE_THIRDWEB_CLIENT_ID_11: process.env.VITE_THIRDWEB_CLIENT_ID_11 || '',
    VITE_THIRDWEB_CLIENT_ID_12: process.env.VITE_THIRDWEB_CLIENT_ID_12 || '',
    VITE_THIRDWEB_CLIENT_ID_13: process.env.VITE_THIRDWEB_CLIENT_ID_13 || '',
    VITE_THIRDWEB_CLIENT_ID_14: process.env.VITE_THIRDWEB_CLIENT_ID_14 || '',
    VITE_THIRDWEB_CLIENT_ID_15: process.env.VITE_THIRDWEB_CLIENT_ID_15 || '',
    VITE_THIRDWEB_CLIENT_ID_16: process.env.VITE_THIRDWEB_CLIENT_ID_16 || '',
    VITE_THIRDWEB_CLIENT_ID_17: process.env.VITE_THIRDWEB_CLIENT_ID_17 || '',
    VITE_THIRDWEB_CLIENT_ID_18: process.env.VITE_THIRDWEB_CLIENT_ID_18 || '',
    VITE_THIRDWEB_CLIENT_ID: process.env.VITE_THIRDWEB_CLIENT_ID || '',
  },
};

module.exports = nextConfig; 