const fs = require('fs');
const path = require('path');

// Mock Env
const env = {
    DB: {
        prepare: () => ({
            bind: () => ({
                run: async () => { },
                all: async () => ({ results: [] })
            })
        })
    }
};

// Import or mock the worker logic. Since index.ts is TS and has exports, we might need to copy/paste the logic or transpile.
// For simplicity in this environment, I'll copy the relevant logic here to test it against the files.

const scraper = {
    async run() {
        console.log("Reading local files...");
        const gfinityHtml = fs.readFileSync(path.resolve('../../wotd/gfinity.html'), 'utf-8');
        const miningHtml = fs.readFileSync(path.resolve('../../wotd/mining.html'), 'utf-8');
        const incomediaHtml = fs.readFileSync(path.resolve('../../wotd/incomepedia.html'), 'utf-8');

        console.log("Parsing Gfinity...");
        const gfinityData = this.parseGfinity(gfinityHtml);
        console.log("Gfinity Data:", JSON.stringify(gfinityData, null, 2));

        console.log("Parsing MiningCombo...");
        const miningData = this.parseMiningCombo(miningHtml);
        console.log("MiningCombo Data:", JSON.stringify(miningData, null, 2));

        console.log("Parsing Incomedia...");
        const incomediaData = this.parseIncomedia(incomediaHtml);
        console.log("Incomedia Data:", JSON.stringify(incomediaData, null, 2));

        console.log("Merging Data (3 sources: mining -> incomedia -> gfinity)...");
        const mergedData = this.mergeData(miningData, incomediaData, gfinityData);
        console.log("Merged Data:", JSON.stringify(mergedData, null, 2));
        fs.writeFileSync('test-output.json', JSON.stringify(mergedData, null, 2));
        console.log("Output written to test-output.json");
    },

    parseGfinity(html) {
        const wordsByLength = [];
        let theme = "";

        // Attempt to find theme
        // Search for "Theme:" strictly
        const themeMatch = html.match(/>\s*Theme\s*:\s*<[^>]+>\s*([^<]+)/i) || html.match(/Theme\s*:\s*([^<]+)/i);
        if (themeMatch) {
            theme = themeMatch[1].trim();
        }

        const lengths = [3, 4, 5, 6, 7, 8];
        for (const len of lengths) {
            const regex = new RegExp(`${len}-letter words:.*?<ul[^>]*>(.*?)<\\/ul>`, 'si');
            const match = html.match(regex);

            if (match) {
                const listContent = match[1];
                const words = [...listContent.matchAll(/<li[^>]*>(.*?)<\/li>/gi)]
                    .map(m => m[1].replace(/<[^>]*>/g, '').trim())
                    .filter(w => w && w.length === len);

                if (words.length > 0) {
                    wordsByLength.push({ length: len, words, correctAnswers: [] });
                }
            }
        }

        return { theme, words: wordsByLength };
    },

    parseMiningCombo(html) {
        const wordsByLength = [];
        let theme = "";

        // MiningCombo: <strong>Theme:</strong> AI Innovation
        const themeMatch = html.match(/Theme\s*:\s*(?:<\/strong>)?\s*([^<]+)/i);
        if (themeMatch) {
            theme = themeMatch[1].trim();
        }

        const lengths = [3, 4, 5, 6, 7, 8];
        for (const len of lengths) {
            const regex = new RegExp(`${len}\\s*letters.*?<ul[^>]*>(.*?)<\\/ul>`, 'si');
            const match = html.match(regex);

            if (match) {
                const listContent = match[1];
                const rawLines = [...listContent.matchAll(/<li[^>]*>(.*?)<\/li>/gi)];

                const words = [];
                const correctAnswers = [];

                for (const m of rawLines) {
                    const rawText = m[1].replace(/<[^>]*>/g, '').trim();
                    const cleanWord = rawText.replace(/←.*/, '').trim();

                    if (cleanWord.length === len) {
                        words.push(cleanWord);
                        if (rawText.includes("←")) {
                            correctAnswers.push(cleanWord);
                        }
                    }
                }

                if (words.length > 0) {
                    wordsByLength.push({ length: len, words, correctAnswers });
                }
            }
        }

        return { theme, words: wordsByLength };
    },

    parseIncomedia(html) {
        const wordsByLength = [];
        let theme = "";

        // Incomedia theme: <p><strong>Theme:</strong> AI INNOVATION
        const themeMatch = html.match(/<strong>Theme:<\/strong>\s*([^<\n]+)/i);
        if (themeMatch) {
            theme = themeMatch[1].replace(/\s+/g, ' ').trim();
        }

        // Word lists: <h3 class=wp-block-heading>WOTD X-Letter Words</h3> followed by <ul class=wp-block-list>
        const lengths = [3, 4, 5, 6, 7, 8];
        for (const len of lengths) {
            // Match "WOTD X-Letter Words" header and the following ul
            const regex = new RegExp(`WOTD\\s+${len}-Letter\\s+Words</h3>\\s*<ul[^>]*class=['"]?wp-block-list['"]?[^>]*>(.*?)</ul>`, 'si');
            const match = html.match(regex);

            if (match) {
                const listContent = match[1];
                // Words are in <li> tags (may not have closing tags)
                const words = [...listContent.matchAll(/<li[^>]*>([^<]+)/gi)]
                    .map(m => m[1].replace(/\s+/g, '').trim().toUpperCase())
                    .filter(w => w && w.length === len && /^[A-Z]+$/.test(w));

                if (words.length > 0) {
                    wordsByLength.push({ length: len, words, correctAnswers: [] });
                }
            }
        }

        return { theme, words: wordsByLength };
    },

    mergeData(mining, incomedia, gfinity) {
        // Priority: mining -> incomedia -> gfinity
        let theme = mining.theme || incomedia.theme || gfinity.theme || "Crypto";

        const mergedWordsByLength = [];
        const lengths = [3, 4, 5, 6, 7, 8];

        // Collect all words from each source for intersection check
        const allMiningWords = new Set(mining.words.flatMap(w => w.words));
        const allIncomediaWords = new Set(incomedia.words.flatMap(w => w.words));
        const allGfinityWords = new Set(gfinity.words.flatMap(w => w.words));

        // Check for any intersection between sources
        let hasIntersection = false;
        for (const w of allMiningWords) {
            if (allIncomediaWords.has(w) || allGfinityWords.has(w)) {
                hasIntersection = true;
                break;
            }
        }
        if (!hasIntersection) {
            for (const w of allIncomediaWords) {
                if (allGfinityWords.has(w)) {
                    hasIntersection = true;
                    break;
                }
            }
        }

        // If no intersection and mining has data, use mining only
        if (!hasIntersection && allMiningWords.size > 0 && (allIncomediaWords.size > 0 || allGfinityWords.size > 0)) {
            console.log("No intersection found between sources. Using mining only.");
            return mining;
        }

        // Merge/union all sources for each length
        // IMPORTANT: Fill in missing lengths from any available source
        for (const len of lengths) {
            const mEntry = mining.words.find(w => w.length === len);
            const iEntry = incomedia.words.find(w => w.length === len);
            const gEntry = gfinity.words.find(w => w.length === len);

            const mWords = mEntry ? mEntry.words : [];
            const iWords = iEntry ? iEntry.words : [];
            const gWords = gEntry ? gEntry.words : [];

            const mCorrect = mEntry ? mEntry.correctAnswers : [];
            const iCorrect = iEntry ? iEntry.correctAnswers : [];
            const gCorrect = gEntry ? gEntry.correctAnswers : [];

            // Union of words from all sources
            const unionWords = Array.from(new Set([...mWords, ...iWords, ...gWords]));
            // Union of correct answers from all sources
            const unionCorrect = Array.from(new Set([...mCorrect, ...iCorrect, ...gCorrect]));

            if (unionWords.length > 0) {
                mergedWordsByLength.push({
                    length: len,
                    words: unionWords,
                    correctAnswers: unionCorrect
                });
            } else {
                // Log missing lengths for debugging
                console.log(`No words found for ${len}-letter length from any source`);
            }
        }

        return { theme, words: mergedWordsByLength };
    }
};

scraper.run().catch(console.error);
