import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('request_id');

  // 1. Validation
  if (!requestId) {
    return NextResponse.json({ error: 'Missing request_id' }, { status: 400 });
  }

  try {
    // 2. Construct URL (Standard FAL Queue Endpoint)
    // We use the global ID endpoint which works for all V2 workflows
    const statusUrl = `https://queue.fal.run/requests/${requestId}/status`;

    console.log(`Polling FAL: ${statusUrl}`); // Logs to Vercel Console

    const statusResponse = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Accept': 'application/json',
      },
    });

    // 3. Handle Non-OK Responses (without crashing)
    if (!statusResponse.ok) {
      const errText = await statusResponse.text();
      console.error(`FAL Polling Error (${statusResponse.status}):`, errText);
      
      // Return clean JSON error instead of crashing
      return NextResponse.json({ 
        status: 'FAILED', 
        error: `FAL API Error ${statusResponse.status}: ${errText}` 
      }, { status: statusResponse.status });
    }

    const statusData = await statusResponse.json();

    // 4. Job Completed? Fetch the Result.
    if (statusData.status === 'COMPLETED') {
      // FAL V2 usually puts the result URL in 'response_url'
      // Fallback to the request endpoint if missing
      const responseUrl = statusData.response_url || `https://queue.fal.run/requests/${requestId}`;
      
      const resultResponse = await fetch(responseUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Key ${process.env.FAL_KEY}`,
          'Accept': 'application/json',
        },
      });

      const resultData = await resultResponse.json();
      
      return NextResponse.json({ 
        status: 'COMPLETED', 
        data: resultData 
      });
    }

    // 5. Job In Progress
    return NextResponse.json({ 
      status: statusData.status, // 'IN_QUEUE' or 'IN_PROGRESS'
      logs: statusData.logs || [] 
    });

  } catch (error) {
    console.error('Server Proxy Error:', error);
    // Ensure we always return JSON, even on crash
    return NextResponse.json({ 
      status: 'FAILED', 
      error: error.message 
    }, { status: 500 });
  }
}