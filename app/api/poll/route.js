import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  // 1. Security: Allow all FAL domains (API & Storage)
  const ALLOWED_DOMAINS = [
    'queue.fal.run',
    'fal.media',
    'v3.fal.media',
    'fal-cdn.com'
  ];

  try {
    const targetUrlObj = new URL(url);
    if (!ALLOWED_DOMAINS.some(domain => targetUrlObj.hostname.endsWith(domain))) {
      return NextResponse.json({ error: 'Invalid URL domain' }, { status: 403 });
    }
  } catch (e) {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }

  try {
    // 2. Relay the request
    // We remove content-type headers to avoid confusing the result fetch
    const falResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Accept': 'application/json',
      },
    });

    // 3. Return the Raw Text (safer than parsing JSON here)
    const data = await falResponse.text();

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