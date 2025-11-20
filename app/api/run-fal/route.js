import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Supabase with the SECRET key (Server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, appId, inputs } = body

    // 1. Define App Costs & AI Models
    const apps = {
      'mood': { 
        cost: 20, 
        id: 'fal-ai/fast-animated-diff/text-to-video' 
      },
      'photo': { 
        cost: 15, 
        id: 'fal-ai/flux-lora' 
      },
      'story': { 
        cost: 32, 
        id: 'fal-ai/fast-svd' 
      }
    }

    const selectedApp = apps[appId]
    if (!selectedApp) {
      return NextResponse.json({ error: 'Invalid App Selection' }, { status: 400 })
    }

    // 2. Check User Credits in Database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    if (profile.credits < selectedApp.cost) {
      return NextResponse.json({ error: 'Not enough credits. Please top up.' }, { status: 402 })
    }

    // 3. Deduct Credits (Charge the user)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: profile.credits - selectedApp.cost })
      .eq('id', userId)

    if (updateError) {
      return NextResponse.json({ error: 'Transaction failed' }, { status: 500 })
    }

    // 4. Call FAL.AI (The AI Generation)
    // We use the fal-client proxy approach or direct fetch here. 
    // Direct fetch is safer for keeping keys hidden.
    const falResponse = await fetch(`https://queue.fal.run/${selectedApp.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(inputs)
    })

    const falResult = await falResponse.json()

    // Note: FAL returns a request_id immediately. 
    // The frontend will use this to check when the video is done.
    
    return NextResponse.json({ 
      success: true, 
      data: falResult,
      remainingCredits: profile.credits - selectedApp.cost 
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}