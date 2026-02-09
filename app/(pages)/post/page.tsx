import React from 'react';
import Link from '@/app/components/Link';
import { Metadata } from 'next';
import Image from 'next/image';

// Metadata for the page
export const metadata: Metadata = {
  title: 'Blog Posts | WalletsX',
  description: 'Explore our latest articles and insights about blockchain technology, DeFi, and crypto analytics.',
};

// Post data
const posts = [
  {
    slug: 'mitosis-defi-revolution',
    title: "Mitosis: The DeFi Revolution You've Been Waiting For",
    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  },
  {
    slug: 'monad-testnet-score-calculation',
    title: "How Monad Testnet Score is Calculated: Complete Guide",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  },
  {
    slug: 'sahara-ai-score-calculation',
    title: "Sahara AI Testnet Score: Unveiling the Calculation Method",
    image: "https://images.unsplash.com/photo-1639755982994-8825056a25c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  },
  {
    slug: '/binance-word-of-the-day-answer-today',
    title: "Binance Word of the Day Answer Today (Confirmed)",
    image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80",
  },
  {
    slug: '/city-holder-trivia-answer-today',
    title: "City Holder Trivia Answer Today (100% Verified)",
    image: "https://images.unsplash.com/photo-1541872703-74c5e443d1f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  }
];

export default function PostsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Blog & Insights
          </span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Explore the latest articles, tutorials, and insights about blockchain technology and crypto analytics.
        </p>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link
            href={post.slug.startsWith('/') ? post.slug : `/post/${post.slug}`}
            key={post.slug}
            className="group"
          >
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
              <div className="aspect-[16/9] relative overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${post.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
              <div className="p-6 flex-grow flex items-center">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 