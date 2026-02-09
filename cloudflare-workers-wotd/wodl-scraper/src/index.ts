// Cloudflare Workers Types (Interfaces to fix lint errors if types aren't globally available)
export interface Env {
    DB: any; // Using any for DB since D1Database is missing in the current IDE context
    SECRET_KEY: string;
}

export interface ScheduledEvent {
    cron: string;
    scheduledTime: number;
}

export interface ExecutionContext {
    waitUntil(promise: Promise<any>): void;
    passThroughOnException(): void;
}

export default {
    async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
        ctx.waitUntil(this.scrapeAndStore(env));
    },

    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        const url = new URL(request.url);
        const origin = request.headers.get("Origin");
        const allowedOrigins = [
            "https://cryptowalletsx.com",
            "https://wordsolverx.com",
            "http://localhost:3000"
        ];

        const corsHeaders: Record<string, string> = {
            "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };

        if (origin && allowedOrigins.includes(origin)) {
            corsHeaders["Access-Control-Allow-Origin"] = origin;
        }

        // Handle Preflight OPTIONS
        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        const pathParts = url.pathname.split("/").filter(p => p);
        const today = new Date().toISOString().split("T")[0];

        const handleRequest = async () => {
            // PUBLIC ROUTES

            // GET / (Home) or /today
            if (pathParts.length === 0 || (pathParts[0] === "today" && pathParts.length === 1)) {
                const data = await env.DB.prepare("SELECT * FROM wodl_data WHERE publish_date = ?")
                    .bind(today)
                    .all();
                return new Response(JSON.stringify(data.results), {
                    headers: { "Content-Type": "application/json" },
                });
            }

            // GET /show/:date
            if (pathParts[0] === "show" && pathParts[1]) {
                const date = pathParts[1];
                const data = await env.DB.prepare("SELECT * FROM wodl_data WHERE publish_date = ?")
                    .bind(date)
                    .all();
                return new Response(JSON.stringify(data.results), {
                    headers: { "Content-Type": "application/json" },
                });
            }

            // AUTH CHECK FOR MUTATION ROUTES
            const secret = pathParts[pathParts.length - 1];

            // Re-check if it's a mutation route before failing auth
            const isMutation = pathParts[0] === "add" || pathParts[0] === "delete";

            if (isMutation) {
                if (secret !== env.SECRET_KEY) {
                    return new Response("Unauthorized", { status: 401 });
                }

                // POST/GET /add/today/:secret
                if (pathParts[0] === "add" && pathParts[1] === "today") {
                    const results = await this.scrapeAndStore(env);
                    return new Response(JSON.stringify(results), {
                        headers: { "Content-Type": "application/json" },
                    });
                }

                // DELETE /delete/:date/:secret or /delete/today/:secret
                if (pathParts[0] === "delete" && pathParts[1]) {
                    const targetDate = pathParts[1] === "today" ? today : pathParts[1];
                    await env.DB.prepare("DELETE FROM wodl_data WHERE publish_date = ?")
                        .bind(targetDate)
                        .run();
                    return new Response(JSON.stringify({ status: "deleted", date: targetDate }), {
                        headers: { "Content-Type": "application/json" },
                    });
                }
            }

            return new Response("WODL Scraper Management API - Path not found", { status: 404 });
        };

        const response = await handleRequest();
        const newResponse = new Response(response.body, response);

        // Add CORS headers to all responses
        Object.entries(corsHeaders).forEach(([name, value]) => {
            newResponse.headers.set(name, value);
        });

        return newResponse;
    },

    async scrapeAndStore(env: Env) {
        // Fetch from all 3 sources in parallel
        const [gfinityData, miningData, incomediaData] = await Promise.all([
            this.fetchGfinityData(),
            this.fetchMiningComboData(),
            this.fetchIncomediaData()
        ]);

        // Merge logic with 3 sources (priority: mining -> incomedia -> gfinity)
        const finalData = this.mergeData(miningData, incomediaData, gfinityData);
        const results = [];

        if (finalData.theme && finalData.words.length > 0) {
            const today = new Date().toISOString().split("T")[0];

            // Delete existing data for the day to ensure we overwrite old data (even if theme changed)
            try {
                await env.DB.prepare("DELETE FROM wodl_data WHERE publish_date = ?")
                    .bind(today)
                    .run();
                console.log(`Deleted existing data for ${today}`);
            } catch (e: any) {
                console.error(`Error deleting old data for ${today}:`, e);
                // Continue execution, maybe it was just empty or locked?
            }

            for (const entry of finalData.words) {
                try {
                    await env.DB.prepare(
                        "INSERT INTO wodl_data (publish_date, theme, word_length, words, correct_answers) VALUES (?, ?, ?, ?, ?)"
                    )
                        .bind(today, finalData.theme, entry.length, JSON.stringify(entry.words), JSON.stringify(entry.correctAnswers))
                        .run();
                    results.push({ length: entry.length, status: "saved" });
                } catch (e: any) {
                    results.push({ length: entry.length, status: "error", message: e.message || "Unknown error" });
                }
            }
        }

        return { theme: finalData.theme, results, sources: { gfinity: !!gfinityData.theme, mining: !!miningData.theme, incomedia: !!incomediaData.theme } };
    },

    async fetchGfinityData() {
        try {
            const url = "https://www.gfinityesports.com/article/binance-crypto-wodl-answers";
            const response = await fetch(url);
            const html = await response.text();
            return this.parseGfinity(html);
        } catch (e) {
            console.error("Error fetching Gfinity:", e);
            return { theme: "", words: [] };
        }
    },

    async fetchMiningComboData() {
        try {
            const url = "https://miningcombo.com/binance-word-of-the-day/";
            const response = await fetch(url);
            const html = await response.text();
            return this.parseMiningCombo(html);
        } catch (e) {
            console.error("Error fetching MiningCombo:", e);
            return { theme: "", words: [] };
        }
    },

    async fetchIncomediaData() {
        try {
            const url = "https://incomopedia.com/binance-word-of-the-day-answers-today/";
            const response = await fetch(url);
            const html = await response.text();
            return this.parseIncomedia(html);
        } catch (e) {
            console.error("Error fetching Incomedia:", e);
            return { theme: "", words: [] };
        }
    },

    parseGfinity(html: string) {
        const wordsByLength: { length: number; words: string[]; correctAnswers: string[] }[] = [];
        let theme = "";

        // Attempt to find theme
        // Search for "Theme:" strictly
        const themeMatch = html.match(/>\s*Theme\s*:\s*<[^>]+>\s*([^<]+)/i) || html.match(/Theme\s*:\s*([^<]+)/i);
        if (themeMatch) {
            theme = themeMatch[1].replace(/\s+/g, ' ').trim();
        }

        // Parsing logic for Gfinity's list structure
        // Look for "X-letter words" and then the following <ul>
        const lengths = [3, 4, 5, 6, 7, 8];
        for (const len of lengths) {
            // Regex to find "X-letter words" followed by a UL list
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

    parseMiningCombo(html: string) {
        const wordsByLength: { length: number; words: string[]; correctAnswers: string[] }[] = [];
        let theme = "";

        // MiningCombo: <strong>Theme:</strong> AI Innovation
        const themeMatch = html.match(/Theme\s*:\s*(?:<\/strong>)?\s*([^<]+)/i);
        if (themeMatch) {
            theme = themeMatch[1].replace(/\s+/g, ' ').trim();
        }

        const lengths = [3, 4, 5, 6, 7, 8];
        for (const len of lengths) {
            // Look for headers like "Today’s Binance word of the day Answer 3 letters"
            // followed by a <ul class="wp-block-list">
            const regex = new RegExp(`${len}\\s*letters.*?<ul[^>]*>(.*?)<\\/ul>`, 'si');
            const match = html.match(regex);

            if (match) {
                const listContent = match[1];
                const rawLines = [...listContent.matchAll(/<li[^>]*>(.*?)<\/li>/gi)];

                const words: string[] = [];
                const correctAnswers: string[] = [];

                for (const m of rawLines) {
                    const rawText = m[1].replace(/<[^>]*>/g, '').trim(); // Strip tags
                    const cleanWord = rawText.replace(/←.*/, '').trim(); // Remove arrow and text after

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

    parseIncomedia(html: string) {
        const wordsByLength: { length: number; words: string[]; correctAnswers: string[] }[] = [];
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

    mergeData(mining: any, incomedia: any, gfinity: any) {
        // Priority: mining -> incomedia -> gfinity
        // Theme priority
        let theme = mining.theme || incomedia.theme || gfinity.theme || "Crypto";

        const mergedWordsByLength: { length: number; words: string[]; correctAnswers: string[] }[] = [];
        const lengths = [3, 4, 5, 6, 7, 8];

        // Collect all words from each source for intersection check
        const allMiningWords = new Set(mining.words.flatMap((w: any) => w.words));
        const allIncomediaWords = new Set(incomedia.words.flatMap((w: any) => w.words));
        const allGfinityWords = new Set(gfinity.words.flatMap((w: any) => w.words));

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
            const mEntry = mining.words.find((w: any) => w.length === len);
            const iEntry = incomedia.words.find((w: any) => w.length === len);
            const gEntry = gfinity.words.find((w: any) => w.length === len);

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
