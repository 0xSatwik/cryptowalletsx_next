'use client';

import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-purple-600">
                WalletsX
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Home
              </Link>
              <Link href="/about" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                About
              </Link>
              <div className="relative group">
                <button className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                  Tools <ChevronDown size={16} className="ml-1" />
                </button>
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block z-10">
                  <Link href="/monad-testnet" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Monad Testnet
                  </Link>
                  <Link href="/linea" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Linea
                  </Link>
                  <Link href="/soneium" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Soneium
                  </Link>
                  <Link href="/megaeth" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    MegaETH
                  </Link>
                  <Link href="/web3-tools" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    All Tools
                  </Link>
                </div>
              </div>
              <Link href="/contact" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Contact
              </Link>
            </nav>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
              Home
            </Link>
            <Link href="/about" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
              About
            </Link>
            <div className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600">
              Tools
              <div className="ml-4 mt-2 space-y-1">
                <Link href="/monad-testnet" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
                  Monad Testnet
                </Link>
                <Link href="/linea" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
                  Linea
                </Link>
                <Link href="/soneium" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
                  Soneium
                </Link>
                <Link href="/megaeth" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
                  MegaETH
                </Link>
                <Link href="/web3-tools" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
                  All Tools
                </Link>
              </div>
            </div>
            <Link href="/contact" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
} 