
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { address: string } }
) {
    const address = params.address;

    if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://explore.tempo.xyz/api/address/txs-count/${address}`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        });

        if (!response.ok) {
            throw new Error(`Tempo API Error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching txs count:', error);
        return NextResponse.json({ error: 'Failed to fetch transaction count' }, { status: 500 });
    }
}
