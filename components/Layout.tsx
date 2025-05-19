import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Twitter, BarChart2, Gift, Zap, Coins, ChevronDown, Home, Newspaper, Search, PenTool as Tool, ArrowRight, Globe2, Star, Activity, Shield, Mail, Trophy } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

// Define interfaces for navigation items
interface NavigationItem {
  name: string;
}

interface NavigationItemWithHref extends NavigationItem {
  href: string;
}

interface NavigationItemWithSubItems extends NavigationItem {
  items: NavigationItemWithHref[];
}

type NavigationItemType = NavigationItemWithHref | NavigationItemWithSubItems;

// Function to type check navigation items
function isItemWithSubItems(item: NavigationItemType): item is NavigationItemWithSubItems {
  return 'items' in item;
}

// Define interface for searchable content items
interface SearchableItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
  type: string;
}

export function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchableItem[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if current page is Monad testnet page
  const isMonadPage = location.pathname === '/monad-testnet';

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Command/Ctrl + K to open search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }
      // Escape to close search
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigation: NavigationItemType[] = [
    {
      name: 'Overview',
      items: [
        { name: 'Home', href: '/' },
        { name: 'Articles', href: '/articles' },
        { name: 'Web3 Tools', href: '/web3-tools' },
      ],
    },
    {
      name: 'Trending Tools',
      items: [
        { name: 'Monad Testnet', href: '/monad-testnet' },
        { name: 'Linea Stats', href: '/linea' },
        { name: 'Linea Bulk', href: '/linea/bulk' },
        { name: 'Soneium Stats', href: '/soneium' },
        { name: 'Soneium Badge Checker', href: '/soneium-badge-checker' },
        { name: 'Gitcoin Passport', href: '/gitcoin/bulk' },
      ],
    },
    {
      name: 'MegaETH Stats',
      href: '/megaeth',
    },
    {
      name: 'Mitosis Stats',
      href: '/mitosis',
    },
  ];

  // Footer navigation structure
  const footerNavigation = {
    tools: {
      title: 'Chain Tools',
      icon: <BarChart2 size={24} className="text-purple-600" />,
      links: [
        { name: 'Monad Testnet Stats', href: '/monad-testnet', icon: <Zap size={16} /> },
        { name: 'Linea Chain Stats', href: '/linea', icon: <BarChart2 size={16} /> },
        { name: 'Soneium Chain Stats', href: '/soneium', icon: <Coins size={16} /> },
        { name: 'Mitosis Rank Checker', href: '/mitosis', icon: <Trophy size={16} /> },
        { name: 'Linea Bulk Checker', href: '/linea/bulk', icon: <BarChart2 size={16} /> },
      ]
    },
    services: {
      title: 'Services',
      icon: <Tool size={24} className="text-blue-600" />,
      links: [
        { name: 'Soneium Badge Checker', href: '/soneium-badge-checker', icon: <Shield size={16} /> },
        { name: 'Gitcoin Passport Checker', href: '/gitcoin/bulk', icon: <BarChart2 size={16} /> },
        { name: 'Native Balance Checker', href: '/balance-checker', icon: <Coins size={16} /> },
      ]
    },
    articles: {
      title: 'Articles',
      icon: <Newspaper size={24} className="text-green-600" />,
      links: []
    },
    company: {
      title: 'Company',
      icon: <Globe2 size={24} className="text-indigo-600" />,
      links: [
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
        { name: 'Privacy', href: '/privacy' },
      ]
    },
    social: [
      {
        name: 'Twitter',
        href: 'https://x.com/CWalletsx',
        icon: <Twitter size={24} />,
        color: 'bg-blue-400 hover:bg-blue-500'
      },
      {
        name: 'Telegram',
        href: 'https://t.me/cwxstats',
        icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-16.5 7.5c-.924.428-1.458 1.33-1.458 2.29s.534 1.862 1.458 2.29l16.5 7.5c.71.325 1.523.32 2.227-.012.704-.333 1.147-1.01 1.147-1.763V4.207c0-.753-.443-1.43-1.146-1.763a2.242 2.242 0 0 0-1.206-.011z"></path><path d="m7.699 11.5 4.5 4.5 3.5-3.5"></path></svg>,
        color: 'bg-sky-400 hover:bg-sky-500'
      }
    ]
  };

  // All searchable content
  const searchableContent: SearchableItem[] = [
    ...footerNavigation.tools.links.map(item => ({ ...item, type: 'Tool' })),
    ...footerNavigation.services.links.map(item => ({ ...item, type: 'Service' })),
  ];
  
  // Articles are now handled separately due to being empty

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results = searchableContent.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.type.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col">
      <Helmet defaultTitle="WalletsX" titleTemplate="%s">
        <meta name="description" content="Track your wallet statistics across multiple blockchain networks" />
        <meta name="keywords" content="blockchain stats, wallet tracker, NFT holdings, token balance, crypto rankings" />
      </Helmet>

      {/* Enhanced Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Show on all screen sizes */}
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-xl px-4 py-2 rounded-lg">
                WalletsX
              </div>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                isItemWithSubItems(item) ? (
                  <div key={item.name} className="relative group px-2">
                    <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors rounded-lg group-hover:bg-gray-50">
                      {item.name}
                      <ChevronDown className="inline-block ml-1 h-4 w-4" />
                    </button>
                    <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-100">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          className={`block px-4 py-2 text-sm ${
                            location.pathname === subItem.href
                              ? 'bg-purple-50 text-purple-700'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      location.pathname === item.href
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </div>

            {/* Search Button (Desktop and Tablet) */}
            <div className="hidden sm:flex flex-1 justify-center max-w-2xl mx-4">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-full max-w-xl flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-500 rounded-lg border border-gray-200 shadow-sm transition-colors"
              >
                <Search size={16} />
                <span className="text-sm">Search tools and articles...</span>
                <span className="hidden md:flex items-center text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 ml-2">⌘K</span>
              </button>
            </div>

            {/* Social Links (Desktop) */}
            <div className="hidden lg:flex items-center space-x-2">
              {footerNavigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 text-white rounded-full transition-all hover:scale-110 ${item.color}`}
                >
                  {item.icon}
                  <span className="sr-only">{item.name}</span>
                </a>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-gray-50 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <div className="container mx-auto px-4 py-4">
              {/* Navigation Links */}
              <div className="space-y-6">
                {navigation.map((section) => {
                  if (isItemWithSubItems(section)) {
                    return (
                      <div key={section.name}>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                          {section.name}
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {section.items.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={() => setIsMenuOpen(false)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                                location.pathname === item.href
                                  ? 'bg-purple-50 text-purple-700'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'
                              }`}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null; // Handle NavigationItemWithHref if needed
                })}
              </div>

              {/* Social Links */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                  Follow Us
                </h3>
                <div className="flex space-x-4">
                  {footerNavigation.social.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 text-white rounded-full transition-all hover:scale-110 ${item.color}`}
                    >
                      {item.icon}
                      <span className="sr-only">{item.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Google AdSense Advertisement */}
      <div className="w-full bg-white py-2">
        <div className="container mx-auto">
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8421191784631095"
            crossOrigin="anonymous"></script>
          {/* added after somnia */}
          <ins className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-8421191784631095"
            data-ad-slot="7495595026"
            data-ad-format="auto"
            data-full-width-responsive="true"></ins>
          <script>
            {`(adsbygoogle = window.adsbygoogle || []).push({});`}
          </script>
        </div>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" />
            
            <div 
              ref={searchRef}
              className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
            >
              <div className="relative">
                <div className="flex items-center px-4 py-3 border-b border-gray-200">
                  <Search className="text-gray-400 mr-3" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search tools, articles, and pages..."
                    className="flex-1 text-base text-gray-900 placeholder-gray-400 outline-none"
                    autoFocus
                  />
                  <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-mono font-semibold text-gray-500 border border-gray-200 rounded">
                    ESC
                  </kbd>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((result, index) => (
                        <button
                          key={index}
                          className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-purple-50 transition-colors"
                          onClick={() => {
                            navigate(result.href);
                            setIsSearchOpen(false);
                          }}
                        >
                          {result.icon}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{result.name}</p>
                            <p className="text-xs text-gray-500">{result.type}</p>
                          </div>
                          <ArrowRight size={16} className="text-gray-400" />
                        </button>
                      ))}
                    </div>
                  ) : searchQuery ? (
                    <div className="p-4 text-center text-gray-500">
                      No results found for "{searchQuery}"
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      Type to start searching...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
        <Outlet />
      </main>

      {/* Beautiful Enhanced Footer */}
      <footer className="bg-gradient-to-r from-purple-50 via-white to-blue-50 border-t border-purple-100 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand and Social - Boxed */}
            <div className="bg-white rounded-xl shadow-lg p-6 transform transition-transform hover:scale-[1.02] border border-purple-100">
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-2xl px-5 py-3 rounded-lg shadow-md">
                    WalletsX
                  </div>
                </div>
                <p className="text-base text-gray-600 max-w-xs leading-relaxed font-medium">
                  Track your wallet statistics, analyze holdings, and discover insights across multiple blockchain networks.
                </p>
                <div className="flex space-x-4 pt-2">
                  {footerNavigation.social.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3.5 text-white rounded-full shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg ${item.color}`}
                      aria-label={item.name}
                    >
                      {item.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Tools Column - Boxed */}
            <div className="bg-white rounded-xl shadow-lg p-6 transform transition-transform hover:scale-[1.02] border border-purple-100">
              <h3 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 uppercase tracking-wider mb-6">
                Popular Tools
              </h3>
              <ul className="space-y-5">
                <li>
                  <Link to="/monad-testnet" className="group flex items-center text-gray-700 hover:text-purple-600 text-[15px] font-medium transition-colors">
                    <div className="bg-purple-100 p-2 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors">
                      <Zap size={18} className="text-purple-600" />
                    </div>
                    Monad Testnet Stats
                  </Link>
                </li>
                <li>
                  <Link to="/linea" className="group flex items-center text-gray-700 hover:text-purple-600 text-[15px] font-medium transition-colors">
                    <div className="bg-purple-100 p-2 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors">
                      <Activity size={18} className="text-purple-600" />
                    </div>
                    Linea Chain Stats
                  </Link>
                </li>
                <li>
                  <Link to="/soneium-badge-checker" className="group flex items-center text-gray-700 hover:text-purple-600 text-[15px] font-medium transition-colors">
                    <div className="bg-purple-100 p-2 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors">
                      <Shield size={18} className="text-purple-600" />
                    </div>
                    Soneium Badge Checker
                  </Link>
                </li>
                <li>
                  <Link to="/gitcoin/bulk" className="group flex items-center text-gray-700 hover:text-purple-600 text-[15px] font-medium transition-colors">
                    <div className="bg-purple-100 p-2 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors">
                      <Shield size={18} className="text-purple-600" />
                    </div>
                    Gitcoin Passport Checker
                  </Link>
                </li>
              </ul>
            </div>

            {/* Blockchains Column - Boxed */}
            <div className="bg-white rounded-xl shadow-lg p-6 transform transition-transform hover:scale-[1.02] border border-purple-100">
              <h3 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 uppercase tracking-wider mb-6">
                Blockchains
              </h3>
              <ul className="space-y-5">
                <li>
                  <Link to="/monad-testnet" className="group flex items-center text-gray-700 hover:text-purple-600 text-[15px] font-medium transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors">
                      <span className="text-sm font-bold text-purple-600">M</span>
                    </div>
                    Monad
                  </Link>
                </li>
                <li>
                  <Link to="/linea" className="group flex items-center text-gray-700 hover:text-purple-600 text-[15px] font-medium transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center mr-4">
                      <span className="text-sm font-bold text-white">L</span>
                    </div>
                    Linea
                  </Link>
                </li>
              </ul>
            </div>

            {/* Pages Column - Boxed */}
            <div className="bg-white rounded-xl shadow-lg p-6 transform transition-transform hover:scale-[1.02] border border-purple-100">
              <h3 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 uppercase tracking-wider mb-6">
                Pages
              </h3>
              <ul className="space-y-5">
                <li>
                  <Link to="/privacy" className="group flex items-center text-gray-700 hover:text-purple-600 text-[15px] font-medium transition-colors">
                    <div className="bg-purple-100 p-2 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors">
                      <Home size={18} className="text-purple-600" />
                    </div>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/web3-tools" className="group flex items-center text-gray-700 hover:text-purple-600 text-[15px] font-medium transition-colors">
                    <div className="bg-purple-100 p-2 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors">
                      <Tool size={18} className="text-purple-600" />
                    </div>
                    All Tools
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="group flex items-center text-gray-700 hover:text-purple-600 text-[15px] font-medium transition-colors">
                    <div className="bg-purple-100 p-2 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors">
                      <Globe2 size={18} className="text-purple-600" />
                    </div>
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="group flex items-center text-gray-700 hover:text-purple-600 text-[15px] font-medium transition-colors">
                    <div className="bg-purple-100 p-2 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors">
                      <Mail size={18} className="text-purple-600" />
                    </div>
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider with enhanced design */}
          <div className="relative mt-16 mb-10">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-purple-100"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-2 shadow-lg">
                <div className="w-8 h-8 flex items-center justify-center">
                  <Star size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Copyright - Boxed */}
          <div className="bg-white rounded-lg shadow-md p-4 border border-purple-50">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-base font-medium text-gray-700 mb-4 md:mb-0">
                © {new Date().getFullYear()} <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">WalletsX</span>. All rights reserved.
              </p>
              <div className="flex items-center">
                <p className="text-sm font-medium text-gray-600">
                  Created with <span className="text-red-500">♥</span> by <a href="https://x.com/CWalletsx" target="_blank" rel="noopener noreferrer" className="font-bold text-purple-600 hover:text-purple-700 transition-colors">Satwik Samanta</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}