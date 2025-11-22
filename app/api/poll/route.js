import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('request_id');
  const proxyUrl = searchParams.get('url');

  // --- MODE A: PROXY URL (Get Result) ---
  if (proxyUrl) {
    try {
      const response = await fetch(proxyUrl, {
        headers: { 
          'Authorization': `Key ${process.env.FAL_KEY}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errText = await response.text();
        return NextResponse.json({ error: `Upstream Error ${response.status}: ${errText}` }, { status: response.status });
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // --- MODE B: CHECK STATUS ---
  if (requestId) {
    try {
      const WORKFLOW_ID = 'workflows/Mc-Mark/your-mood-today-v2';
      const statusUrl = `https://queue.fal.run/${WORKFLOW_ID}/requests/${requestId}/status`;

      let response = await fetch(statusUrl, {
        headers: { 
          'Authorization': `Key ${process.env.FAL_KEY}`,
          'Accept': 'application/json' 
        }
      });

      // Fallback to global status if specific fails
      if (!response.ok) {
         const globalUrl = `https://queue.fal.run/requests/${requestId}/status`;
         response = await fetch(globalUrl, {
            headers: { 'Authorization': `Key ${process.env.FAL_KEY}`, 'Accept': 'application/json' }
         });
      }

      // FIX: If 404, it means "Not Ready Yet", NOT "Error". Return IN_QUEUE.
      if (response.status === 404) {
        return NextResponse.json({ status: 'IN_QUEUE', logs: [] });
      }

      if (!response.ok) {
        const errText = await response.text();
        return NextResponse.json({ status: 'FAILED', error: errText }, { status: 200 });
      }

      const data = await response.json();
      return NextResponse.json(data);

    } catch (error) {
      return NextResponse.json({ status: 'FAILED', error: error.message });
    }
  }

  return NextResponse.json({ error: 'Missing request_id or url' }, { status: 400 });
}