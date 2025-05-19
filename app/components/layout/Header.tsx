"use client";

import React, { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Wallet, BarChart2, Wrench, Home, Zap, Shield, Database, FileText, ChevronDown, Layers, Gift, Coins, Activity, Globe } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleDropdown = (name: string) => {
    if (activeDropdown === name) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(name);
    }
  };

  const navigation = [
    { 
      name: 'Home', 
      href: '/', 
      icon: Home,
      hasDropdown: false
    },
    { 
      name: 'Mitosis', 
      href: '/mitosis', 
      icon: BarChart2,
      hasDropdown: true,
      dropdownItems: [
        { name: 'Mitosis Overall Stats', href: '/mitosis', icon: BarChart2 },
        { name: 'Game of Mito', href: '/game-of-mito', icon: Activity },
        { name: 'GOM Bulk Checker', href: '/game-of-mito/bulk', icon: Database }
      ]
    },
    { 
      name: 'Monad', 
      href: '/monad-testnet', 
      icon: Zap,
      hasDropdown: false
    },
    { 
      name: 'Linea', 
      href: '/linea', 
      icon: Layers,
      hasDropdown: true,
      dropdownItems: [
        { name: 'Linea Single', href: '/linea', icon: Layers },
        { name: 'Linea Bulk', href: '/linea/bulk', icon: Database }
      ]
    },
    { 
      name: 'Other Chains', 
      href: '#', 
      icon: Globe,
      hasDropdown: true,
      dropdownItems: [
        { name: 'Somnia', href: '/somnia', icon: Shield },
        { name: 'Soneium', href: '/soneium', icon: Database },
        { name: 'Ink Chain', href: '/ink', icon: Layers },
        { name: 'MegaETH', href: '/megaeth', icon: Coins }
      ]
    },
    { 
      name: 'Tools', 
      href: '/web3-tools', 
      icon: Wrench,
      hasDropdown: true,
      dropdownItems: [
        { name: 'All Tools', href: '/web3-tools', icon: Wrench },
        { name: 'Gitcoin Passport', href: '/gitcoin/bulk', icon: Shield },
        { name: 'Balance Checker', href: '/balance-checker', icon: Coins },
        { name: 'Galxe Points', href: '/galxe-airdrops', icon: Gift },
        { name: 'Kaito Yaps', href: '/kaito-yaps', icon: BarChart2 }
      ]
    },
    { 
      name: 'Posts', 
      href: '/post', 
      icon: FileText,
      hasDropdown: false
    },
  ];

  return (
    <header 
      className={`top-0 left-0 right-0 z-50 transition-all duration-300 pb-2 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-md' 
          : 'bg-gradient-to-r from-blue-600 to-indigo-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:justify-start md:space-x-6">
          {/* Logo */}
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/" className="flex items-center group">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Wallet className={`h-6 w-6 text-blue-600 group-hover:text-indigo-600 transition-colors duration-300`} />
              </div>
              <div className="ml-3">
                <span className={`text-xl font-bold ${
                  scrolled 
                    ? 'text-blue-600' 
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100 dark:from-white dark:to-blue-200'
                } group-hover:scale-105 transition-transform duration-300`}>
                  WalletsX
                </span>
                <span className={`block text-xs ${
                  scrolled ? 'text-gray-500' : 'text-blue-100'
                }`}>
                  Crypto Analytics
                </span>
              </div>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 -my-2 md:hidden">
            <button
              type="button"
              className={`rounded-md p-2 inline-flex items-center justify-center ${
                scrolled 
                  ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100' 
                  : 'text-white hover:text-gray-100 hover:bg-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-300 transition-colors duration-200`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-4 lg:space-x-6 items-center">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`) || 
                (item.dropdownItems && item.dropdownItems.some(subItem => pathname === subItem.href || pathname.startsWith(`${subItem.href}/`)));
              const Icon = item.icon;
              
              return (
                <div key={item.name} className="relative group">
                  {item.hasDropdown ? (
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className={`flex items-center text-base font-medium ${
                        isActive
                          ? scrolled ? 'text-blue-600' : 'text-white font-semibold'
                          : scrolled
                            ? 'text-gray-700 hover:text-blue-600'
                            : 'text-white/90 hover:text-white'
                      } transition-colors duration-200 py-2`}
                    >
                      <Icon className="h-5 w-5 mr-1" />
                      {item.name}
                      <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center text-base font-medium ${
                        isActive
                          ? scrolled ? 'text-blue-600' : 'text-white font-semibold'
                          : scrolled
                            ? 'text-gray-700 hover:text-blue-600'
                            : 'text-white/90 hover:text-white'
                      } transition-colors duration-200 py-2`}
                    >
                      <Icon className="h-5 w-5 mr-1" />
                      {item.name}
                    </Link>
                  )}
                  
                  {/* Dropdown menu */}
                  {item.hasDropdown && (
                    <div 
                      className={`absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-200 z-50 ${
                        activeDropdown === item.name ? 'opacity-100 visible' : 'opacity-0 invisible'
                      }`}
                    >
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        {item.dropdownItems?.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = pathname === subItem.href || pathname.startsWith(`${subItem.href}/`);
                          
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`flex items-center px-4 py-2 text-sm ${
                                isSubActive 
                                  ? 'bg-blue-50 text-blue-600' 
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                              }`}
                              onClick={() => setActiveDropdown(null)}
                            >
                              <SubIcon className="h-4 w-4 mr-2" />
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Desktop CTA button */}
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
            <a
              href="https://t.me/cwxstats"
              target="_blank"
              rel="noopener noreferrer"
              className={`ml-4 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium ${
                scrolled 
                  ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-400/20 hover:shadow-lg' 
                  : 'text-blue-600 bg-white hover:bg-gray-100 shadow-blue-400/10 hover:shadow-lg'
              } transition-all duration-300`}
            >
              Join Community
            </a>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on mobile menu state */}
      <div
        className={`${
          isMenuOpen ? 'fixed inset-0 z-50 overflow-hidden' : 'hidden'
        } md:hidden`}
        aria-modal="true"
      >
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={closeMenu}></div>
        
        <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl flex flex-col overflow-y-auto">
          <div className="px-4 pt-5 pb-2 flex">
            <button
              type="button"
              className="ml-auto rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={closeMenu}
            >
              <span className="sr-only">Close menu</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          {/* Mobile navigation */}
          <div className="px-4 py-2">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`) || 
                  (item.dropdownItems && item.dropdownItems.some(subItem => pathname === subItem.href || pathname.startsWith(`${subItem.href}/`)));
                const Icon = item.icon;
                
                return (
                  <div key={item.name} className="py-1">
                    {item.hasDropdown ? (
                      <Fragment>
                        <button
                          onClick={() => toggleDropdown(item.name)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium ${
                            isActive
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                          }`}
                        >
                          <div className="flex items-center">
                            <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                            <span>{item.name}</span>
                          </div>
                          <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {activeDropdown === item.name && (
                          <div className="mt-1 pl-10 space-y-1">
                            {item.dropdownItems?.map((subItem) => {
                              const SubIcon = subItem.icon;
                              const isSubActive = pathname === subItem.href || pathname.startsWith(`${subItem.href}/`);
                              
                              return (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className={`flex items-center px-3 py-2 rounded-md text-sm ${
                                    isSubActive 
                                      ? 'bg-blue-50 text-blue-600' 
                                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                  }`}
                                  onClick={closeMenu}
                                >
                                  <SubIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                                  {subItem.name}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </Fragment>
                    ) : (
                      <Link
                        href={item.href}
                        className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                          isActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                        }`}
                        onClick={closeMenu}
                      >
                        <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                        {item.name}
                      </Link>
                    )}
                  </div>
                );
              })}
              
              {/* Mobile CTA */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <a
                  href="https://t.me/cwxstats"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  onClick={closeMenu}
                >
                  Join Community
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 