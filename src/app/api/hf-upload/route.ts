import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // We only need to check if data exists, no Token needed!
    if (!body.content_url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Ready to save' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 500 });
  }
}
