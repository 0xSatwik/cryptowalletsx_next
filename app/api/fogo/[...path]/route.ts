import { NextRequest, NextResponse } from 'next/server';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Handle GET requests
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const path = params.path.join('/');
    
    // Validate required parameters
    const address = searchParams.get('address');
    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { 
          status: 400,
          headers: corsHeaders 
        }
      );
    }

    // Build the Fogo API URL
    let fogoApiUrl = `https://api.fogoscan.com/v1/${path}`;
    
    // Add query parameters
    const queryParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      queryParams.append(key, value);
    });
    
    if (queryParams.toString()) {
      fogoApiUrl += `?${queryParams.toString()}`;
    }

    // Make request to Fogo API
    const fogoResponse = await fetch(fogoApiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'NextJS-Fogo-Proxy/1.0',
        'Accept': 'application/json',
      },
    });

    if (!fogoResponse.ok) {
      throw new Error(`Fogo API responded with status: ${fogoResponse.status}`);
    }

    const data = await fogoResponse.json();

    // Return the data with CORS headers
    return NextResponse.json(data, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=30', // Cache for 30 seconds
      },
    });

  } catch (error) {
    console.error('Error proxying Fogo API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch data from Fogo API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: corsHeaders 
      }
    );
  }
}
