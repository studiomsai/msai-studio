import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // 1. Parse Input
    const body = await request.json();
    
    // 2. (Optional) Verify Credits here via Supabase before running...

    // 3. Send to FAL Queue
    // Note: Use queue.fal.run for async jobs
    const response = await fetch(`https://queue.fal.run/workflows/Mc-Mark/your-mood-today-v2`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body), // Pass the frontend inputs (image_url, etc.)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `FAL Error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();

    // 4. Return the Request ID to the frontend
    return NextResponse.json({ 
      success: true, 
      request_id: data.request_id 
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}