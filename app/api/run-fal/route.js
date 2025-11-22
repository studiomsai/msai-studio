import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

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

    // 1. WORKFLOW CONFIGURATION (V2)
    const apps = {
      'mood': { 
        cost: 20, 
        id: 'workflows/Mc-Mark/your-mood-today-v2' // The V2 ID
      },
      'photo': { cost: 15, id: 'fal-ai/flux-lora' },
      'story': { cost: 32, id: 'fal-ai/fast-svd' }
    }

    const selectedApp = apps[appId]
    if (!selectedApp) return NextResponse.json({ error: 'Invalid App' }, { status: 400 })
    
    cost = selectedApp.cost

    // 2. Deduct Credits
    const { data: profile } = await supabase.from('profiles').select('credits').eq('id', userId).single()
    if (!profile || profile.credits < cost) {
      return NextResponse.json({ error: 'Not enough credits' }, { status: 402 })
    }
    await supabase.from('profiles').update({ credits: profile.credits - cost }).eq('id', userId)

    // 3. Send to FAL
    const response = await fetch(`https://queue.fal.run/${selectedApp.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(inputs)
    })
    
    const falResult = await response.json()

    if (!response.ok || falResult.error) {
      throw new Error(falResult.error || "AI Generation Failed")
    }
    
    return NextResponse.json({ success: true, data: falResult })

  } catch (error) {
    console.error("Backend Error:", error)
    // Refund
    if (userId && cost > 0) {
      const { data: refundProfile } = await supabase.from('profiles').select('credits').eq('id', userId).single()
      if (refundProfile) {
        await supabase.from('profiles').update({ credits: refundProfile.credits + cost }).eq('id', userId)
      }
    }
    return NextResponse.json({ error: error.message || "Something went wrong." }, { status: 500 })
  }
}