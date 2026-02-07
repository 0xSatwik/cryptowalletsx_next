import { WordData, GuessResult, WordLength } from './types';

export class BinanceWotdSolver {
    private wordData: WordData;
    private wordLength: WordLength;
    private hardMode: boolean;

    constructor(wordData: WordData, wordLength: WordLength, hardMode: boolean) {
        this.wordData = wordData;
        this.wordLength = wordLength;
        this.hardMode = hardMode;
    }

    // Constants
    static CORRECT = 'G';
    static PRESENT = 'Y';
    static ABSENT = 'B'; // or 'X' in original code, using 'B' for 'Black/Grey'

    // Get difference (coloring) between a guess and an answer
    static getDifference(guess: string, answer: string): string {
        const length = guess.length;
        let diff = Array(length).fill(BinanceWotdSolver.ABSENT);
        let answerChars = answer.split('');
        let guessChars = guess.split('');

        // First pass: Correct letters (Green)
        for (let i = 0; i < length; i++) {
            if (guessChars[i] === answerChars[i]) {
                diff[i] = BinanceWotdSolver.CORRECT;
                answerChars[i] = null as any; // Mark as used
                guessChars[i] = null as any;
            }
        }

        // Second pass: Present letters (Yellow)
        for (let i = 0; i < length; i++) {
            if (guessChars[i] === null) continue; // Already handled

            const index = answerChars.indexOf(guessChars[i]);
            if (index !== -1) {
                diff[i] = BinanceWotdSolver.PRESENT;
                answerChars[index] = null as any;
            }
        }

        return diff.join('');
    }

    isValidGuess(guess: string): boolean {
        return guess.length === this.wordLength && this.wordData.all.includes(guess);
    }

    // Filter possible answers based on history of guesses
    static filterPossibilities(possibilities: string[], guesses: GuessResult[]): string[] {
        return possibilities.filter(word => {
            for (const guess of guesses) {
                // Convert GuessResult evaluation to string format (G, Y, B)
                const guessDiff = guess.evaluation.map(e =>
                    e === 'correct' ? BinanceWotdSolver.CORRECT :
                        e === 'present' ? BinanceWotdSolver.PRESENT : BinanceWotdSolver.ABSENT
                ).join('');

                const calculatedDiff = BinanceWotdSolver.getDifference(guess.word, word);
                if (calculatedDiff !== guessDiff) {
                    return false;
                }
            }
            return true;
        });
    }

    // Calculate best guesses
    getBestGuesses(possibleAnswers: string[], guessesMade: GuessResult[]): { word: string; score: number; isAnswer: boolean }[] {
        // If many possibilities, maybe use a heuristic or just return top ranked from pre-calc
        // If few, run entropy calculation

        const MAX_CANDIDATES = 100; // Limit candidates for expensive calculation
        let candidates = this.wordData.all; // We can guess any word usually

        if (this.hardMode && guessesMade.length > 0) {
            // In hard mode, candidates must match previous clues? 
            // Standard hard mode: Must use revealed hints.
            // wordlebot 'harddecisiontree' suggests it just uses hard mode logic.
            // For simplicity/performance, we might restrict candidates or just filter.
            candidates = BinanceWotdSolver.filterPossibilities(candidates, guessesMade);
        }

        // Optimization: If very first guess, return pre-calculated best openers if available
        if (guessesMade.length === 0) {
            // Return pre-computed ranking from file if exists
            const topRanked = Object.entries(this.wordData.rankings)
                .sort((a, b) => (this.hardMode ? a[1].r - b[1].r : a[1].c - b[1].c)) // Lower is better (average guesses)
                .slice(0, 10)
                .map(([word, rank]) => ({
                    word,
                    score: this.hardMode ? rank.r : rank.c,
                    isAnswer: possibleAnswers.includes(word)
                }));
            if (topRanked.length > 0) return topRanked;
        }

        // If too many possibilities, use simple frequency or ranking
        if (possibleAnswers.length > 200) {
            // Use pre-computed rankings to sort candidates
            // If candidates are not in rankings, fallback to frequency logic?
            // For now, let's just return candidates that are in possibleAnswers sorted by ranking
            const rankedCandidates = candidates
                .filter(w => this.wordData.rankings[w])
                .sort((a, b) => {
                    const rankA = this.hardMode ? this.wordData.rankings[a].r : this.wordData.rankings[a].c;
                    const rankB = this.hardMode ? this.wordData.rankings[b].r : this.wordData.rankings[b].c;
                    return rankA - rankB;
                })
                .slice(0, 20);

            return rankedCandidates.map(w => ({
                word: w,
                score: this.hardMode ? this.wordData.rankings[w].r : this.wordData.rankings[w].c,
                isAnswer: true
            }));
        }

        // Full entropy/bucket calculation for smaller sets
        // We want a guess that splits possibleAnswers into smallest buckets

        // Candidate set: combine possible answers + top ranked words (to widen search if needed)
        // For performance, limit candidates.
        let bestGuesses: { word: string; score: number; isAnswer: boolean }[] = [];

        let searchSpace = Array.from(new Set([...possibleAnswers, ...candidates.slice(0, 200)])); // simple mix
        if (searchSpace.length > 200) searchSpace = searchSpace.slice(0, 200);

        const candidateScores = searchSpace.map(guess => {
            const buckets: Record<string, number> = {};
            for (const answer of possibleAnswers) {
                const diff = BinanceWotdSolver.getDifference(guess, answer);
                buckets[diff] = (buckets[diff] || 0) + 1;
            }

            // Calculate score: Average bucket size? Or Max bucket size?
            // wordlebot uses 'average' (guesses needed).
            // Minimizing Sum(size^2) is good proxy for entropy.

            let sumSquares = 0;
            for (const key in buckets) {
                sumSquares += buckets[key] * buckets[key];
            }

            // Weighted average bucket size = Sum(size^2) / total
            const score = sumSquares / possibleAnswers.length;

            // Adjust score: if it's a possible answer, slight bonus?
            // In wordlebot, "average" is guesses. Lower is better.
            // This score mimics "expected remaining candidates". Lower is better.

            return {
                word: guess,
                score: score,
                isAnswer: possibleAnswers.includes(guess)
            };
        });

        // Sort by score ascending
        candidateScores.sort((a, b) => a.score - b.score);

        return candidateScores.slice(0, 20);
    }
}
