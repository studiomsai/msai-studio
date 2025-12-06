import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('request_id');
  const proxyUrl = searchParams.get('url');

  // --- MODE A: PROXY URL (Fix for 500 Errors) ---
  if (proxyUrl) {
    try {
      const targetUrl = new URL(proxyUrl);
      const headers = { Accept: 'application/json' };

      // Only attach FAL_KEY for fal.run / fal.ai endpoints
      if (
        targetUrl.hostname.endsWith('fal.run') ||
        targetUrl.hostname.endsWith('fal.ai')
      ) {
        headers.Authorization = `Key ${process.env.FAL_KEY}`;
      } else {
        console.log('External Storage URL detected. Stripping Auth headers.');
      }

      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errText = await response.text();
        return NextResponse.json(
          { error: `Upstream Error ${response.status}: ${errText}` },
          { status: response.status }
        );
      }

      const rawText = await response.text();

      try {
        return NextResponse.json(JSON.parse(rawText));
      } catch {
        return NextResponse.json(
          {
            error: 'Received non-JSON response',
            raw: rawText.substring(0, 200)
          },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Proxy Fatal Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // --- MODE B: CHECK STATUS (Standard Polling) ---
  if (requestId) {
    try {
      const WORKFLOW_ID = 'workflows/Mc-Mark/your-mood-today-v2';
      const statusUrl = `https://queue.fal.run/${WORKFLOW_ID}/requests/${requestId}/status`;

      let response = await fetch(statusUrl, {
        headers: {
          Authorization: `Key ${process.env.FAL_KEY}`,
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        const fallbackUrl = `https://queue.fal.run/requests/${requestId}/status`;
        response = await fetch(fallbackUrl, {
          headers: {
            Authorization: `Key ${process.env.FAL_KEY}`,
            Accept: 'application/json'
          }
        });
      }

      if (response.status === 404) {
        return NextResponse.json({ status: 'IN_QUEUE', logs: [] });
      }

      if (!response.ok) {
        const errText = await response.text();
        return NextResponse.json(
          { status: 'FAILED', error: errText },
          { status: 200 }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({ status: 'FAILED', error: error.message });
    }
  }

  return NextResponse.json(
    { error: 'Missing request_id or url' },
    { status: 400 }
  );
}
