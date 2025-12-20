import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Force this route to be dynamic (very important)
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs' // ensure env vars work properly

export async function POST(req) {
  console.log(`Payment success webhook triggered [${new Date().toLocaleString('en-GB', { hour12: false }).replace(/\//g, '-').replace(',', '')}]`);
  // Initialize SDKs inside the handler (fixes Vercel build crash)
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  let event

  try {
    if (!endpointSecret) throw new Error('Missing Stripe Webhook Secret')
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.client_reference_id
    const amountTotal = session.amount_total

    if (userId) {
      let creditsToAdd = 0
      if (amountTotal === 900) creditsToAdd = 100
      if (amountTotal === 2500) creditsToAdd = 300
      if (amountTotal === 7900) creditsToAdd = 1000

      if (creditsToAdd > 0) {
        const { data: profile } = await supabase
          .from('users')
          .select('available_credits')
          .eq('id', userId)
          .single()

        const currentCredits = profile ? profile.credits : 0

        await supabase
          .from('users')
          .update({ available_credits: currentCredits + creditsToAdd })
          .eq('id', userId)
      }
    }
  }

  return NextResponse.json({ received: true })
}
