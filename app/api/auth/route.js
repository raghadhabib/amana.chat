// app/api/auth/route.js

import * as Ably from 'ably'; // <-- Use this consistent import
import { NextResponse } from 'next/server';

export async function GET(request) {
    // 1. Check for API key in environment variables
    if (!process.env.ABLY_API_KEY) {
        return NextResponse.json(
            { error: 'ABLY_API_KEY environment variable not set' },
            { status: 500 }
        );
    }

    // 2. Use the REST.Promise client for server-side token generation
    const client = new Ably.Rest.Promise({ // <--- Changed to Rest.Promise
        key: process.env.ABLY_API_KEY,
    });
    
    // Attempt to get the clientId from the request URL/query parameters
    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');
    
    // Check if clientId is provided (using the one hardcoded in the client)
    if (!clientId) {
        // Fallback for production safety, but the client should always send one
        const fallbackClientId = 'anonymous-' + Math.random().toString(36).substring(2, 9);
        console.warn(`No clientId provided. Using fallback: ${fallbackClientId}`);
    }

    // 3. Create a token request
    const tokenRequest = await client.auth.createTokenRequest({
        clientId: clientId || 'anonymous-user', 
    });

    return NextResponse.json(tokenRequest);
}