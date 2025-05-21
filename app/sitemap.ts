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
    '/privacy',
    '/web3-tools',
    
    // Tool pages
    '/balance-checker',
    '/megaeth',
    '/monad-testnet',
    '/layerzero-stats',
    '/linea',
    '/mitosis',
    '/game-of-mito',
    '/somnia',
    '/soneium',
    '/soneium-badge-checker',
    '/galxe-airdrops',
    '/kaito-yaps',
    '/ink',
    '/gitcoin'
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