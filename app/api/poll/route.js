import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  // We now expect a full URL, not just an ID
  const targetUrl = searchParams.get('url'); 

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  // Security: Ensure we are only proxying requests to FAL
  if (!targetUrl.startsWith('https://queue.fal.run/')) {
    return NextResponse.json({ error: 'Invalid URL domain' }, { status: 403 });
  }

  try {
    console.log(`Proxying to FAL: ${targetUrl}`);
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Poll Failed (${response.status}):`, errText);
      return NextResponse.json({ status: 'FAILED', error: errText }, { status: response.status });
    }

    const data = await response.json();

    // Handle Completion: If done, fetch the result if it's a separate URL
    if (data.status === 'COMPLETED') {
      // If the result is at a different URL (response_url), fetch that too
      if (data.response_url && data.response_url !== targetUrl) {
        const resultRes = await fetch(data.response_url, {
          headers: { 'Authorization': `Key ${process.env.FAL_KEY}` }
        });
        const resultData = await resultRes.json();
        return NextResponse.json({ status: 'COMPLETED', data: resultData });
      }
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}