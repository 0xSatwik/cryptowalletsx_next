'use client';

import React, { useState } from 'react';
import { Search, Loader2, Twitter, ChevronDown, ChevronUp, AlertCircle, Users, Download, BarChart2, Clock, TrendingUp, History, Activity, Share2, ExternalLink, Info, XCircle } from 'lucide-react';

interface YapsData {
  user_id: string;
  username: string;
  yaps_all: number;
  yaps_l24h: number;
  yaps_l48h: number;
  yaps_l7d: number;
  yaps_l30d: number;
  yaps_l3m: number;
  yaps_l6m: number;
  yaps_l12m: number;
  error?: string;
}

interface SummaryStats {
  totalUsers: number;
  totalYaps: number;
  averageYaps: number;
  activeUsers24h: number;
  activeUsers7d: number;
  topUser: {
    username: string;
    yaps: number;
  };
}

interface ErrorMessage {
  type: 'error' | 'warning' | 'info';
  message: string;
}

export default function KaitoYapsChecker() {
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<YapsData[]>([]);
  const [currentUsername, setCurrentUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState<ErrorMessage | null>(null);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<'single' | 'bulk'>('single');

  const toggleUserExpand = (username: string) => {
    setExpandedUsers(prev => ({
      ...prev,
      [username]: !prev[username]
    }));
  };

  const calculateSummaryStats = (results: YapsData[]): SummaryStats => {
    const validResults = results.filter(r => !r.error);
    const totalYaps = validResults.reduce((sum, r) => sum + r.yaps_all, 0);
    const activeUsers24h = validResults.filter(r => r.yaps_l24h > 0).length;
    const activeUsers7d = validResults.filter(r => r.yaps_l7d > 0).length;
    const topUser = validResults.reduce((max, curr) => 
      curr.yaps_all > (max?.yaps || 0) ? { username: curr.username, yaps: curr.yaps_all } : max,
      { username: '', yaps: 0 }
    );

    return {
      totalUsers: validResults.length,
      totalYaps,
      averageYaps: validResults.length > 0 ? totalYaps / validResults.length : 0,
      activeUsers24h,
      activeUsers7d,
      topUser
    };
  };

  // Cleanly extract username from different formats
  const extractUsername = (input: string): string => {
    // Remove whitespace
    const trimmed = input.trim();
    
    // Handle Twitter URLs
    if (trimmed.includes('twitter.com/') || trimmed.includes('x.com/')) {
      const urlParts = trimmed.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      
      // Handle any query parameters or hashes
      return lastPart.split('?')[0].split('#')[0];
    }
    
    // Handle @username format
    if (trimmed.startsWith('@')) {
      return trimmed.substring(1);
    }
    
    // Return as is if it's just the username
    return trimmed;
  };

  const fetchYapsData = async (usernameInput: string): Promise<YapsData> => {
    try {
      const username = extractUsername(usernameInput);
      
      if (!username) {
        throw new Error('Username is empty after processing');
      }
      
      // Use our Netlify function proxy instead of direct API call
      const response = await fetch(`/api/kaito/${username}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching YAPS data:', error);
      let errorMessage = 'Failed to fetch YAPS data';
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          errorMessage = 'Twitter username not found';
        } else if (error.message.includes('429')) {
          errorMessage = 'Rate limit exceeded. Please try again later.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. The Twitter API might be down.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        user_id: '',
        username: usernameInput,
        yaps_all: 0,
        yaps_l24h: 0,
        yaps_l48h: 0,
        yaps_l7d: 0,
        yaps_l30d: 0,
        yaps_l3m: 0,
        yaps_l6m: 0,
        yaps_l12m: 0,
        error: errorMessage
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || loading) return;

    setLoading(true);
    setResults([]);
    setErrorMsg(null);
    setSummaryStats(null);
    setExpandedUsers({});

    // Handle different input formats
    const usernameList = mode === 'bulk' 
      ? userInput.split('\n')
        .map(u => u.trim())
        .filter(u => u.length > 0)
      : [userInput.trim()];

    if (usernameList.length === 0) {
      setErrorMsg({
        type: 'error',
        message: 'Please enter at least one valid Twitter username'
      });
      setLoading(false);
      return;
    }

    if (usernameList.length > 50) {
      setErrorMsg({
        type: 'warning',
        message: 'Maximum 50 usernames allowed at once. Only the first 50 will be processed.'
      });
      usernameList.splice(50);
    }

    const newResults: YapsData[] = [];

    for (const usernameInput of usernameList) {
      const username = extractUsername(usernameInput);
      setCurrentUsername(username);
      
      try {
        const data = await fetchYapsData(usernameInput);
        newResults.push(data);
        setResults([...newResults]);
      } catch (error) {
        console.error(`Error processing username ${username}:`, error);
        newResults.push({
          user_id: '',
          username,
          yaps_all: 0,
          yaps_l24h: 0,
          yaps_l48h: 0,
          yaps_l7d: 0,
          yaps_l30d: 0,
          yaps_l3m: 0,
          yaps_l6m: 0,
          yaps_l12m: 0,
          error: error instanceof Error ? error.message : 'Failed to fetch data'
        });
        setResults([...newResults]);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (mode === 'bulk') {
      const stats = calculateSummaryStats(newResults);
      setSummaryStats(stats);
    }

    setLoading(false);
    setCurrentUsername('');
  };

  const downloadResults = () => {
    const csv = [
      ['Username', 'Total YAPS', '24h', '48h', '7d', '30d', '3m', '6m', '12m', 'Error'].join(','),
      ...results.map(result => [
        result.username,
        result.yaps_all,
        result.yaps_l24h,
        result.yaps_l48h,
        result.yaps_l7d,
        result.yaps_l30d,
        result.yaps_l3m,
        result.yaps_l6m,
        result.yaps_l12m,
        result.error || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'kaito-yaps-data.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getShareUrl = (result: YapsData) => {
    const text = `🚀 My @KaitoAi YAPS stats:\n\n` +
      `✨ Total YAPS: ${result.yaps_all.toFixed(2)}\n` +
      `📅 Last 24h: ${result.yaps_l24h.toFixed(2)}\n` +
      `📆 Last 7d: ${result.yaps_l7d.toFixed(2)}\n` +
      `📈 Last 30d: ${result.yaps_l30d.toFixed(2)}\n\n` +
      `Check yours at cryptowalletsx.com/kaito-yaps\n\n` +
      `#Kaito #YAPS #TwitterEngagement`;
    
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  };

  return (
    <>
      <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Twitter className="text-white" size={32} />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Kaito YAPS Checker</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Track Twitter engagement metrics with Kaito's YAPS scoring system. Find out how active users are across different timeframes.
            </p>
            <div className="mt-3 flex items-center justify-center gap-1 text-sm text-gray-500">
              <Info size={14} />
              <span>Supports Twitter handles, @usernames, and Twitter profile URLs</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-10 border border-gray-100">
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setMode('single')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  mode === 'single'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Single Username
              </button>
              <button
                onClick={() => setMode('bulk')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  mode === 'bulk'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Bulk Check
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'single' ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Twitter className="text-blue-500" size={20} />
                  </div>
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Enter Twitter username, @handle, or profile URL"
                    className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-300 focus:ring-3 focus:ring-blue-100 focus:border-blue-500 outline-none text-lg transition-all shadow-sm"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Twitter usernames (one per line)
                  </label>
                  <textarea
                    rows={6}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="username1&#10;@username2&#10;https://twitter.com/username3"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-3 focus:ring-blue-100 focus:border-blue-500 outline-none shadow-sm"
                  />
                  <div className="mt-2 text-xs text-gray-500">
                    Supports Twitter handles, @usernames, and Twitter profile URLs
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !userInput.trim()}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md transition-all transform hover:translate-y-[-1px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={22} />
                    {currentUsername ? (
                      <span>Checking @{currentUsername}...</span>
                    ) : (
                      'Processing...'
                    )}
                  </>
                ) : (
                  <>
                    <Search size={22} />
                    Check YAPS Score
                  </>
                )}
              </button>
            </form>
          </div>

          {errorMsg && (
            <div className={`mb-8 p-5 rounded-xl flex items-start gap-4 shadow-md ${
              errorMsg.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 
              errorMsg.type === 'warning' ? 'bg-yellow-50 border border-yellow-200 text-yellow-700' : 
              'bg-blue-50 border border-blue-200 text-blue-700'
            }`}>
              {errorMsg.type === 'error' ? <XCircle size={24} /> : 
               errorMsg.type === 'warning' ? <AlertCircle size={24} /> : 
               <Info size={24} />}
              <div>
                <p className="font-medium">{
                  errorMsg.type === 'error' ? 'Error' : 
                  errorMsg.type === 'warning' ? 'Warning' : 
                  'Information'
                }</p>
                <p>{errorMsg.message}</p>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-8">
              {/* Summary Stats for Bulk Mode */}
              {mode === 'bulk' && summaryStats && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <BarChart2 className="text-white" size={20} />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Summary Statistics</h2>
                    </div>
                    <button
                      onClick={downloadResults}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors shadow-sm"
                    >
                      <Download size={18} />
                      Export CSV
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 shadow-sm border border-blue-100">
                      <div className="flex items-center gap-3">
                        <Users className="text-blue-600" size={24} />
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Total Users</p>
                          <p className="text-2xl font-bold text-gray-900">{summaryStats.totalUsers}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 shadow-sm border border-purple-100">
                      <div className="flex items-center gap-3">
                        <Activity className="text-purple-600" size={24} />
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Total YAPS</p>
                          <p className="text-2xl font-bold text-gray-900">{summaryStats.totalYaps.toFixed(2)}</p>
                          <p className="text-sm text-purple-700 font-medium">
                            Avg: {summaryStats.averageYaps.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 shadow-sm border border-green-100">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="text-green-600" size={24} />
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Top User</p>
                          <p className="text-2xl font-bold text-gray-900">@{summaryStats.topUser.username}</p>
                          <p className="text-sm text-green-700 font-medium">
                            {summaryStats.topUser.yaps.toFixed(2)} YAPS
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 shadow-sm border border-yellow-100">
                      <div className="flex items-center gap-3">
                        <Clock className="text-yellow-600" size={24} />
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Active Users</p>
                          <div className="flex flex-col gap-1 mt-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Last 24h:</span>
                              <span className="font-bold">{summaryStats.activeUsers24h}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-yellow-400 h-2 rounded-full" 
                                style={{ width: `${(summaryStats.activeUsers24h / summaryStats.totalUsers) * 100}%` }}
                              ></div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm">Last 7d:</span>
                              <span className="font-bold">{summaryStats.activeUsers7d}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-yellow-400 h-2 rounded-full" 
                                style={{ width: `${(summaryStats.activeUsers7d / summaryStats.totalUsers) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Individual Results */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                  <h2 className="text-2xl font-bold text-gray-900">YAPS Results</h2>
                </div>

                <div className="divide-y divide-gray-200">
                  {results.map((result, index) => (
                    <div key={index} className={`p-6 ${result.error ? 'bg-red-50' : ''}`}>
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleUserExpand(result.username)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            result.error ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'
                          }`}>
                            {result.error ? <AlertCircle size={24} /> : <Twitter size={24} />}
                          </div>
                          <div>
                            <p className="font-bold text-lg text-gray-900">
                              @{result.username}
                            </p>
                            {!result.error ? (
                              <p className="text-blue-600 font-medium">
                                {result.yaps_all.toFixed(2)} YAPS
                              </p>
                            ) : (
                              <p className="text-red-600">{result.error}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {!result.error && (
                            <a
                              href={getShareUrl(result)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors"
                              title="Share on Twitter"
                            >
                              <Share2 size={20} />
                            </a>
                          )}
                          <button 
                            className={`p-2 rounded-full transition-colors ${
                              result.error ? 'text-red-500 hover:bg-red-100' : 'text-blue-500 hover:bg-blue-50'
                            }`}
                          >
                            {expandedUsers[result.username] ? (
                              <ChevronUp size={20} />
                            ) : (
                              <ChevronDown size={20} />
                            )}
                          </button>
                        </div>
                      </div>

                      {expandedUsers[result.username] && !result.error && (
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 shadow-sm border border-blue-100">
                            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                              <History size={16} />
                              Recent Activity
                            </h3>
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-gray-600">Last 24h</span>
                                  <span className="font-bold text-gray-900">{result.yaps_l24h.toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full" 
                                    style={{ width: `${Math.min(100, (result.yaps_l24h / result.yaps_all) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-gray-600">Last 48h</span>
                                  <span className="font-bold text-gray-900">{result.yaps_l48h.toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full" 
                                    style={{ width: `${Math.min(100, (result.yaps_l48h / result.yaps_all) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-gray-600">Last 7 days</span>
                                  <span className="font-bold text-gray-900">{result.yaps_l7d.toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full" 
                                    style={{ width: `${Math.min(100, (result.yaps_l7d / result.yaps_all) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 shadow-sm border border-purple-100">
                            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                              <Activity size={16} />
                              Historical Data
                            </h3>
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-gray-600">Last 30 days</span>
                                  <span className="font-bold text-gray-900">{result.yaps_l30d.toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-purple-500 h-2 rounded-full" 
                                    style={{ width: `${Math.min(100, (result.yaps_l30d / result.yaps_all) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-gray-600">Last 3 months</span>
                                  <span className="font-bold text-gray-900">{result.yaps_l3m.toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-purple-500 h-2 rounded-full" 
                                    style={{ width: `${Math.min(100, (result.yaps_l3m / result.yaps_all) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-gray-600">Last 6 months</span>
                                  <span className="font-bold text-gray-900">{result.yaps_l6m.toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-purple-500 h-2 rounded-full" 
                                    style={{ width: `${Math.min(100, (result.yaps_l6m / result.yaps_all) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-gray-600">Last 12 months</span>
                                  <span className="font-bold text-gray-900">{result.yaps_l12m.toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-purple-500 h-2 rounded-full" 
                                    style={{ width: `${Math.min(100, (result.yaps_l12m / result.yaps_all) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="sm:col-span-2 flex flex-wrap items-center gap-4 mt-2">
                            <a
                              href={`https://twitter.com/${result.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm"
                            >
                              <Twitter size={18} />
                              View Profile
                            </a>
                            
                            <a
                              href={`https://yaps.kaito.ai/referral/1394579477032693769`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors shadow-sm"
                            >
                              <ExternalLink size={18} />
                              Join Kiato
                            </a>

                            <a
                              href={getShareUrl(result)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-colors shadow-sm"
                            >
                              <Share2 size={18} />
                              Share Stats
                            </a>
                          </div>
                        </div>
                      )}

                      {expandedUsers[result.username] && result.error && (
                        <div className="mt-6 p-5 bg-red-100 rounded-xl text-red-700 border border-red-200">
                          <h3 className="font-medium mb-2 flex items-center gap-2">
                            <AlertCircle size={18} />
                            Error Details
                          </h3>
                          <p>{result.error}</p>
                          <div className="mt-4">
                            <p className="text-sm">Possible reasons:</p>
                            <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                              <li>Twitter username does not exist</li>
                              <li>The Kaito API service may be experiencing issues</li>
                              <li>The user may not have any YAPS associated with their account</li>
                              <li>Network connection issues</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}