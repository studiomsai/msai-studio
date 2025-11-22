import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('request_id');
  const proxyUrl = searchParams.get('url');

  // --- MODE A: PROXY URL (For fetching the final result from fal.media) ---
  if (proxyUrl) {
    try {
      // Validate URL to ensure it is a FAL domain
      const targetObj = new URL(proxyUrl);
      if (!targetObj.hostname.endsWith('fal.run') && !targetObj.hostname.endsWith('fal.media')) {
         return NextResponse.json({ error: 'Invalid domain' }, { status: 403 });
      }

      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: { 
          'Authorization': `Key ${process.env.FAL_KEY}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Proxy Fetch Failed: ${response.status}`);
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Proxy Mode Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // --- MODE B: CHECK STATUS (Using request_id) ---
  if (requestId) {
    try {
      // 1. Try the Specific Workflow Status URL first
      const WORKFLOW_ID = 'workflows/Mc-Mark/your-mood-today-v2';
      const statusUrl = `https://queue.fal.run/${WORKFLOW_ID}/requests/${requestId}/status`;

      let response = await fetch(statusUrl, {
        method: 'GET',
        headers: { 
          'Authorization': `Key ${process.env.FAL_KEY}`,
          'Accept': 'application/json' 
        }
      });

      // 2. Fallback: If specific fails (404), try the Global Status URL
      if (!response.ok) {
        console.log('Specific status check failed, trying global...');
        const globalUrl = `https://queue.fal.run/requests/${requestId}/status`;
        response = await fetch(globalUrl, {
          method: 'GET',
          headers: { 
            'Authorization': `Key ${process.env.FAL_KEY}`, 
            'Accept': 'application/json' 
          }
        });
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`FAL Status Error: ${errText}`);
      }

      // 3. Return the Status JSON exactly as FAL sent it
      const data = await response.json();
      return NextResponse.json(data);

    } catch (error) {
      console.error('Status Check Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Missing request_id or url' }, { status: 400 });
}