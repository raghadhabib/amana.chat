import { NextResponse } from "next/server";
import Ably from "ably";

const client = new Ably.Rest({
  key: process.env.API_KEY!, // Make sure to set this in .env
});

export async function GET() {
  const tokenRequest = await client.auth.createTokenRequest({
    clientId: `user-${Math.random().toString(36).slice(2)}`, // unique user ID
  });

  return NextResponse.json(tokenRequest);
}
