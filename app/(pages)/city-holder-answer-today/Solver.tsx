'use client';

import { useState, useEffect, useCallback } from 'react';

interface SearchResult {
    day_number: number;
    date: string;
    question_number: number;
    question: string;
    answer: string;
    options: string[];
}

interface SearchResponse {
    query: string;
    total_results: number;
    questions: SearchResult[];
}

export default function Solver() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const search = useCallback(async (q: string) => {
        if (q.length < 2) {
            setResults([]);
            setSearched(false);
            return;
        }

        setLoading(true);
        setSearched(true);
        try {
            const res = await fetch(`https://city-holder-daily.sohamiyer7.workers.dev/api/search?q=${encodeURIComponent(q)}`);
            if (!res.ok) throw new Error('Search failed');
            const data: SearchResponse = await res.json();
            setResults(data.questions);
        } catch (err) {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            search(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, search]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <section className="max-w-4xl mx-auto px-4 pb-16">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 md:p-8">
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-2 flex items-center gap-3">
                        <span className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center text-lg">🔍</span>
                        City Holder Solver
                    </h2>
                    <p className="text-slate-400">Search any question to find the correct answer</p>
                </div>

                {/* Search Input */}
                <div className="p-6 border-b border-slate-100">
                    <div className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search for a question or answer..."
                            className="w-full py-4 px-5 pl-14 text-lg rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition-all"
                        />
                        <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {loading && (
                            <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Results */}
                <div className="p-6">
                    {!searched && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🎯</div>
                            <p className="text-slate-500 font-medium">Enter a search term to find answers</p>
                            <p className="text-slate-400 text-sm mt-1">Try searching &quot;Matrix&quot; or &quot;MTV&quot;</p>
                        </div>
                    )}

                    {searched && results.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">😕</div>
                            <p className="text-slate-600 font-medium">No results found for &quot;{query}&quot;</p>
                            <p className="text-slate-400 text-sm mt-1">Try a different search term</p>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="space-y-4">
                            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                {results.length} result{results.length !== 1 ? 's' : ''} found
                            </div>
                            {results.map((r, idx) => (
                                <div
                                    key={`${r.date}-${r.question_number}-${idx}`}
                                    className="bg-slate-50 rounded-xl p-5 hover:bg-slate-100 transition-colors"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                                            Day {r.day_number}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {formatDate(r.date)} • Q{r.question_number}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 mb-2">{r.question}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-emerald-600 uppercase">Answer:</span>
                                        <span className="font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">{r.answer}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
