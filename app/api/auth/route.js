import * as Ably from 'ably';
import { NextResponse } from 'next/server';

export async function GET(request) {
  if (!process.env.ABLY_API_KEY) {
    return NextResponse.json({ error: 'ABLY_API_KEY not set' }, { status: 500 });
  }

  const client = new Ably.Rest.Promise({ key: process.env.ABLY_API_KEY });

  const url = new URL(request.url);
  const clientId = url.searchParams.get('clientId') || 'anonymous-user';

  const tokenRequest = await client.auth.createTokenRequest({ clientId });

  return NextResponse.json(tokenRequest);
}
