import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { address: string } }
) {
    try {
        const { address } = params;

        // Validate address format
        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return NextResponse.json(
                { error: 'Invalid Ethereum address' },
                { status: 400 }
            );
        }

        // Fetch total value from Tempo Chain API
        const response = await fetch(
            `https://explore.tempo.xyz/api/address/total-value/${address}`,
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
        console.error('Error fetching total value:', error);
        return NextResponse.json(
            { error: 'Failed to fetch total value' },
            { status: 500 }
        );
    }
}
