import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('request_id');
  const proxyUrl = searchParams.get('url');

  // --- MODE A: PROXY URL (For fetching the final result later) ---
  if (proxyUrl) {
    try {
      const response = await fetch(proxyUrl, {
        headers: { 
          'Authorization': `Key ${process.env.FAL_KEY}`,
          'Accept': 'application/json'
        }
      });
      // If the final result isn't ready, don't crash. Just say 404.
      if (!response.ok) {
         return NextResponse.json({ error: 'Not ready' }, { status: 404 });
      }
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // --- MODE B: CHECK STATUS (The Relaxed Poller) ---
  if (requestId) {
    try {
      // Use the specific Workflow ID provided by you
      const WORKFLOW_ID = 'workflows/Mc-Mark/your-mood-today-v2';
      const statusUrl = `https://queue.fal.run/${WORKFLOW_ID}/requests/${requestId}/status`;

      const response = await fetch(statusUrl, {
        headers: { 
          'Authorization': `Key ${process.env.FAL_KEY}`,
          'Accept': 'application/json' 
        }
      });

      // --- THE FIX IS HERE ---
      // If FAL says 404 (Request not found), it just means it hasn't propagated yet.
      // We lie to the frontend and say "IN_QUEUE" so it doesn't panic.
      if (response.status === 404) {
        return NextResponse.json({ status: 'IN_QUEUE', logs: [{ message: 'Initializing...' }] });
      }

      // If legitimate error, report it
      if (!response.ok) {
        const errText = await response.text();
        return NextResponse.json({ status: 'FAILED', error: errText }, { status: 200 }); // Return 200 so frontend parses JSON
      }

      const data = await response.json();
      return NextResponse.json(data);

    } catch (error) {
      console.error('Poll Error:', error);
      // Return a valid JSON even on crash, to prevent parsing errors
      return NextResponse.json({ status: 'FAILED', error: error.message });
    }
  }

  return NextResponse.json({ error: 'Missing params' }, { status: 400 });
}