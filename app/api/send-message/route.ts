import { NextResponse } from 'next/server';

let messageStore: {
  user: string;
  text: string;
  timestamp: number;
}[] = [];

export async function GET() {
  return NextResponse.json(messageStore);
}

export async function POST(request: Request) {
  try {
    const msg = await request.json();
    if (!msg.text || !msg.user) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    messageStore.push(msg);
    return NextResponse.json(msg);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}
