import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/fogo-stats-checker',
        disallow: [],
      },
      {
        userAgent: 'Googlebot',
        allow: '/fogo-stats-checker',
        disallow: [],
      },
      {
        userAgent: 'Bingbot',
        allow: '/fogo-stats-checker',
        disallow: [],
      },
    ],
    sitemap: 'https://cryptowalletsx.com/fogo-stats-checker/sitemap.xml',
  };
}
