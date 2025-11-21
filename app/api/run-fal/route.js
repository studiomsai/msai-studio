import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Init Supabase Admin (Server-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  let userId, cost = 0;

  try {
    const body = await request.json()
    const { appId, inputs } = body
    userId = body.userId

    // 1. Define Real App Configs
    const apps = {
      'mood': { 
        cost: 20, 
        id: 'workflows/Mc-Mark/your-mood-today-video' // Your Real Workflow
      },
      'photo': { 
        cost: 15, 
        id: 'fal-ai/flux-lora' // Placeholder for now
      },
      'story': { 
        cost: 32, 
        id: 'fal-ai/fast-svd' // Placeholder for now
      }
    }

    const selectedApp = apps[appId]
    if (!selectedApp) return NextResponse.json({ error: 'Invalid App' }, { status: 400 })
    
    cost = selectedApp.cost // Track cost for refunding

    // 2. Check & Deduct Credits
    const { data: profile } = await supabase.from('profiles').select('credits').eq('id', userId).single()
    
    if (!profile || profile.credits < cost) {
      return NextResponse.json({ error: 'Not enough credits' }, { status: 402 })
    }

    // Charge the user immediately
    await supabase.from('profiles').update({ credits: profile.credits - cost }).eq('id', userId)

    // 3. Call FAL.AI
    const response = await fetch(`https://queue.fal.run/${selectedApp.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(inputs)
    })
    
    const falResult = await response.json()

    // 4. CHECK FOR ERRORS (The Safety Net)
    // If FAL says error, or if the status isn't 200
    if (!response.ok || falResult.error) {
      throw new Error(falResult.error || "AI Generation Failed")
    }
    
    // Success!
    return NextResponse.json({ success: true, data: falResult })

  } catch (error) {
    console.error("Backend Error:", error)

    // REFUND LOGIC
    if (userId && cost > 0) {
      const { data: refundProfile } = await supabase.from('profiles').select('credits').eq('id', userId).single()
      if (refundProfile) {
        await supabase.from('profiles').update({ credits: refundProfile.credits + cost }).eq('id', userId)
        console.log(`Refunded ${cost} credits to ${userId}`)
      }
    }

    return NextResponse.json({ error: error.message || "Something went wrong. Credits have been refunded." }, { status: 500 })
  }
}