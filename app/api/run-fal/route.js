import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// THE WORKFLOW ID (Hardcoded to match your specific FAL app)
const WORKFLOW_ID = 'workflows/Mc-Mark/your-mood-today-v2';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { upload_your_portrait, user_id } = body;

    // 1. Validation
    if (!upload_your_portrait || !user_id) {
      return NextResponse.json({ error: 'Missing inputs' }, { status: 400 });
    }

    // 2. Credit Check & Deduction
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user_id)
      .single();

    if (!profile || profile.credits < 20) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    await supabase
      .from('profiles')
      .update({ credits: profile.credits - 20 })
      .eq('id', user_id);

    // 3. Trigger FAL (Using the specific workflow URL)
    const falResponse = await fetch(`https://queue.fal.run/${WORKFLOW_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ upload_your_portrait }),
    });

    if (!falResponse.ok) {
      const errText = await falResponse.text();
      return NextResponse.json({ error: `FAL Error: ${errText}` }, { status: falResponse.status });
    }

    const falData = await falResponse.json();

    // 4. Return ONLY the request_id. 
    // The backend poller will handle the URLs from now on.
    return NextResponse.json({ 
      success: true, 
      request_id: falData.request_id 
    });

  } catch (error) {
    console.error('Trigger Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}