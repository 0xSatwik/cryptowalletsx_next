'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, BarChart2, Gift, Zap, Coins, ChevronDown, ChevronUp, Check, Globe, Layers, Shield, Activity, Wallet, Wrench } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Only close dropdown if clicking outside the dropdown area
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // Add a small delay to allow navigation to complete first
        setTimeout(() => {
        setIsDropdownOpen(false);
        }, 100);
      }
      
      // Only unfocus search if clicking outside the search area and dropdown
      if (
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target as Node) &&
        !dropdownRef.current?.contains(event.target as Node)
      ) {
        // Add a small delay to allow navigation to complete first
        setTimeout(() => {
        setIsSearchFocused(false);
        }, 100);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Only include tools that have actual implemented pages
  const allTools = [
    {
      name: 'Monad Testnet Stats',
      description: 'Track your Monad testnet activity and statistics',
      path: '/monad-testnet',
      icon: <Zap size={20} />,
      logoColor: 'bg-purple-600 text-white',
      chain: 'Monad'
    },
    {
      name: 'Mitosis Stats Checker',
      description: 'Track your Mitosis wallet stats across Game of Mito, Matrix & Morse',
      path: '/mitosis',
      icon: <Activity size={20} />,
      logoColor: 'bg-blue-600 text-white',
      chain: 'Mitosis'
    },
    {
      name: 'Sahara AI Stats Checker',
      description: 'Check your wallet activity on the Sahara AI Testnet',
      path: '/sahara-ai-stats-checker',
      icon: <Zap size={20} />,
      logoColor: 'bg-green-600 text-white',
      chain: 'Sahara AI'
    },
    {
      name: 'Linea Bulk Checker',
      description: 'Check multiple Linea wallets at once',
      path: '/linea/bulk',
      icon: <Layers size={20} />,
      logoColor: 'bg-gray-800 text-white',
      chain: 'Linea'
    },
    {
      name: 'Soneium Chain Stats',
      description: 'Track your Soneium Chain activity and stats',
      path: '/soneium',
      icon: <Globe size={20} />,
      logoColor: 'bg-teal-600 text-white',
      chain: 'Soneium'
    },
    {
      name: 'Ink Chain Stats',
      description: 'Track your Ink Chain activity and stats',
      path: '/ink',
      icon: <Layers size={20} />,
      logoColor: 'bg-indigo-600 text-white',
      chain: 'Ink'
    },
    {
      name: 'Gitcoin Passport Checker',
      description: 'Check Gitcoin Passport scores for multiple wallets',
      path: '/gitcoin/bulk',
      icon: <Shield size={20} />,
      logoColor: 'bg-purple-600 text-white',
      chain: 'Multi-chain'
    },
    {
      name: 'Native Balance Checker',
      description: 'Check balances across multiple EVM chains',
      path: '/balance-checker',
      icon: <Coins size={20} />,
      logoColor: 'bg-yellow-600 text-white',
      chain: 'Multi-chain'
    },
    {
      name: 'Galxe Points Tracker',
      description: 'Track your Galxe points and airdrop eligibility',
      path: '/galxe-airdrops',
      icon: <Gift size={20} />,
      logoColor: 'bg-blue-600 text-white',
      chain: 'Multi-chain'
    },
    {
      name: 'Kaito Yaps Checker',
      description: 'Track your Kaito Yaps activity and stats',
      path: '/kaito-yaps',
      icon: <BarChart2 size={20} />,
      logoColor: 'bg-red-600 text-white',
      chain: 'Kaito'
    },
  ];

  const uniqueChains = Array.from(new Set(allTools.map(tool => tool.chain)));
  const filteredTools = allTools.filter(tool => {
    const matchesSearch = searchQuery === '' || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesChain = selectedChain === null || tool.chain === selectedChain;
    
    return matchesSearch && matchesChain;
  });

  const popularTools = [
    {
      title: 'Monad Testnet Activity Checker',
      description: 'Track your Monad Testnet wallet activity, contract interactions, and token holdings.',
      link: '/monad-testnet',
      icon: <Zap className="h-8 w-8 text-white" />,
      bgColor: 'bg-gradient-to-r from-purple-600 to-purple-700'
    },
    {
      title: 'Mitosis Analytics Dashboard',
      description: 'Comprehensive analytics for your Mitosis wallet across Game of Mito, Matrix, Expedition, and Morse NFTs.',
      link: '/mitosis',
      icon: <Activity className="h-8 w-8 text-white" />,
      bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-600'
    },
    {
      title: 'Somnia Chain Explorer',
      description: 'Monitor your Somnia Chain activity, token balances, and ecosystem participation.',
      link: '/somnia',
      icon: <Shield className="h-8 w-8 text-white" />,
      bgColor: 'bg-gradient-to-r from-teal-500 to-teal-600'
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white"></div>
        
        {/* Hero content */}
        <div className="relative pt-8 pb-4 sm:pb-8">
          <div className="mt-8 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Crypto Wallet Analytics</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Made Simple
                </span>
              </h1>
              <p className="mt-2 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-3 md:text-xl md:max-w-3xl">
                Track your wallet statistics across multiple blockchain networks including Mitosis, Monad, and Somnia with comprehensive analytics and insights.
              </p>
              <div className="mt-5 max-w-md mx-auto md:max-w-2xl">
                <div className="relative" ref={dropdownRef}>
                  <div 
                    className={`flex items-center rounded-lg border ${isSearchFocused ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'} bg-white shadow-sm overflow-hidden transition-all duration-200`}
                    onClick={() => {
                      setIsSearchFocused(true);
                      if (searchInputRef.current) {
                        searchInputRef.current.focus();
                      }
                    }}
                  >
                    <div className="px-4 py-2">
                      <Search className={`h-5 w-5 ${isSearchFocused ? 'text-blue-500' : 'text-gray-400'} transition-colors duration-200`} />
                    </div>
                    <input
                      ref={searchInputRef}
                      type="text"
                      className="w-full border-0 py-3 px-0 focus:ring-0 text-gray-900 placeholder-gray-500"
                      placeholder="Search tools..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                    />
                </div>
                  
                  {isSearchFocused && (
                    <div 
                      className="mt-2 max-h-64 overflow-y-auto rounded-lg bg-white shadow-lg border border-gray-200 animate-fadeIn"
                      onClick={(e) => {
                        // Prevent clicks within the dropdown from closing it
                        e.stopPropagation();
                      }}
                    >
                      {filteredTools.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                          {filteredTools.map((tool) => (
                            <li key={tool.path}>
                              <div
                                className="block px-4 py-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Navigate using the router instead of Link
                                  router.push(tool.path);
                                }}
                              >
                                <div className="flex items-center">
                                  <div className={`flex-shrink-0 h-8 w-8 rounded-md ${tool.logoColor} flex items-center justify-center`}>
                                    {tool.icon}
                                  </div>
                                  <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">{tool.name}</p>
                                    <p className="text-xs text-gray-500">{tool.description}</p>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-4 py-6 text-center text-gray-500">
                          No tools found matching your search
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Curved wave separator */}
        <div className="relative">
          <div className="absolute inset-0 h-12 bg-white"></div>
          <svg
            className="relative w-full h-12 text-white"
            preserveAspectRatio="none"
            viewBox="0 0 1440 54"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 22L120 16.7C240 11 480 1.00001 720 0.700012C960 1.00001 1200 11 1320 16.7L1440 22V54H1320C1200 54 960 54 720 54C480 54 240 54 120 54H0V22Z"></path>
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-8 bg-white overflow-hidden lg:py-12">
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
          <div className="relative">
            <h2 className="text-center text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to track your crypto
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-center text-xl text-gray-500">
              Get comprehensive insights into your wallet activity across multiple blockchain networks.
            </p>
          </div>

          <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div className="relative">
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
                Powerful analytics at your fingertips
              </h3>
              <p className="mt-3 text-lg text-gray-500">
                Track your wallet rankings, token balances, and ecosystem participation across multiple blockchains all in one place.
              </p>

              <dl className="mt-10 space-y-10">
                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <Search className="h-6 w-6" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Multi-Chain Tracking</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Enter any wallet address to see detailed statistics and rankings across Mitosis, Monad, Somnia and other platforms.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <BarChart2 className="h-6 w-6" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Comprehensive Stats</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    View detailed statistics on chain activity, token balances, NFT holdings, and ecosystem participation across multiple networks.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <Zap className="h-6 w-6" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Real-time Updates</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Get the latest data with real-time updates from multiple blockchain networks and platforms.
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-10 -mx-4 relative lg:mt-0" aria-hidden="true">
              <div className="relative rounded-lg shadow-lg overflow-hidden">
                <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 h-96 flex items-center justify-center p-6">
                  <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Wallet className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">WalletsX Analytics</dt>
                            <dd>
                              <div className="text-lg font-medium text-gray-900">Multi-Chain Dashboard</div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                      <div className="mt-5">
                        <div className="rounded-md bg-blue-50 px-4 py-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <Shield className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="ml-3 flex-1">
                              <h3 className="text-sm font-medium text-blue-800">Mitosis Network</h3>
                              <div className="mt-2 text-sm text-blue-700">
                                <p>12,345 MITO</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-5">
                        <div className="bg-gray-50 px-4 py-4 sm:px-6 rounded-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <BarChart2 className="h-5 w-5 text-gray-400" />
                              <span className="ml-2 text-sm text-gray-500">Monad Testnet</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">5 txns</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center">
                              <BarChart2 className="h-5 w-5 text-gray-400" />
                              <span className="ml-2 text-sm text-gray-500">Somnia Chain</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">Active</span>
                          </div>
                        </div>
                  </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold tracking-wide uppercase mb-3">
              Web3 Tools
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Everything you need for your crypto journey
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              Explore our suite of tools designed to help you navigate the crypto ecosystem with ease.
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Mitosis Analytics',
                  description: 'Comprehensive analytics for your Mitosis wallet across Game of Mito, Matrix, Expedition, and Morse NFTs.',
                  icon: Activity,
                  href: '/mitosis',
                  bgGradient: 'from-blue-500 to-indigo-600',
                  iconBg: 'bg-blue-400 bg-opacity-30',
                },
                {
                  name: 'Monad Testnet Stats',
                  description: 'Track your Monad testnet activity, contract interactions, and token holdings.',
                  icon: Zap,
                  href: '/monad-testnet',
                  bgGradient: 'from-purple-500 to-indigo-600',
                  iconBg: 'bg-purple-400 bg-opacity-30',
                },
                {
                  name: 'Somnia Chain Stats',
                  description: 'Monitor your Somnia Chain activity, token balances, and ecosystem participation.',
                  icon: Shield,
                  href: '/somnia',
                  bgGradient: 'from-teal-500 to-blue-600',
                  iconBg: 'bg-teal-400 bg-opacity-30',
                },
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.name} className="relative group">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 transform group-hover:scale-105 transition-all duration-300 shadow-lg opacity-0 group-hover:opacity-100"></div>
                    <div className="relative h-full flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-md group-hover:shadow-xl transition-all duration-300">
                      {/* Card header with gradient */}
                      <div className={`h-24 bg-gradient-to-r ${feature.bgGradient} flex items-center justify-between px-6`}>
                        <h3 className="text-xl font-bold text-white">
                            {feature.name}
                          </h3>
                        <div className={`${feature.iconBg} p-3 rounded-full`}>
                          <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                        </div>
                      </div>
                      
                      {/* Card body */}
                      <div className="flex-1 p-6">
                        <p className="text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                      
                      {/* Card footer */}
                      <div className="p-6 pt-0 border-t border-gray-100">
                        <Link
                          href={feature.href}
                          className={`inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r ${feature.bgGradient} text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 group`}
                        >
                          Learn more
                          <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
                      </div>
                    </div>
        </div>
                );
              })}
              </div>
            
            {/* View all tools button */}
            <div className="mt-12 text-center">
              <Link
                href="/web3-tools"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View all tools
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
              </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-xl overflow-hidden">
            <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
              <div className="lg:self-center lg:max-w-3xl">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  <span className="block">Ready to dive in?</span>
                  <span className="block">Start using our tools today.</span>
          </h2>
                <p className="mt-4 text-lg leading-6 text-blue-100">
                  Track your wallet statistics, check your rankings, and explore multi-chain analytics with our comprehensive tools.
          </p>
                <div className="mt-8 flex space-x-4">
                  <Link
                    href="/web3-tools"
                    className="inline-flex py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-blue-600 bg-white hover:bg-blue-50"
                  >
                    Get started
                  </Link>
          <Link
                    href="/about"
                    className="inline-flex py-3 px-6 border border-white border-opacity-25 rounded-md shadow-sm text-base font-medium text-white bg-blue-500 bg-opacity-20 hover:bg-opacity-30"
          >
                    Learn more
          </Link>
        </div>
          </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}