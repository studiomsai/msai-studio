import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req) {
  const body = await req.text()
  const sig = headers().get('stripe-signature')

  let event

  try {
    if (!endpointSecret) throw new Error('Missing Stripe Webhook Secret')
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.client_reference_id
    const amountTotal = session.amount_total // in cents

    if (userId) {
      // Calculate credits based on amount spent
      let creditsToAdd = 0
      if (amountTotal === 900) creditsToAdd = 100
      if (amountTotal === 2500) creditsToAdd = 300
      if (amountTotal === 7900) creditsToAdd = 1000

      if (creditsToAdd > 0) {
        // 1. Get current credits
        const { data: profile } = await supabase.from('profiles').select('credits').eq('id', userId).single()
        
        // 2. Update with new total
        const currentCredits = profile ? profile.credits : 0
        await supabase.from('profiles').update({ credits: currentCredits + creditsToAdd }).eq('id', userId)
        
        console.log(`Success: Added ${creditsToAdd} credits to user ${userId}`)
      }
    }
  }

  return NextResponse.json({ received: true })
}