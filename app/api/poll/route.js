import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// WORKFLOW ID (Must match the one in run-fal)
const WORKFLOW_PATH = 'workflows/Mc-Mark/your-mood-today-v2';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('request_id');

  if (!requestId) {
    return NextResponse.json({ error: 'Missing request_id' }, { status: 400 });
  }

  try {
    // 1. Check Status on the SPECIFIC Workflow Endpoint
    // (This fixes the 405 Method Not Allowed error)
    const statusUrl = `https://queue.fal.run/${WORKFLOW_PATH}/requests/${requestId}/status`;
    
    const statusResponse = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!statusResponse.ok) {
      // If still failing, try the generic endpoint as fallback, or return error
      const errText = await statusResponse.text();
      throw new Error(`FAL Status Error (${statusResponse.status}): ${errText}`);
    }

    const statusData = await statusResponse.json();

    // 2. Handle Completion
    if (statusData.status === 'COMPLETED') {
      // The result URL is usually provided in the status payload as 'response_url'
      // If not, we construct the standard result endpoint
      const responseUrl = statusData.response_url || `https://queue.fal.run/${WORKFLOW_PATH}/requests/${requestId}`;

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

    // 3. Return In-Progress Status
    return NextResponse.json({ 
      status: statusData.status, // 'IN_QUEUE', 'IN_PROGRESS'
      logs: statusData.logs || []
    });

  } catch (error) {
    console.error('Poll Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}