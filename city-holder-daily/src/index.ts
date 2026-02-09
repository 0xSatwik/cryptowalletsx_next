/**
 * City Holder Daily API
 * Cloudflare Worker with D1 Database
 * 
 * Endpoints:
 * - GET /api/by-date/:date - Get questions by date (YYYY-MM-DD)
 * - GET /api/by-number/:dayNumber - Get questions by day number
 * - GET /api/search?q=query - Search questions by text
 */

export interface Env {
    DB: D1Database;
}

// CORS headers for API responses
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            // Route: GET /api/by-date/:date
            if (url.pathname.match(/^\/api\/by-date\/[\d-]+$/)) {
                const date = url.pathname.split('/').pop();
                return await getQuestionsByDate(env.DB, date!);
            }

            // Route: GET /api/by-number/:dayNumber
            if (url.pathname.match(/^\/api\/by-number\/\d+$/)) {
                const dayNumber = parseInt(url.pathname.split('/').pop()!);
                return await getQuestionsByDayNumber(env.DB, dayNumber);
            }

            // Route: GET /api/search?q=query
            if (url.pathname === '/api/search') {
                const query = url.searchParams.get('q');
                if (!query) {
                    return jsonResponse({ error: 'Missing query parameter' }, 400);
                }
                return await searchQuestions(env.DB, query);
            }

            // Default route - API documentation
            if (url.pathname === '/' || url.pathname === '/api') {
                return jsonResponse({
                    name: 'City Holder Daily API',
                    version: '1.0.0',
                    endpoints: [
                        {
                            path: '/api/by-date/:date',
                            method: 'GET',
                            description: 'Get all questions for a specific date',
                            example: '/api/by-date/2026-02-10'
                        },
                        {
                            path: '/api/by-number/:dayNumber',
                            method: 'GET',
                            description: 'Get all questions for a specific day number',
                            example: '/api/by-number/380'
                        },
                        {
                            path: '/api/search?q=:query',
                            method: 'GET',
                            description: 'Search questions by text',
                            example: '/api/search?q=Matrix'
                        }
                    ]
                });
            }

            return jsonResponse({ error: 'Not found' }, 404);
        } catch (error: any) {
            console.error('API Error:', error);
            return jsonResponse({ error: error.message || 'Internal server error' }, 500);
        }
    },
};

/**
 * Get questions by date
 */
async function getQuestionsByDate(db: D1Database, date: string): Promise<Response> {
    const { results } = await db
        .prepare('SELECT * FROM city_holder_answers WHERE date = ? ORDER BY question_number ASC')
        .bind(date)
        .all();

    if (!results || results.length === 0) {
        return jsonResponse({ error: 'No questions found for this date' }, 404);
    }

    return jsonResponse({
        date,
        day_number: results[0].day_number,
        total_questions: results.length,
        questions: results.map(formatQuestion)
    });
}

/**
 * Get questions by day number
 */
async function getQuestionsByDayNumber(db: D1Database, dayNumber: number): Promise<Response> {
    const { results } = await db
        .prepare('SELECT * FROM city_holder_answers WHERE day_number = ? ORDER BY question_number ASC')
        .bind(dayNumber)
        .all();

    if (!results || results.length === 0) {
        return jsonResponse({ error: 'No questions found for this day number' }, 404);
    }

    return jsonResponse({
        day_number: dayNumber,
        date: results[0].date,
        total_questions: results.length,
        questions: results.map(formatQuestion)
    });
}

/**
 * Search questions by text
 */
async function searchQuestions(db: D1Database, query: string): Promise<Response> {
    const searchPattern = `%${query}%`;

    const { results } = await db
        .prepare('SELECT * FROM city_holder_answers WHERE question_text LIKE ? OR correct_answer LIKE ? ORDER BY day_number DESC, question_number ASC LIMIT 50')
        .bind(searchPattern, searchPattern)
        .all();

    return jsonResponse({
        query,
        total_results: results?.length || 0,
        questions: results?.map(formatQuestion) || []
    });
}

/**
 * Format a question record for the API response
 */
function formatQuestion(record: any) {
    return {
        day_number: record.day_number,
        date: record.date,
        question_number: record.question_number,
        question: record.question_text,
        answer: record.correct_answer,
        options: [
            record.correct_answer,
            record.option_2,
            record.option_3,
            record.option_4
        ].filter(Boolean)
    };
}

/**
 * Create a JSON response with CORS headers
 */
function jsonResponse(data: any, status: number = 200): Response {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
        },
    });
}
