import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('request_id');
  const proxyUrl = searchParams.get('url');

  // --- MODE A: PROXY URL (Fetching the Result) ---
  if (proxyUrl) {
    try {
      console.log(`Proxying fetch to: ${proxyUrl}`);
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: { 
          'Authorization': `Key ${process.env.FAL_KEY}`,
          'Accept': 'application/json'
        }
      });
      
      // 1. Get Raw Text first (Prevents JSON parse crashes)
      const rawText = await response.text();

      // 2. If Upstream failed, return the error text safely
      if (!response.ok) {
        console.error(`Upstream Error (${response.status}):`, rawText);
        return NextResponse.json(
          { error: `Upstream FAL Error ${response.status}: ${rawText}` }, 
          { status: response.status } // Pass the real status (e.g. 404, 403), not 500
        );
      }
      
      // 3. Try to parse as JSON (Expected behavior)
      try {
        const data = JSON.parse(rawText);
        return NextResponse.json(data);
      } catch (e) {
        // 4. If it's not JSON (e.g. it's the video file itself?), return details
        console.warn("Upstream returned non-JSON:", rawText.substring(0, 100));
        return NextResponse.json({ 
            status: 'COMPLETED_NON_JSON', 
            raw_content: rawText.substring(0, 500) // Send snippet for debugging
        });
      }

    } catch (error) {
      console.error('Proxy Fatal Error:', error);
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

      // Fallback
      if (!response.ok) {
         const globalUrl = `https://queue.fal.run/requests/${requestId}/status`;
         response = await fetch(globalUrl, {
            headers: { 'Authorization': `Key ${process.env.FAL_KEY}`, 'Accept': 'application/json' }
         });
      }

      // Handle 404 (Not Ready) -> IN_QUEUE
      if (response.status === 404) {
        return NextResponse.json({ status: 'IN_QUEUE', logs: [] });
      }

      const rawText = await response.text();
      
      if (!response.ok) {
        return NextResponse.json({ status: 'FAILED', error: rawText }, { status: 200 });
      }

      return NextResponse.json(JSON.parse(rawText));

    } catch (error) {
      return NextResponse.json({ status: 'FAILED', error: error.message });
    }
  }

  return NextResponse.json({ error: 'Missing request_id or url' }, { status: 400 });
}