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

// Helper to handle the POST request from Stripe
export async function POST(req) {
  const body = await req.text()
  
  // Next.js 15 requires awaiting headers
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  let event

  try {
    if (!endpointSecret) throw new Error('Missing Stripe Webhook Secret')
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.client_reference_id
    const amountTotal = session.amount_total

    if (userId) {
      let creditsToAdd = 0
      // Check exact amounts (900 cents = $9.00)
      if (amountTotal === 900) creditsToAdd = 100
      if (amountTotal === 2500) creditsToAdd = 300
      if (amountTotal === 7900) creditsToAdd = 1000

      if (creditsToAdd > 0) {
        const { data: profile } = await supabase.from('profiles').select('credits').eq('id', userId).single()
        const currentCredits = profile ? profile.credits : 0
        
        await supabase.from('profiles').update({ credits: currentCredits + creditsToAdd }).eq('id', userId)
        console.log(`Credits added: ${creditsToAdd} for user ${userId}`)
      }
    }
  }

  return NextResponse.json({ received: true })
}

// Add a GET method just for browser testing (Sanity Check)
export async function GET() {
  return NextResponse.json({ message: "Webhook is active. Send POST requests from Stripe." })
}