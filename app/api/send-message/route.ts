// app/api/send-message/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Empty message' }, { status: 400 });
    }

    // Here you can integrate a database, Ably, or other logic
    console.log('Message received:', text);

    // Return response
    return NextResponse.json({ text: text.trim(), time: new Date().toISOString() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
