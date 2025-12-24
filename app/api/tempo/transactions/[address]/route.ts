import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { address: string } }
) {
    try {
        const { address } = params;
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') || '1000';
        const offset = searchParams.get('offset') || '0';
        const include = searchParams.get('include') || 'all';

        // Validate address format
        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return NextResponse.json(
                { error: 'Invalid Ethereum address' },
                { status: 400 }
            );
        }

        // Fetch transactions from Tempo Chain API
        const response = await fetch(
            `https://explore.tempo.xyz/api/address/${address}?include=${include}&limit=${limit}&offset=${offset}`,
            {
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
}
