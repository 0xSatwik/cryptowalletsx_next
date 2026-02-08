import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Base URL of your website
  const baseUrl = 'https://cryptowalletsx.com';

  // Current date for lastModified
  const currentDate = new Date();

  // Define all your routes
  const routes = [
    // Main pages
    '',
    '/about',
    '/contact',
    '/post',
    '/tempo',
    '/privacy',
    '/web3-tools',

    // posts
    '/post/monad-testnet-score-calculation',
    '/post/mitosis-defi-revolution',

    // Tool pages
    '/balance-checker',
    '/megaeth',
    '/monad-testnet',
    '/layerzero-stats',
    '/linea',
    '/sahara-ai-stats-checker',
    '/relay-stats-checker',
    '/mitosis',
    '/game-of-mito',
    '/somnia',
    '/soneium',
    '/soneium-badge-checker',
    '/galxe-airdrops',
    '/kaito-yaps',
    '/ink',
    '/pharos-stats-checker',
    '/gitcoin',
    '/base-stats-checker',
    '/fogochain-checker',
    '/jumper-stats-checker',
    '/binance-word-of-the-day-solver',
    '/binance-wotd-answer-today'
  ];

  // Generate sitemap items
  const sitemap = routes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' ? 'daily' : 'weekly',  // Home page changes more frequently
    priority: route === '' ? 1.0 : 0.8,                  // Home page has highest priority
  })) as MetadataRoute.Sitemap;

  return sitemap;
} 