export type WordLength = 3 | 4 | 5 | 6 | 7 | 8;

export interface WordData {
    all: string[];
    answers: string[];
    rankings: Record<string, { r: number; c: number }>;
}

export interface GuessResult {
    word: string;
    evaluation: ('correct' | 'present' | 'absent')[]; // 'G' | 'Y' | 'B' equivalent
}

export interface SolverState {
    guesses: GuessResult[];
    possibleWords: string[];
    bestGuess: string | null;
    status: 'idle' | 'solving' | 'won' | 'lost';
}
