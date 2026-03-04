'use client';

import { useState, useEffect } from 'react';

interface Question {
    day_number: number;
    date: string;
    question_number: number;
    question: string;
    answer: string;
    options: string[];
}

interface DayData {
    date: string;
    day_number: number;
    total_questions: number;
    questions: Question[];
}

interface CalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectDate: (date: string) => void;
    currentDate: string;
}

function CalendarModal({ isOpen, onClose, onSelectDate, currentDate }: CalendarModalProps) {
    const [viewMonth, setViewMonth] = useState(new Date());

    useEffect(() => {
        if (isOpen) {
            setViewMonth(new Date(currentDate));
        }
    }, [isOpen, currentDate]);

    if (!isOpen) return null;

    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthName = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const prevMonth = () => setViewMonth(new Date(year, month - 1, 1));
    const nextMonth = () => setViewMonth(new Date(year, month + 1, 1));

    const handleDateClick = (day: number) => {
        const selected = new Date(year, month, day);
        if (selected <= today) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            onSelectDate(dateStr);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div
                className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h3 className="text-lg font-bold text-slate-800">{monthName}</h3>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                        <div key={d} className="py-2">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-10" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const thisDate = new Date(year, month, day);
                        const isToday = thisDate.getTime() === today.getTime();
                        const isFuture = thisDate > today;
                        const isSelected = currentDate === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                        return (
                            <button
                                key={day}
                                onClick={() => handleDateClick(day)}
                                disabled={isFuture}
                                className={`h-10 rounded-lg font-medium text-sm transition-all ${isSelected
                                        ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                                        : isToday
                                            ? 'bg-violet-100 text-violet-700 font-bold'
                                            : isFuture
                                                ? 'text-slate-300 cursor-not-allowed'
                                                : 'text-slate-700 hover:bg-violet-50 hover:text-violet-600'
                                    }`}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 w-full py-3 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                    Close
                </button>
            </div>

            <style jsx>{`
                @keyframes scale-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-scale-in {
                    animation: scale-in 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
}

function getOrdinalSuffix(day: number): string {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

function formatDateTitle(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`;
}

export default function AnswerDisplay() {
    const [data, setData] = useState<DayData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [revealed, setRevealed] = useState<{ [key: number]: boolean }>({});
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');

    useEffect(() => {
        // Check URL for date parameter
        const params = new URLSearchParams(window.location.search);
        const dateParam = params.get('date');

        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const dateToFetch = dateParam || todayStr;

        setSelectedDate(dateToFetch);
        fetchData(dateToFetch);
    }, []);

    const fetchData = async (date: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`https://city-holder-daily.sohamiyer7.workers.dev/api/by-date/${date}`);
            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error('No questions found for this date');
                }
                throw new Error('Failed to fetch answers');
            }
            const json = await res.json();
            setData(json);
            setRevealed({});
        } catch (err: any) {
            setError(err.message);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
        // Update URL without reload
        const url = new URL(window.location.href);
        url.searchParams.set('date', date);
        window.history.pushState({}, '', url);
        fetchData(date);
    };

    const toggleReveal = (questionNum: number) => {
        setRevealed(prev => ({ ...prev, [questionNum]: !prev[questionNum] }));
    };

    const revealAll = () => {
        if (!data) return;
        const allRevealed: { [key: number]: boolean } = {};
        data.questions.forEach(q => {
            allRevealed[q.question_number] = true;
        });
        setRevealed(allRevealed);
    };

    const dateTitle = selectedDate ? formatDateTitle(selectedDate) : 'Loading...';

    if (loading) {
        return (
            <div className="min-h-[40vh] flex items-center justify-center p-6">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-64 bg-slate-200 rounded mb-4"></div>
                    <div className="h-4 w-48 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-[40vh] flex items-center justify-center p-6 text-center">
                <div>
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Oops!</h2>
                    <p className="text-slate-600 mb-6">{error || "No data available for this date."}</p>
                    <button
                        onClick={() => setShowCalendar(true)}
                        className="px-6 py-3 bg-violet-500 text-white font-bold rounded-xl hover:bg-violet-600 transition-colors"
                    >
                        Choose Another Date
                    </button>
                </div>
                <CalendarModal
                    isOpen={showCalendar}
                    onClose={() => setShowCalendar(false)}
                    onSelectDate={handleDateSelect}
                    currentDate={selectedDate}
                />
            </div>
        );
    }

    return (
        <section className="bg-gradient-to-b from-slate-50 to-white font-sans">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
                <div className="max-w-4xl mx-auto px-4 py-10 md:py-12 relative">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium mb-4">
                            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                            Day {data.day_number}
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black text-white mb-3 tracking-tight">
                            Questions for <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">{dateTitle}</span>
                        </h2>
                        <p className="text-base md:text-lg text-white/90 max-w-xl mx-auto mb-6">
                            Reveal all {data.total_questions} City Holder answers, open the archive, or switch to another date.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setShowCalendar(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold rounded-xl transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Archive
                            </button>
                            <button
                                onClick={revealAll}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-yellow-400/30"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Reveal All
                            </button>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 to-transparent" />
            </div>

            {/* Questions Grid */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="grid gap-4 md:gap-6">
                    {data.questions.map((q) => {
                        const isRevealed = revealed[q.question_number];
                        return (
                            <div
                                key={q.question_number}
                                className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-violet-300 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-200">
                                        {q.question_number}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-slate-800 mb-4">
                                            {q.question}
                                        </h3>

                                        {!isRevealed ? (
                                            <button
                                                onClick={() => toggleReveal(q.question_number)}
                                                className="w-full py-3 px-6 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold rounded-xl hover:from-violet-600 hover:to-purple-600 transition-all shadow-lg shadow-violet-200"
                                            >
                                                Reveal Answer
                                            </button>
                                        ) : (
                                            <div className="animate-reveal">
                                                <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl">
                                                    <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Correct Answer</div>
                                                    <div className="text-xl font-black text-emerald-700">{q.answer}</div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {q.options.map((opt, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`py-2 px-3 rounded-lg text-sm font-medium ${opt === q.answer
                                                                    ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                                                                    : 'bg-slate-100 text-slate-600'
                                                                }`}
                                                        >
                                                            {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <CalendarModal
                isOpen={showCalendar}
                onClose={() => setShowCalendar(false)}
                onSelectDate={handleDateSelect}
                currentDate={selectedDate}
            />

            <style jsx global>{`
                @keyframes reveal {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-reveal {
                    animation: reveal 0.3s ease-out forwards;
                }
            `}</style>
        </section>
    );
}
