import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// MUST MATCH THE RUN ROUTE ID
const WORKFLOW_ID = 'workflows/Mc-Mark/your-mood-today-v2';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('request_id');

  if (!requestId) {
    return NextResponse.json({ error: 'Missing request_id' }, { status: 400 });
  }

  try {
    // 1. Construct the Status URL specific to this workflow
    const statusUrl = `https://queue.fal.run/${WORKFLOW_ID}/requests/${requestId}/status`;

    const statusResponse = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!statusResponse.ok) {
      // Fallback: Try the global endpoint if the specific one fails (Handles API variations)
      const fallbackUrl = `https://queue.fal.run/requests/${requestId}/status`;
      console.log(`Specific status check failed, trying global: ${fallbackUrl}`);
      
      const fallbackResponse = await fetch(fallbackUrl, {
         method: 'GET',
         headers: { 'Authorization': `Key ${process.env.FAL_KEY}`, 'Accept': 'application/json' }
      });

      if (!fallbackResponse.ok) {
         const errText = await fallbackResponse.text();
         throw new Error(`FAL Status Error: ${errText}`);
      }
      // If fallback worked, use that data
      var statusData = await fallbackResponse.json();
    } else {
      var statusData = await statusResponse.json();
    }

    // 2. JOB COMPLETED? -> FETCH RESULT INTERNALLY
    if (statusData.status === 'COMPLETED') {
      
      // Determine Result URL
      const responseUrl = statusData.response_url || `https://queue.fal.run/${WORKFLOW_ID}/requests/${requestId}`;
      
      console.log(`Job Completed. Fetching Result from: ${responseUrl}`);

      const resultResponse = await fetch(responseUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Key ${process.env.FAL_KEY}`,
          'Accept': 'application/json',
        },
      });

      if (!resultResponse.ok) {
        throw new Error('Failed to fetch final JSON result from FAL');
      }

      const resultData = await resultResponse.json();

      return NextResponse.json({ 
        status: 'COMPLETED', 
        data: resultData 
      });
    }

    // 3. JOB STILL RUNNING
    return NextResponse.json({ 
      status: statusData.status,
      logs: statusData.logs || []
    });

  } catch (error) {
    console.error('Poll Error:', error);
    // Return a clean JSON error so the frontend doesn't crash parsing HTML
    return NextResponse.json({ status: 'FAILED', error: error.message }, { status: 500 });
  }
}