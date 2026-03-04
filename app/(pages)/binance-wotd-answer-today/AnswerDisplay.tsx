'use client';

import { useState, useEffect } from 'react';
import { getBinanceDateInfo } from '@/app/utils/seo';

interface WodlEntry {
    publish_date: string;
    theme: string;
    word_length: number;
    words: string; // JSON string array
    correct_answers?: string; // JSON string array for highlighted words
}

export default function AnswerDisplay() {
    const [data, setData] = useState<WodlEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [revealed, setRevealed] = useState<{ [key: number]: boolean }>({});
    const [displayDate, setDisplayDate] = useState(() => getBinanceDateInfo().ordinalLongDate);



    useEffect(() => {
        fetch('https://wodl-scraper.moneydropcrypto.workers.dev/today')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch answers');
                return res.json();
            })
            .then((json) => {
                setData(json);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setDisplayDate(getBinanceDateInfo().ordinalLongDate);
        }, 60000);

        return () => window.clearInterval(intervalId);
    }, []);

    const toggleReveal = (len: number) => {
        setRevealed((prev) => ({ ...prev, [len]: !prev[len] }));
    };

    const themeName = data.length > 0 ? data[0].theme.replace(/<!--.*?-->/sg, '').trim() : 'Loading...';

    if (loading) {
        return (
            <div className="min-h-[40vh] bg-[#F8F9FA] text-[#0B0E11] flex items-center justify-center p-6">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-64 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || data.length === 0) {
        return (
            <div className="min-h-[40vh] bg-[#F8F9FA] text-[#0B0E11] flex items-center justify-center p-6 text-center">
                <div>
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Oops!</h2>
                    <p className="text-gray-600">{error || "No data available for today yet. Please check back later."}</p>
                </div>
            </div>
        );
    }

    return (
        <section className="bg-[#F8F9FA] text-[#0B0E11] font-sans selection:bg-[#FCD535] selection:text-black">
            <div className="max-w-4xl mx-auto px-4 py-10">
                {/* Header Section */}
                <header className="mb-10 rounded-3xl border border-[#E6E8EA] bg-white p-6 text-center shadow-sm md:p-8">
                    <div className="inline-flex px-4 py-1.5 rounded-full bg-[#FCD535]/10 border border-[#FCD535]/30 text-[#D49E00] text-xs font-bold mb-5 uppercase tracking-[0.2em]">
                        Live Binance WODL
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3 text-[#0B0E11]">
                        Active Theme: <span className="bg-gradient-to-r from-[#FCD535] to-[#F3BA2F] bg-clip-text text-transparent capitalize">{themeName}</span>
                    </h2>
                    <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto font-medium">
                        Answer set for {displayDate}. Choose the matching word length below and reveal only the puzzle you need.
                    </p>
                </header>

                {/* Answers Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {[3, 4, 5, 6, 7, 8].map((len) => {
                        const entry = data.find((d) => d.word_length === len);
                        const words: string[] = entry ? JSON.parse(entry.words) : [];
                        const isRevealed = revealed[len];

                        return (
                            <div
                                key={len}
                                className="group relative bg-white border border-[#E6E8EA] p-6 rounded-2xl hover:border-[#FCD535] transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xl font-bold text-gray-800 group-hover:text-black transition-colors">
                                        {len} Letter Words
                                    </span>
                                    <div className="h-2 w-12 rounded-full bg-[#FCD535]/20 group-hover:bg-[#FCD535] transition-all duration-300"></div>
                                </div>

                                <div className="relative min-h-[80px] flex items-center justify-center">
                                    {!isRevealed ? (
                                        <button
                                            onClick={() => toggleReveal(len)}
                                            className="z-10 bg-[#FCD535] text-[#0B0E11] font-bold py-3 px-8 rounded-xl hover:bg-[#F3BA2F] active:scale-95 transition-all duration-200 shadow-[0_4px_12px_rgba(252,213,53,0.4)]"
                                        >
                                            Reveal Answers
                                        </button>
                                    ) : (
                                        <div className="flex flex-col gap-3 w-full animate-reveal">
                                            {/* All Words */}
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {words.length > 0 ? (
                                                    words.map((word, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="bg-[#F8F9FA] text-[#0B0E11] px-4 py-2 rounded-lg font-mono font-bold border border-[#E6E8EA] group-hover:border-[#FCD535]/30 transition-colors"
                                                        >
                                                            {word}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 italic text-sm">No {len}-letter words found</span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {!isRevealed && (
                                        <div className="absolute inset-0 flex gap-2 blur-md opacity-40 select-none justify-center">
                                            {["WORDS", "HERE", "WODL"].map((w, i) => (
                                                <span key={i} className="bg-gray-100 h-10 w-20 rounded"></span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Info */}
                <footer className="mt-12 pt-8 border-t border-[#E6E8EA] text-center text-gray-500 text-sm">
                    <p className="font-medium">
                        Binance WODL Answer Today is for educational purposes.
                        All names, trademarks and images are copyright of Binance.
                    </p>
                </footer>
            </div>

            <style jsx global>{`
        @keyframes reveal {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-reveal {
          animation: reveal 0.4s ease-out forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
        </section>
    );
}
