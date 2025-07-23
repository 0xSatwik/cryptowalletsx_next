import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://cryptowalletsx.com/fogo-stats-checker',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          en: 'https://cryptowalletsx.com/fogo-stats-checker',
        },
      },
    },
  ];
}
