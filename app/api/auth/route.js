import Ably from 'ably/promises';
import { NextResponse } from 'next/server';

export async function GET(request) {
  // 1. Get a unique client ID from the request (e.g., from your auth provider, or a temporary ID)
  const url = new URL(request.url);
  const clientId = url.searchParams.get('clientId') || 'anonymous-user';

  if (!process.env.ABLY_API_KEY) {
    return NextResponse.json({ error: 'ABLY_API_KEY not set' }, { status: 500 });
  }

  // 2. Initialize the Ably Rest client using your private API key
  const client = new Ably.Rest(process.env.ABLY_API_KEY);

  // 3. Create a Token Request with the specific client ID and capabilities
  const tokenRequest = await client.auth.createTokenRequest({
    clientId: clientId,
    capability: {
      // Allow publishing and subscribing on the 'chat:*' channel set
      'chat:*': ['publish', 'subscribe', 'presence', 'history'],
    },
    // Optional: set a shorter TTL for better security (e.g., 30 minutes)
    // ttl: 1800000 
  });

  // 4. Return the Token Request data
  return NextResponse.json(tokenRequest);
}