'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { WordData, WordLength, GuessResult } from '@/app/utils/binance-wotd/types';
import { BinanceWotdSolver } from '@/app/utils/binance-wotd/solver';
import { STARTERS } from '@/app/utils/binance-wotd/starters';

export default function Solver() {
    // State
    const [wordLength, setWordLength] = useState<WordLength>(5);
    const [wordData, setWordData] = useState<WordData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [guesses, setGuesses] = useState<GuessResult[]>([]);
    const [bestGuesses, setBestGuesses] = useState<{ word: string; score: number; isAnswer: boolean }[]>([]);
    const [possibleWords, setPossibleWords] = useState<string[]>([]);

    // Preferences
    const [hardMode, setHardMode] = useState(true);
    const [useAllWords, setUseAllWords] = useState(false);

    // Input State
    const [currentWord, setCurrentWord] = useState('');
    const [currentEvaluation, setCurrentEvaluation] = useState<GuessResult['evaluation']>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load initial starters
    useEffect(() => {
        const mode = hardMode ? 'hard' : 'easy';
        const starters = STARTERS[mode][wordLength] || [];
        const starterObjs = starters.map((word, idx) => ({
            word,
            score: idx + 1,
            isAnswer: false
        }));
        setBestGuesses(starterObjs);
    }, [wordLength, hardMode]);

    // Load full data
    useEffect(() => {
        async function loadData() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/data/binance-wotd/data-${wordLength}.json`);
                if (!res.ok) throw new Error('Failed to load word data');
                const data: WordData = await res.json();
                setWordData(data);
                setPossibleWords(useAllWords ? data.all : data.answers);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [wordLength, useAllWords]);

    useEffect(() => {
        setCurrentEvaluation(Array(wordLength).fill('absent'));
    }, [wordLength]);

    const solver = useMemo(() => {
        if (!wordData) return null;
        return new BinanceWotdSolver(wordData, wordLength, hardMode);
    }, [wordData, wordLength, hardMode]);

    useEffect(() => {
        if (!solver || !wordData) return;

        if (guesses.length === 0) {
            const baseList = useAllWords ? wordData.all : wordData.answers;
            setPossibleWords(baseList);
            return;
        }

        const baseList = useAllWords ? wordData.all : wordData.answers;
        const filtered = BinanceWotdSolver.filterPossibilities(baseList, guesses);
        setPossibleWords(filtered);
        const suggestions = solver.getBestGuesses(filtered, guesses);
        setBestGuesses(suggestions);
    }, [guesses, solver, wordData, useAllWords]);

    const handleAddGuess = () => {
        if (currentWord.length !== wordLength) return;
        setGuesses(prev => [...prev, { word: currentWord.toUpperCase(), evaluation: currentEvaluation }]);
        setCurrentWord('');
        setCurrentEvaluation(Array(wordLength).fill('absent'));
        inputRef.current?.focus();
    };

    const handleRemoveGuess = (index: number) => {
        const newGuesses = guesses.filter((_, i) => i !== index);
        setGuesses(newGuesses);

        if (newGuesses.length === 0) {
            const mode = hardMode ? 'hard' : 'easy';
            const starters = STARTERS[mode][wordLength] || [];
            const starterObjs = starters.map((word, idx) => ({
                word, score: idx + 1, isAnswer: false
            }));
            setBestGuesses(starterObjs);
            if (wordData) {
                setPossibleWords(useAllWords ? wordData.all : wordData.answers);
            }
        }
    };

    const toggleTileColor = (index: number) => {
        setCurrentEvaluation(prev => {
            const next = [...prev];
            next[index] = next[index] === 'absent' ? 'present' : next[index] === 'present' ? 'correct' : 'absent';
            return next;
        });
    };

    const resetGame = () => {
        setGuesses([]);
        setCurrentWord('');
        setCurrentEvaluation(Array(wordLength).fill('absent'));
        const mode = hardMode ? 'hard' : 'easy';
        const starters = STARTERS[mode][wordLength] || [];
        const starterObjs = starters.map((word, idx) => ({
            word, score: idx + 1, isAnswer: false
        }));
        setBestGuesses(starterObjs);
        if (wordData) {
            setPossibleWords(useAllWords ? wordData.all : wordData.answers);
        }
        inputRef.current?.focus();
    };

    const handleSuggestionClick = (word: string) => {
        setCurrentWord(word);
        setCurrentEvaluation(Array(wordLength).fill('absent'));
        inputRef.current?.focus();
    };

    const startingWords = useMemo(() => {
        if (guesses.length > 0) return [];
        return bestGuesses.slice(0, 5);
    }, [guesses.length, bestGuesses]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
                <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 relative">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium mb-3">
                            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                            Free Tool
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black text-white mb-2 tracking-tight">
                            Binance WOTD Solver
                        </h1>
                        <p className="text-sm md:text-base text-white/90 max-w-xl mx-auto">
                            Instantly solve the Binance Word of the Day puzzle
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-slate-50 to-transparent" />
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 -mt-4 relative z-10">
                {/* Solver Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    {/* Controls */}
                    <div className="p-6 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
                        {/* Word Length */}
                        <div className="flex flex-wrap justify-center gap-2 mb-6">
                            {[3, 4, 5, 6, 7, 8].map(len => (
                                <button
                                    key={len}
                                    onClick={() => setWordLength(len as WordLength)}
                                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${wordLength === len
                                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-200'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:text-emerald-600'
                                        }`}
                                >
                                    {len} Letters
                                </button>
                            ))}
                        </div>

                        {/* Toggles */}
                        <div className="flex justify-center gap-8 text-sm">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <span className="font-semibold text-slate-700">Hard Mode</span>
                                <div
                                    className={`relative w-12 h-6 rounded-full transition-colors ${hardMode ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                    onClick={() => setHardMode(!hardMode)}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${hardMode ? 'translate-x-6' : ''}`} />
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <span className="font-semibold text-slate-700">{useAllWords ? 'All Words' : 'Most Likely'}</span>
                                <div
                                    className={`relative w-12 h-6 rounded-full transition-colors ${useAllWords ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                    onClick={() => setUseAllWords(!useAllWords)}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${useAllWords ? 'translate-x-6' : ''}`} />
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Input Section */}
                    <div className="p-6">
                        {loading && !wordData ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
                                <p className="mt-4 text-slate-500 font-medium">Loading word lists...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8 text-red-600 bg-red-50 rounded-xl">{error}</div>
                        ) : (
                            <>
                                {/* Input Row */}
                                <div className="flex items-center gap-2 mb-4">
                                    <button
                                        onClick={resetGame}
                                        className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors flex-shrink-0"
                                        title="Reset"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </button>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={currentWord}
                                        onChange={(e) => setCurrentWord(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, wordLength))}
                                        placeholder={`${wordLength} letters`}
                                        className="flex-1 min-w-0 text-center text-lg md:text-2xl font-black tracking-widest py-2.5 px-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all uppercase"
                                        maxLength={wordLength}
                                        autoComplete="off"
                                        spellCheck="false"
                                    />
                                </div>

                                {/* Tiles */}
                                <div className="flex justify-center gap-2 mb-4">
                                    {Array.from({ length: wordLength }).map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => currentWord[idx] && toggleTileColor(idx)}
                                            className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center font-black text-2xl md:text-3xl rounded-lg transition-all duration-200 ${currentWord[idx]
                                                ? currentEvaluation[idx] === 'correct' ? 'bg-emerald-500 text-white'
                                                    : currentEvaluation[idx] === 'present' ? 'bg-amber-400 text-white'
                                                        : 'bg-slate-500 text-white'
                                                : 'bg-white border-2 border-slate-200 text-slate-300'
                                                }`}
                                            disabled={!currentWord[idx]}
                                        >
                                            {currentWord[idx] || ''}
                                        </button>
                                    ))}
                                </div>

                                {currentWord.length === wordLength && (
                                    <p className="text-center text-xs text-slate-500 font-medium mb-4">
                                        👆 Tap tiles to change colors: Grey → Yellow → Green
                                    </p>
                                )}

                                <button
                                    onClick={handleAddGuess}
                                    disabled={currentWord.length !== wordLength}
                                    className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    Add Guess
                                </button>
                            </>
                        )}
                    </div>

                    {/* Guess History */}
                    {guesses.length > 0 && (
                        <div className="px-6 pb-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Your Guesses</h3>
                            <div className="space-y-2">
                                {guesses.map((guess, idx) => (
                                    <div key={idx} className="flex items-center justify-between group bg-slate-50 rounded-lg p-2">
                                        <div className="flex gap-1">
                                            {guess.word.split('').map((char, charIdx) => (
                                                <div
                                                    key={charIdx}
                                                    className={`w-10 h-10 flex items-center justify-center font-bold text-lg rounded text-white ${guess.evaluation[charIdx] === 'correct' ? 'bg-emerald-500'
                                                        : guess.evaluation[charIdx] === 'present' ? 'bg-amber-400'
                                                            : 'bg-slate-500'
                                                        }`}
                                                >
                                                    {char}
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveGuess(idx)}
                                            className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suggestions */}
                    <div className="p-6 bg-gradient-to-b from-white to-slate-50 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Best Guesses</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black text-emerald-600">{possibleWords.length}</span>
                                <span className="text-xs text-slate-500 font-medium">remaining</span>
                            </div>
                        </div>

                        {guesses.length === 0 && startingWords.length > 0 && (
                            <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100">
                                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 text-center">⭐ Recommended Starters</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {startingWords.map((s, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSuggestionClick(s.word)}
                                            className="px-4 py-2 rounded-lg font-mono font-bold text-sm bg-white border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all"
                                        >
                                            {s.word}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                            {bestGuesses.map((suggestion, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleSuggestionClick(suggestion.word)}
                                    className="flex items-center justify-between py-3 px-4 rounded-lg cursor-pointer bg-white border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
                                >
                                    <span className="font-mono font-bold text-lg text-slate-800 group-hover:text-emerald-700">{suggestion.word}</span>
                                    {suggestion.isAnswer && (
                                        <span className="text-xs font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">ANSWER</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* How to Use Section */}
                <div className="mt-10 bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                        <span className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center text-white text-lg">📖</span>
                        How to Use This Solver
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100">
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold mb-3">1</div>
                            <h3 className="font-bold text-slate-800 mb-2">Enter Your Guess</h3>
                            <p className="text-sm text-slate-600">Type the word you guessed in Binance WOTD, or click a suggestion to use it.</p>
                        </div>
                        <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100">
                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 font-bold mb-3">2</div>
                            <h3 className="font-bold text-slate-800 mb-2">Mark the Colors</h3>
                            <p className="text-sm text-slate-600">Tap each tile to match the color shown in Binance: <span className="text-emerald-600 font-semibold">Green</span>, <span className="text-amber-500 font-semibold">Yellow</span>, or <span className="text-slate-500 font-semibold">Grey</span>.</p>
                        </div>
                        <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold mb-3">3</div>
                            <h3 className="font-bold text-slate-800 mb-2">Get Suggestions</h3>
                            <p className="text-sm text-slate-600">Click "Add Guess" and the solver will show you the best words to try next!</p>
                        </div>
                    </div>
                </div>

                {/* What is WOTD Section */}
                <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                        <span className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl flex items-center justify-center text-white text-lg">💡</span>
                        What is Binance Word of the Day?
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        <strong>Binance Word of the Day (WOTD)</strong> is a daily word puzzle game offered by Binance where users guess a crypto-related word to earn rewards.
                        It's similar to Wordle but focuses on cryptocurrency terminology. Each day, a new word is released and you have limited attempts to guess it.
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                        Use this solver to maximize your chances of finding the answer quickly. Simply enter your guesses, mark the results with colors,
                        and let our algorithm suggest the optimal next moves based on remaining possibilities.
                    </p>
                </div>

                {/* FAQ Section */}
                <div className="mt-8 mb-16 bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                        <span className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-lg">❓</span>
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        <details className="group border border-slate-200 rounded-xl overflow-hidden">
                            <summary className="flex items-center justify-between p-5 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                <span className="font-semibold text-slate-800">What word lengths are supported?</span>
                                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="p-5 text-slate-600">
                                The solver supports words from 3 to 8 letters long, covering all possible Binance WOTD puzzle variations.
                            </div>
                        </details>
                        <details className="group border border-slate-200 rounded-xl overflow-hidden">
                            <summary className="flex items-center justify-between p-5 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                <span className="font-semibold text-slate-800">What is Hard Mode?</span>
                                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="p-5 text-slate-600">
                                Hard Mode requires any revealed hints (green and yellow letters) to be used in subsequent guesses. This makes the puzzle more challenging but helps narrow down answers faster.
                            </div>
                        </details>
                        <details className="group border border-slate-200 rounded-xl overflow-hidden">
                            <summary className="flex items-center justify-between p-5 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                <span className="font-semibold text-slate-800">What's the difference between "All Words" and "Most Likely"?</span>
                                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="p-5 text-slate-600">
                                "Most Likely" shows only common words that are likely to be puzzle answers, while "All Words" includes the full dictionary of valid guesses including obscure words.
                            </div>
                        </details>
                        <details className="group border border-slate-200 rounded-xl overflow-hidden">
                            <summary className="flex items-center justify-between p-5 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                <span className="font-semibold text-slate-800">Is this solver free to use?</span>
                                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="p-5 text-slate-600">
                                Yes! This Binance WOTD Solver is completely free to use. No sign-up or payment required.
                            </div>
                        </details>
                    </div>
                </div>
            </div>
        </div>
    );
}
