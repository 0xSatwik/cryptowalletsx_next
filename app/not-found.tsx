'use client';

import Link from '@/app/components/Link';
import { Home, Search, BarChart2, Newspaper, ArrowLeft, Compass, Rocket } from 'lucide-react';

export default function NotFound() {
  const quickLinks = [
    {
      title: 'Home',
      description: 'Return to the homepage',
      icon: <Home className="h-6 w-6 text-purple-600" />,
      link: '/'
    },
    {
      title: 'Web3 Tools',
      description: 'Explore our blockchain tools',
      icon: <BarChart2 className="h-6 w-6 text-purple-600" />,
      link: '/web3-tools'
    },
    {
      title: 'Articles',
      description: 'Read our latest articles',
      icon: <Newspaper className="h-6 w-6 text-purple-600" />,
      link: '/articles'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:py-24 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="max-w-4xl mx-auto text-center">
        <div className="relative mb-12">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="text-[20rem] font-extrabold text-purple-600 select-none">404</div>
          </div>

          <div className="relative z-10 py-16">
            <div className="mb-8 inline-block p-6 bg-white rounded-full shadow-xl">
              <Compass className="h-16 w-16 text-purple-600" />
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-6">Page Not Found</h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              The page you're looking for doesn't exist or has been moved to another location.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-lg group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Rocket className="text-purple-600" size={28} />
            <h2 className="text-2xl font-bold text-gray-900">Explore These Tools Instead</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                href={link.link}
                className="group p-6 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-all border border-gray-100 hover:border-purple-200 hover:shadow-md"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 transform group-hover:scale-110 transition-transform p-3 bg-white rounded-full shadow-sm">
                    {link.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {link.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {link.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 