import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Ensure this ID matches your FAL URL exactly
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

    // 2. Credit Check
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user_id)
      .single();

    if (!profile || profile.credits < 20) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    // 3. Deduct Credits
    await supabase
      .from('profiles')
      .update({ credits: profile.credits - 20 })
      .eq('id', user_id);

    // 4. Trigger FAL
    // FIX: We wrap the data in "input" because Workflow V2 requires it.
    const falResponse = await fetch(`https://queue.fal.run/${WORKFLOW_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        input: {
            upload_your_portrait: upload_your_portrait
        }
      }),
    });

    if (!falResponse.ok) {
      const errText = await falResponse.text();
      // Refund credits if launch failed
      await supabase.from('profiles').update({ credits: profile.credits }).eq('id', user_id);
      return NextResponse.json({ error: `FAL Launch Error: ${errText}` }, { status: falResponse.status });
    }

    const falData = await falResponse.json();

    return NextResponse.json({ 
      success: true, 
      request_id: falData.request_id 
    });

  } catch (error) {
    console.error('Trigger Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}