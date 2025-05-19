"use client";

import React from 'react';
import Link from 'next/link';
import { Wallet, Twitter, Github, ExternalLink, Zap, BarChart2, Database, Shield, Wrench, Home } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const mainLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Mitosis', href: '/mitosis', icon: BarChart2 },
    { name: 'Monad', href: '/monad-testnet', icon: Zap },
    { name: 'Linea', href: '/linea', icon: Database },
    { name: 'Soneium', href: '/soneium', icon: Shield },
    { name: 'Web3 Tools', href: '/web3-tools', icon: Wrench },
  ];

  const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com/walletsxapp', icon: Twitter },
    { name: 'GitHub', href: 'https://github.com/walletsxapp', icon: Github },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200 mt-8">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo and description */}
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Wallets.X0
              </span>
            </Link>
            <p className="text-gray-500 text-base max-w-xs">
              Comprehensive analytics for your crypto wallets across multiple platforms and ecosystems.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                  >
                    <span className="sr-only">{item.name}</span>
                    <Icon className="h-6 w-6" />
                  </a>
                );
              })}
            </div>
          </div>
          
          {/* Links sections */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 tracking-wider uppercase">
                Tools & Navigation
              </h3>
              <ul className="mt-4 grid grid-cols-2 gap-y-4">
                {mainLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="flex items-center text-base text-gray-500 hover:text-blue-600 transition-colors duration-200"
                      >
                        {Icon && <Icon className="h-4 w-4 mr-2" />}
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            {/* Newsletter */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 tracking-wider uppercase">
                Subscribe to our newsletter
              </h3>
              <p className="mt-4 text-base text-gray-500">
                Get the latest updates on new features and tools.
              </p>
              <form className="mt-4 sm:flex sm:max-w-md">
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  type="email"
                  name="email-address"
                  id="email-address"
                  autoComplete="email"
                  required
                  className="appearance-none min-w-0 w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
                <div className="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; {currentYear} Wallets.X0. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 