'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Wallet, BarChart2, ClipboardList, Boxes, Gift, Zap, Coins, CheckCircle2, Trophy, FileBarChart2, Database, Shield, Sparkles, Layers, Star, Network, ArrowUpDown } from 'lucide-react';

interface Tool {
  title: string;
  description: string;
  link: string;
  icon: JSX.Element;
  tags: string[];
  chain: string;
  featured?: boolean;
  bgGradient?: string;
  iconBg?: string;
}

export default function Web3Tools() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'categories'>('grid');

  const tools: Tool[] = [
    {
      title: 'Monad Testnet Stats',
      description: 'Track your Monad testnet activity, points, and wallet analytics.',
      link: '/monad-testnet',
      icon: <Zap className="h-6 w-6 text-white" />,
      tags: ['wallet', 'stats', 'analytics', 'monad', 'points'],
      chain: 'Monad',
      featured: true,
      bgGradient: 'from-purple-500 to-indigo-600',
      iconBg: 'bg-purple-400 bg-opacity-30'
    },
    {
      title: 'Sahara AI Stats Checker',
      description: 'Check your wallet activity, score, and stats on the Sahara AI Testnet.',
      link: '/sahara-ai-stats-checker',
      icon: <BarChart2 className="h-6 w-6 text-white" />,
      tags: ['wallet', 'stats', 'analytics', 'sahara ai', 'testnet', 'score'],
      chain: 'Sahara AI',
      featured: false,
      bgGradient: 'from-green-500 to-green-700',
      iconBg: 'bg-green-400 bg-opacity-30'
    },
    {
      title: 'Relay Stats Checker',
      description: 'Check your Relay bridge activity including transactions, volume, and chain usage.',
      link: '/relay-stats-checker',
      icon: <ArrowUpDown className="h-6 w-6 text-white" />,
      tags: ['wallet', 'stats', 'analytics', 'relay', 'bridge', 'cross-chain'],
      chain: 'Relay',
      featured: true,
      bgGradient: 'from-blue-500 to-purple-600',
      iconBg: 'bg-blue-400 bg-opacity-30'
    },



    {
      title: 'Pharos testnet Stats Checker',
      description: 'Check your wallet activity, score, and stats on the Pharos Testnet.',
      link: '/pharos-stats-checker',
      icon: <BarChart2 className="h-6 w-6 text-white" />,
      tags: ['wallet', 'stats', 'analytics', 'pharos', 'testnet', 'score'],
      chain: 'Pharos testnet',
      featured: false,
      bgGradient: 'from-violet-500 to-orange-900',
      iconBg: 'bg-blue-400 bg-opacity-30'
    },



    {
      title: 'MegaETH Stats Checker',
      description: 'Analyze your Ethereum wallet activity, transaction history, and on-chain performance.',
      link: '/megaeth',
      icon: <BarChart2 className="h-6 w-6 text-white" />,
      tags: ['wallet', 'stats', 'analytics', 'ethereum', 'eth', 'score'],
      chain: 'MegaETH',
      bgGradient: 'from-blue-500 to-blue-700',
      iconBg: 'bg-blue-400 bg-opacity-30'
    },
    {
      title: 'Somnia Stats Checker',
      description: 'Analyze your Somnia wallet activity, transaction history, and calculate your wallet score.',
      link: '/somnia',
      icon: <BarChart2 className="h-6 w-6 text-white" />,
      tags: ['wallet', 'stats', 'analytics', 'somnia', 'dream', 'score'],
      chain: 'Somnia',
      bgGradient: 'from-pink-500 to-purple-600',
      iconBg: 'bg-pink-400 bg-opacity-30'
    },
    {
      title: 'Linea Chain Stats',
      description: 'Track your Linea Chain activity, LXP points, and wallet analytics.',
      link: '/linea',
      icon: <BarChart2 className="h-6 w-6 text-white" />,
      tags: ['wallet', 'stats', 'analytics', 'linea', 'lxp'],
      chain: 'Linea',
      bgGradient: 'from-gray-700 to-gray-900',
      iconBg: 'bg-gray-600 bg-opacity-30'
    },
    {
      title: 'Linea Bulk Checker',
      description: 'Check multiple Linea wallets at once with detailed analytics.',
      link: '/linea/bulk',
      icon: <ClipboardList className="h-6 w-6 text-white" />,
      tags: ['bulk', 'wallet', 'analytics', 'linea', 'lxp'],
      chain: 'Linea',
      bgGradient: 'from-gray-700 to-gray-900',
      iconBg: 'bg-gray-600 bg-opacity-30'
    },
    {
      title: 'Soneium Chain Stats',
      description: 'Track your Soneium Chain wallet activity, contract interactions, and token holdings.',
      link: '/soneium',
      icon: <Coins className="h-6 w-6 text-white" />,
      tags: ['wallet', 'stats', 'analytics', 'soneium', 'eth'],
      chain: 'Soneium',
      bgGradient: 'from-teal-500 to-blue-600',
      iconBg: 'bg-teal-400 bg-opacity-30'
    },
    {
      title: 'Soneium Badge Checker',
      description: 'Check which Soneium ecosystem badges you own with this simple tool.',
      link: '/soneium-badge-checker',
      icon: <Shield className="h-6 w-6 text-white" />,
      tags: ['badge', 'nft', 'soneium', 'ownership'],
      chain: 'Soneium',
      bgGradient: 'from-teal-500 to-blue-600',
      iconBg: 'bg-teal-400 bg-opacity-30'
    },
    {
      title: 'Ink Stats',
      description: 'Track your Ink Protocol activity, points, and wallet analytics.',
      link: '/ink',
      icon: <FileBarChart2 className="h-6 w-6 text-white" />,
      tags: ['wallet', 'stats', 'analytics', 'ink', 'points'],
      chain: 'Ink',
      bgGradient: 'from-indigo-500 to-blue-600',
      iconBg: 'bg-indigo-400 bg-opacity-30'
    },
    {
      title: 'Gitcoin Bulk Checker',
      description: 'Check Gitcoin Passport stats for multiple wallets at once.',
      link: '/gitcoin/bulk',
      icon: <Database className="h-6 w-6 text-white" />,
      tags: ['bulk', 'wallet', 'gitcoin', 'passport', 'stamps'],
      chain: 'Multi-chain',
      bgGradient: 'from-green-500 to-teal-600',
      iconBg: 'bg-green-400 bg-opacity-30'
    },
    {
      title: 'Galxe Airdrop Tracker',
      description: 'Track your potential airdrops and rewards from Galxe campaigns.',
      link: '/galxe-airdrops',
      icon: <Gift className="h-6 w-6 text-white" />,
      tags: ['airdrops', 'rewards', 'galxe', 'campaigns'],
      chain: 'Multi-chain',
      featured: true,
      bgGradient: 'from-purple-500 to-pink-600',
      iconBg: 'bg-purple-400 bg-opacity-30'
    },
    {
      title: 'Native Balance Checker',
      description: 'Check native token balances across multiple networks and addresses simultaneously.',
      link: '/balance-checker',
      icon: <Wallet className="h-6 w-6 text-white" />,
      tags: ['balance', 'multi-chain', 'bulk', 'native tokens'],
      chain: 'Multi-chain',
      featured: true,
      bgGradient: 'from-green-500 to-emerald-600',
      iconBg: 'bg-green-400 bg-opacity-30'
    },
    {
      title: 'LayerZero Stats Checker',
      description: 'Track your LayerZero transaction history, volume, and chain interactions for airdrop eligibility.',
      link: '/layerzero-stats',
      icon: <Zap className="h-6 w-6 text-white" />,
      tags: ['wallet', 'stats', 'analytics', 'layerzero', 'omnichain', 'airdrop'],
      chain: 'LayerZero',
      featured: true,
      bgGradient: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-blue-400 bg-opacity-30'
    },
    {
      title: 'Kaito Yaps Checker',
      description: 'Check your Kaito Yaps stats and wallet activity.',
      link: '/kaito-yaps',
      icon: <CheckCircle2 className="h-6 w-6 text-white" />,
      tags: ['wallet', 'stats', 'analytics', 'kaito', 'yaps'],
      chain: 'Kaito',
      bgGradient: 'from-blue-500 to-cyan-600',
      iconBg: 'bg-blue-400 bg-opacity-30'
    },
    {
      title: 'Game Of Mito Rank checker',
      description: 'Comprehensive analytics for your Mitosis wallet across Game of Mito, Matrix, Expedition, and Morse NFTs. Track your portfolio value and rankings.',
      link: '/game-of-mito',
      icon: <Database className="h-6 w-6 text-white" />,
      tags: ['wallet', 'stats', 'analytics', 'mitosis', 'matrix', 'expedition', 'morse', 'nft', 'portfolio'],
      chain: 'Mitosis',
      featured: true,
      bgGradient: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-blue-400 bg-opacity-30'
    },
    {
      title: 'Game of Mito Bulk Checker',
      description: 'Check your rank and stats on the Mitosis chain including MITO and wMITO balances, position among all holders, and ecosystem participation.',
      link: '/game-of-mito/bulk',
      icon: <ClipboardList className="h-6 w-6 text-white" />,
      tags: ['bulk', 'wallet', 'rank', 'mitosis', 'portfolio', 'multiple'],
      chain: 'Mitosis',
      bgGradient: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-blue-400 bg-opacity-30'
    },
    {
      title: 'Mitosis Overall stats checker',
      description: 'Comprehensive analytics for your Mitosis wallet across Game of Mito, Matrix, Expedition, and Morse NFTs. Track your portfolio value and rankings.',
      link: '/mitosis',
      icon: <Trophy className="h-6 w-6 text-white" />,
      tags: ['wallet', 'rank', 'stats', 'mitosis', 'token', 'leaderboard'],
      chain: 'Mitosis',
      bgGradient: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-blue-400 bg-opacity-30'
    }
  ];

  const chains = Array.from(new Set(tools.map(tool => tool.chain)));

  const filteredTools = tools.filter(tool => {
    const searchTerms = searchQuery.toLowerCase().split(' ');
    const searchableText = `${tool.title} ${tool.description} ${tool.tags.join(' ')} ${tool.chain}`.toLowerCase();
    
    const matchesSearch = searchTerms.every(term => searchableText.includes(term));
    const matchesChain = selectedChain === null || tool.chain === selectedChain;
    
    return matchesSearch && matchesChain;
  });

  // Group tools by chain for category view
  const toolsByChain = chains.reduce((acc, chain) => {
    acc[chain] = filteredTools.filter(tool => tool.chain === chain);
    return acc;
  }, {} as Record<string, Tool[]>);

  // Get featured tools
  const featuredTools = filteredTools.filter(tool => tool.featured);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl shadow-xl mb-12">
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 0 10 L 40 10 M 10 0 L 10 40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          <div className="relative py-16 px-8 sm:py-24 sm:px-16 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Web3 Tools</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
              Explore our comprehensive suite of tools for analyzing blockchain wallets and tracking statistics across multiple chains.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => setViewMode('categories')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  viewMode === 'categories' 
                    ? 'bg-white text-purple-600 shadow-md' 
                    : 'bg-purple-700/30 text-white hover:bg-purple-700/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers size={20} />
                  <span>Categories View</span>
                </div>
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white text-purple-600 shadow-md' 
                    : 'bg-purple-700/30 text-white hover:bg-purple-700/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Boxes size={20} />
                  <span>Grid View</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="max-w-4xl mx-auto mb-12 bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools by name, chain, or features..."
                className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={() => setSelectedChain(null)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedChain === null
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Chains
              </button>
              
              {chains.map(chain => (
                <button
                  key={chain}
                  onClick={() => setSelectedChain(chain === selectedChain ? null : chain)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedChain === chain
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {chain}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* No Results */}
        {filteredTools.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-100">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No tools found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search terms or filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedChain(null);
              }}
              className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              Clear filters <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        )}

        {/* Tools Display - Grid View */}
        {viewMode === 'grid' && filteredTools.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTools.map((tool, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 transform group-hover:scale-105 transition-all duration-300 shadow-lg opacity-0 group-hover:opacity-100"></div>
                <div className="relative h-full flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-md group-hover:shadow-xl transition-all duration-300">
                  {/* Card header with gradient */}
                  <div className={`h-24 bg-gradient-to-r ${tool.bgGradient || 'from-blue-500 to-indigo-600'} flex items-center justify-between px-6`}>
                    <h3 className="text-xl font-bold text-white">
                      {tool.title}
                    </h3>
                    <div className={`${tool.iconBg || 'bg-blue-400 bg-opacity-30'} p-3 rounded-full`}>
                      {tool.icon}
                    </div>
                  </div>
                  
                  {/* Card body */}
                  <div className="flex-1 p-6">
                    <p className="text-gray-600">
                      {tool.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                        {tool.chain}
                      </span>
                    </div>
                  </div>
                  
                  {/* Card footer */}
                  <div className="p-6 pt-0 border-t border-gray-100">
                    <Link
                      href={tool.link}
                      className={`inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r ${tool.bgGradient || 'from-blue-500 to-indigo-600'} text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 group`}
                    >
                      Explore Tool
                      <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tools Display - Categories View */}
        {viewMode === 'categories' && filteredTools.length > 0 && (
          <div className="space-y-16">
            {Object.entries(toolsByChain).map(([chain, chainTools]) => 
              chainTools.length > 0 ? (
                <div key={chain}>
                  <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-2">
                    <Network className="h-6 w-6 text-purple-600" />
                    <h2 className="text-2xl font-bold text-gray-900">{chain}</h2>
                    <span className="bg-purple-100 text-purple-700 text-sm px-2 py-0.5 rounded-md">
                      {chainTools.length} tool{chainTools.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {chainTools.map((tool, index) => (
                      <div key={`${chain}-${index}`} className="relative group">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 transform group-hover:scale-105 transition-all duration-300 shadow-lg opacity-0 group-hover:opacity-100"></div>
                        <div className="relative h-full flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-md group-hover:shadow-xl transition-all duration-300">
                          {/* Card header with gradient */}
                          <div className={`h-24 bg-gradient-to-r ${tool.bgGradient || 'from-blue-500 to-indigo-600'} flex items-center justify-between px-6`}>
                            <h3 className="text-xl font-bold text-white">
                              {tool.title}
                            </h3>
                            <div className={`${tool.iconBg || 'bg-blue-400 bg-opacity-30'} p-3 rounded-full`}>
                              {tool.icon}
                            </div>
                          </div>
                          
                          {/* Card body */}
                          <div className="flex-1 p-6">
                            <p className="text-gray-600">
                              {tool.description}
                            </p>
                          </div>
                          
                          {/* Card footer */}
                          <div className="p-6 pt-0 border-t border-gray-100">
                            <Link
                              href={tool.link}
                              className={`inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r ${tool.bgGradient || 'from-blue-500 to-indigo-600'} text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 group`}
                            >
                              Explore Tool
                              <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </>
  );
}