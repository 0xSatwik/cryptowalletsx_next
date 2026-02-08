'use client';

import { useState, useEffect } from 'react';

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

    const toggleReveal = (len: number) => {
        setRevealed((prev) => ({ ...prev, [len]: !prev[len] }));
    };

    const themeName = data.length > 0 ? data[0].theme.replace(/<!--.*?-->/sg, '').trim() : 'Loading...';

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] text-[#0B0E11] flex items-center justify-center p-6">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-64 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || data.length === 0) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] text-[#0B0E11] flex items-center justify-center p-6 text-center">
                <div>
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Oops!</h1>
                    <p className="text-gray-600">{error || "No data available for today yet. Please check back later."}</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#F8F9FA] text-[#0B0E11] font-sans selection:bg-[#FCD535] selection:text-black">
            <div className="max-w-4xl mx-auto px-4 py-16">
                {/* Header Section */}
                <header className="text-center mb-16">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-[#FCD535]/10 border border-[#FCD535]/30 text-[#D49E00] text-sm font-bold mb-6 animate-fade-in uppercase tracking-wider">
                        Binance WODL Answer Today
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-[#0B0E11]">
                        Today&#39;s Theme: <span className="bg-gradient-to-r from-[#FCD535] to-[#F3BA2F] bg-clip-text text-transparent capitalize">{themeName}</span>
                    </h1>
                    <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                        Get the correct answers for today&#39;s Binance Word of the Day puzzle. Verified and updated regularly.
                    </p>
                </header>

                {/* Answers Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {[3, 4, 5, 6, 7, 8].map((len) => {
                        const entry = data.find((d) => d.word_length === len);
                        const words: string[] = entry ? JSON.parse(entry.words) : [];
                        const correctAnswers: string[] = entry && entry.correct_answers ? JSON.parse(entry.correct_answers) : [];
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
                                            {/* Correct Answers (Best Choice) */}
                                            {correctAnswers.length > 0 && (
                                                <div className="flex flex-wrap gap-2 justify-center border-b border-gray-100 pb-3">
                                                    {correctAnswers.map((word, idx) => (
                                                        <span
                                                            key={`correct-${idx}`}
                                                            className="flex items-center gap-1.5 bg-green-100 text-green-800 px-4 py-2 rounded-lg font-mono font-bold border border-green-200 shadow-sm"
                                                        >
                                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                            {word}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* All Other Words */}
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {words.length > 0 ? words.filter(w => !correctAnswers.includes(w)).map((word, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="bg-[#F8F9FA] text-[#0B0E11] px-4 py-2 rounded-lg font-mono font-bold border border-[#E6E8EA] group-hover:border-[#FCD535]/30 transition-colors"
                                                    >
                                                        {word}
                                                    </span>
                                                )) : (
                                                    correctAnswers.length === 0 && <span className="text-gray-400 italic text-sm">No {len}-letter words found</span>
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
                <footer className="mt-20 pt-10 border-t border-[#E6E8EA] text-center text-gray-500 text-sm">
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
        </main>
    );
}
