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
        const url = "https://www.coinfantasy.io/crypto-wodl-binance-answers-today";
        const response = await fetch(url);
        const html = await response.text();

        const data = this.parseWodl(html);
        const results = [];

        if (data.theme && data.words.length > 0) {
            const today = new Date().toISOString().split("T")[0];

            for (const entry of data.words) {
                try {
                    await env.DB.prepare(
                        "INSERT OR REPLACE INTO wodl_data (publish_date, theme, word_length, words, correct_answers) VALUES (?, ?, ?, ?, ?)"
                    )
                        .bind(today, data.theme, entry.length, JSON.stringify(entry.words), JSON.stringify(entry.correctAnswers))
                        .run();
                    results.push({ length: entry.length, status: "saved" });
                } catch (e: any) {
                    results.push({ length: entry.length, status: "error", message: e.message || "Unknown error" });
                }
            }
        }

        return { theme: data.theme, results };
    },

    parseWodl(html: string) {
        const wordsByLength: { length: number; words: string[]; correctAnswers: string[] }[] = [];
        let theme = "";

        // Extract Theme - Robust regex for various patterns
        const themePatterns = [
            /theme\s*[‘'“"]([^’'”"]+)[’'”"]/i,
            /theme\s+is\s+["']([^"']+)["']/i,
            /Binance\s+WODL\s+theme\s+[^‘'“"]*[‘'“"]([^’'”"]+)[’'”"]/i,
            /class="font-extrabold">.*?theme\s+[^‘'“"]*[‘'“"]([^’'”"]+)[’'”"]/si
        ];

        for (const pattern of themePatterns) {
            const match = html.match(pattern);
            if (match) {
                theme = match[1].replace(/<!--.*?-->/sg, '').trim();
                break;
            }
        }

        // List of CSS IDs to check
        const lengths = [3, 4, 5, 6, 7, 8];

        for (const len of lengths) {
            const id = `${len}-letter-words`;
            const idRegex = new RegExp(`id=["']${id}["'][^>]*>(.*?)<\/section>`, 'si');
            const match = html.match(idRegex);

            let sectionContent = "";
            if (match) {
                sectionContent = match[1];
            } else {
                // Fallback: Search by text label
                const textLabelRegex = new RegExp(`${len}\\s*Letter\\s*WODL\\s*Words.*?<ul[^>]*>(.*?)<\/ul>`, 'si');
                const textMatch = html.match(textLabelRegex);
                if (textMatch) {
                    sectionContent = textMatch[1];
                }
            }

            if (sectionContent) {
                const words = [...sectionContent.matchAll(/<li[^>]*>(.*?)<\/li>/gi)]
                    .map(m => m[1].replace(/<[^>]*>/g, '').replace(/←/g, '').trim())
                    .filter(w => w && w.length === len);

                if (words.length > 0) {
                    // Extract correct answers (those with ←)
                    const correctAnswers = [...sectionContent.matchAll(/<li[^>]*>(.*?)←.*?<\/li>/gi)]
                        .map(m => m[1].replace(/<[^>]*>/g, '').trim())
                        .filter(w => w && w.length === len);

                    // If no explicit correct answer found, fallback logic (optional, currently empty)
                    // If you want to default to the FIRST word as "recommended", uncomment below:
                    // if (correctAnswers.length === 0 && words.length > 0) {
                    //     correctAnswers.push(words[0]);
                    // }

                    wordsByLength.push({ length: len, words, correctAnswers });
                }
            }
        }

        return { theme, words: wordsByLength };
    }
};
