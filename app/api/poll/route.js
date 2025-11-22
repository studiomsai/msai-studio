import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  try {
    // 1. Relay the request directly to FAL
    const falResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Accept': 'application/json',
      },
    });

    // 2. Get the raw body (text) so we don't crash on JSON parsing errors
    const data = await falResponse.text();

    // 3. Return exactly what FAL returned (Status + Body)
    return new NextResponse(data, {
      status: falResponse.status,
      headers: {
        'Content-Type': falResponse.headers.get('Content-Type') || 'application/json',
      },
    });

  } catch (error) {
    console.error('Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}