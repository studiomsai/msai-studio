import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('request_id');

  if (!requestId) {
    return NextResponse.json({ error: 'Missing request_id' }, { status: 400 });
  }

  try {
    // 1. Check Status
    const statusUrl = `https://queue.fal.run/requests/${requestId}/status`;
    const statusResponse = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!statusResponse.ok) {
      throw new Error(`FAL Status Error: ${statusResponse.statusText}`);
    }

    const statusData = await statusResponse.json();

    // 2. Handle Status
    if (statusData.status === 'COMPLETED') {
      // The job is done. The result is usually at the response_url, 
      // or sometimes included in the status payload depending on endpoint.
      // Standard Queue behavior: Fetch the response_url.
      
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

    // 3. If not complete (IN_QUEUE, IN_PROGRESS), just return the status
    return NextResponse.json({ 
      status: statusData.status,
      logs: statusData.logs || null
    });

  } catch (error) {
    console.error('Poll Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}