import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase (Service Role required for credit updates if you have them)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const dynamic = 'force-dynamic'; // Prevent caching

export async function POST(request) {
  try {
    // 1. Parse inputs from the frontend
    const body = await request.json();
    
    // (Optional) Credit Deduction Logic would go here
    // const { user_id } = body;
    // ... supabase deduction ...

    // 2. Send request to FAL Queue
    // Note: We use 'queue.fal.run' for async processing
    const falResponse = await fetch(`https://queue.fal.run/workflows/Mc-Mark/your-mood-today-v2`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Forward the inputs (specifically 'upload_your_portrait')
      body: JSON.stringify(body), 
    });

    // 3. Handle FAL Errors
    if (!falResponse.ok) {
      const errorText = await falResponse.text();
      console.error('FAL Error:', errorText);
      return NextResponse.json(
        { error: `FAL Failed: ${errorText}` }, 
        { status: falResponse.status }
      );
    }

    // 4. Parse the FAL JSON response
    const falData = await falResponse.json();

    // 5. Return the request_id to the frontend
    // IMPORTANT: This key name must match what the frontend expects
    return NextResponse.json({ 
      success: true, 
      request_id: falData.request_id 
    });

  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}