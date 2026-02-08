/**
 * Cloudflare Worker to proxy Fogo API requests and handle CORS
 * Deploy this to Cloudflare Workers and use the worker URL in your frontend
 */

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Handle CORS preflight requests
function handleOptions(request) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Main request handler
async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const searchParams = url.searchParams;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });
  }

  try {
    let fogoApiUrl;
    
    // Route different endpoints
    if (path === '/account') {
      const address = searchParams.get('address');
      if (!address) {
        return new Response(JSON.stringify({ error: 'Address parameter is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      fogoApiUrl = `https://api.fogoscan.com/v1/account?address=${address}`;
      
    } else if (path === '/account/stake/total') {
      const address = searchParams.get('address');
      if (!address) {
        return new Response(JSON.stringify({ error: 'Address parameter is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      fogoApiUrl = `https://api.fogoscan.com/v1/account/stake/total?address=${address}`;
      
    } else if (path === '/account/domain') {
      const address = searchParams.get('address');
      if (!address) {
        return new Response(JSON.stringify({ error: 'Address parameter is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      fogoApiUrl = `https://api.fogoscan.com/v1/account/domain?address=${address}`;
      
    } else if (path === '/account/tokens') {
      const address = searchParams.get('address');
      if (!address) {
        return new Response(JSON.stringify({ error: 'Address parameter is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      fogoApiUrl = `https://api.fogoscan.com/v1/account/tokens?address=${address}`;
      
    } else if (path === '/account/transaction') {
      const address = searchParams.get('address');
      const pageSize = searchParams.get('page_size') || '40';
      const before = searchParams.get('before');
      const page = searchParams.get('page');

      if (!address) {
        return new Response(JSON.stringify({ error: 'Address parameter is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      fogoApiUrl = `https://api.fogoscan.com/v1/account/transaction?address=${address}&page_size=${pageSize}`;
      if (before) fogoApiUrl += `&before=${before}`;
      if (page) fogoApiUrl += `&page=${page}`;
      
    } else {
      return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Make request to Fogo API
    const fogoResponse = await fetch(fogoApiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Cloudflare-Worker-Fogo-Proxy/1.0',
        'Accept': 'application/json',
      },
    });

    if (!fogoResponse.ok) {
      throw new Error(`Fogo API responded with status: ${fogoResponse.status}`);
    }

    const data = await fogoResponse.json();

    // Return the data with CORS headers
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30', // Cache for 30 seconds
      },
    });

  } catch (error) {
    console.error('Error proxying Fogo API:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch data from Fogo API',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Cloudflare Worker event listener
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// For newer Workers runtime
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request);
  },
};
