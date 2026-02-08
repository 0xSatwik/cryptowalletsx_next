"use client";

import React, { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Wallet, BarChart2, Wrench, Home, Zap, Shield, Database, FileText, ChevronDown, Layers, Gift, Coins, Activity, Globe, Send } from 'lucide-react';

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
      name: 'Tempo',
      href: '/tempo',
      icon: Zap,
      hasDropdown: false
    },
    {
      name: 'WODL Solver',
      href: '/binance-wotd-solver',
      icon: Gift,
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
        { name: 'Tempo Stats Checker', href: '/tempo', icon: Zap },
        { name: 'Relay Stats Checker', href: '/relay-stats-checker', icon: Activity },
        { name: 'Jumper Stats Checker', href: '/jumper-stats-checker', icon: Zap },
        { name: 'Fogo Stats Checker', href: '/fogo-stats-checker', icon: Database },
        { name: 'Gitcoin Passport', href: '/gitcoin/bulk', icon: Shield },
        { name: 'Balance Checker', href: '/balance-checker', icon: Coins },
        { name: 'Galxe Points', href: '/galxe-airdrops', icon: Gift }

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
      className={`top-0 left-0 right-0 z-50 transition-all duration-300 pb-2 ${scrolled
        ? 'bg-white/90 backdrop-blur-md shadow-md'
        : 'bg-gradient-to-r from-blue-600 to-indigo-600'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex justify-start flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Wallet className={`h-6 w-6 text-blue-600 group-hover:text-indigo-600 transition-colors duration-300`} />
              </div>
              <div className="ml-3">
                <span className={`text-xl font-bold ${scrolled
                  ? 'text-blue-600'
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100 dark:from-white dark:to-blue-200'
                  } group-hover:scale-105 transition-transform duration-300`}>
                  WalletsX
                </span>
                <span className={`block text-xs ${scrolled ? 'text-gray-500' : 'text-blue-100'
                  }`}>
                  Crypto Analytics
                </span>
              </div>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden ml-4">
            <button
              type="button"
              className={`rounded-xl p-3 inline-flex items-center justify-center shadow-lg ${scrolled
                ? 'text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200'
                : 'text-white hover:text-gray-100 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20'
                } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-300 transition-all duration-200`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex flex-1 justify-center">
            <nav className="flex items-center space-x-1 xl:space-x-2 bg-white/10 backdrop-blur-sm rounded-2xl px-2 py-1 border border-white/20">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`) ||
                  (item.dropdownItems && item.dropdownItems.some(subItem => pathname === subItem.href || pathname.startsWith(`${subItem.href}/`)));
                const Icon = item.icon;

                return (
                  <div key={item.name} className="relative group">
                    {item.hasDropdown ? (
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className={`flex items-center font-medium px-3 xl:px-4 py-2.5 rounded-xl transition-all duration-200 whitespace-nowrap ${isActive
                          ? scrolled ? 'text-blue-600 bg-white shadow-sm' : 'text-blue-600 bg-white shadow-sm'
                          : scrolled
                            ? 'text-gray-700 hover:text-blue-600 hover:bg-white/80'
                            : 'text-white/90 hover:text-white hover:bg-white/20'
                          }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        <span className="text-sm xl:text-base">{item.name}</span>
                        <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className={`flex items-center font-medium px-3 xl:px-4 py-2.5 rounded-xl transition-all duration-200 whitespace-nowrap ${isActive
                          ? scrolled ? 'text-blue-600 bg-white shadow-sm' : 'text-blue-600 bg-white shadow-sm'
                          : scrolled
                            ? 'text-gray-700 hover:text-blue-600 hover:bg-white/80'
                            : 'text-white/90 hover:text-white hover:bg-white/20'
                          }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        <span className="text-sm xl:text-base">{item.name}</span>
                      </Link>
                    )}

                    {/* Dropdown menu */}
                    {item.hasDropdown && (
                      <div
                        className={`absolute left-0 mt-2 w-56 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 transition-all duration-200 z-50 ${activeDropdown === item.name ? 'opacity-100 visible' : 'opacity-0 invisible'
                          }`}
                      >
                        <div className="py-2" role="menu" aria-orientation="vertical">
                          {item.dropdownItems?.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = pathname === subItem.href || pathname.startsWith(`${subItem.href}/`);

                            return (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium ${isSubActive
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                  } transition-colors duration-200`}
                                onClick={() => setActiveDropdown(null)}
                              >
                                <SubIcon className="h-4 w-4 mr-3 flex-shrink-0" />
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
          </div>

          {/* Desktop CTA button */}
          <div className="hidden lg:flex items-center flex-shrink-0">
            <a
              href="https://t.me/cwxstats"
              target="_blank"
              rel="noopener noreferrer"
              className={`ml-4 whitespace-nowrap inline-flex items-center justify-center px-4 xl:px-6 py-2.5 border border-transparent rounded-xl shadow-lg text-sm xl:text-base font-bold ${scrolled
                ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-400/20 hover:shadow-xl'
                : 'text-blue-600 bg-white hover:bg-gray-50 shadow-white/20 hover:shadow-xl'
                } transition-all duration-300 transform hover:scale-105`}
            >
              <Send className="h-4 w-4 mr-2" />
              <span className="hidden xl:inline">Join Community</span>
              <span className="xl:hidden">Join</span>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on mobile menu state */}
      <div
        className={`${isMenuOpen ? 'fixed inset-0 z-50 overflow-hidden' : 'hidden'
          } lg:hidden`}
        aria-modal="true"
      >
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={closeMenu}></div>

        <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl flex flex-col overflow-y-auto transform transition-transform duration-300 ease-in-out">
          <div className="px-4 pt-5 pb-2 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                <Wallet className="h-4 w-4 text-blue-600" />
              </div>
              <span className="ml-2 text-lg font-bold text-white">WalletsX</span>
            </div>
            <button
              type="button"
              className="rounded-md p-2 inline-flex items-center justify-center text-white hover:text-gray-200 hover:bg-white/10 transition-colors duration-200"
              onClick={closeMenu}
            >
              <span className="sr-only">Close menu</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Mobile navigation */}
          <div className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`) ||
                  (item.dropdownItems && item.dropdownItems.some(subItem => pathname === subItem.href || pathname.startsWith(`${subItem.href}/`)));
                const Icon = item.icon;

                return (
                  <div key={item.name} className="mb-2">
                    {item.hasDropdown ? (
                      <Fragment>
                        <button
                          onClick={() => toggleDropdown(item.name)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium shadow-sm border transition-all duration-200 ${isActive
                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600 bg-white border-gray-200'
                            }`}
                        >
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg mr-3 ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                              <Icon className="h-4 w-4 flex-shrink-0" />
                            </div>
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
                        </button>

                        {activeDropdown === item.name && (
                          <div className="mt-2 ml-4 space-y-1">
                            {item.dropdownItems?.map((subItem) => {
                              const SubIcon = subItem.icon;
                              const isSubActive = pathname === subItem.href || pathname.startsWith(`${subItem.href}/`);

                              return (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium border transition-all duration-200 ${isSubActive
                                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600 bg-white border-gray-100'
                                    }`}
                                  onClick={closeMenu}
                                >
                                  <div className={`p-1.5 rounded-md mr-3 ${isSubActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                    <SubIcon className="h-3 w-3 flex-shrink-0" />
                                  </div>
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
                        className={`flex items-center px-4 py-3 rounded-xl text-base font-medium shadow-sm border transition-all duration-200 ${isActive
                          ? 'bg-blue-50 text-blue-600 border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600 bg-white border-gray-200'
                          }`}
                        onClick={closeMenu}
                      >
                        <div className={`p-2 rounded-lg mr-3 ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <Icon className="h-4 w-4 flex-shrink-0" />
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    )}
                  </div>
                );
              })}

              {/* Mobile CTA */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <a
                  href="https://t.me/cwxstats"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200"
                  onClick={closeMenu}
                >
                  <Send className="h-5 w-5 mr-2" />
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