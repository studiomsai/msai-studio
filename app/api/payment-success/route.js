import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req) {
  console.log(`Payment success webhook triggered [${new Date().toLocaleString('en-GB', { hour12: false }).replace(/\//g, '-').replace(',', '')}]`)

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

  // -------------------------
  // STRIPE CHECKOUT SUCCESS
  // -------------------------
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    console.log("session : ", JSON.stringify(session))

    const userId = session.client_reference_id
    const amountTotal = session.amount_total
    const stripeSessionId = session.id
    const currency = session.currency
    const paymentStatus = session.payment_status

    if (userId) {
      let creditsToAdd = 0
      if (amountTotal === 900) creditsToAdd = 100
      if (amountTotal === 2500) creditsToAdd = 300
      if (amountTotal === 7900) creditsToAdd = 1000

      // -------------------------
      // ✅ YOUR ORIGINAL CREDIT LOGIC (UNCHANGED)
      // -------------------------
      if (creditsToAdd > 0) {
        const { data: profile, error: fetchError } = await supabase
          .from('users')
          .select('available_credit')
          .eq('id', userId)
          .single()

        console.log('profile:', profile)
        console.log('fetchError:', fetchError)

        if (!fetchError && profile) {
          const currentCredits = profile.available_credit || 0

          const { error: updateError } = await supabase
            .from('users')
            .update({ available_credit: currentCredits + creditsToAdd })
            .eq('id', userId)

          console.log('updateError:', updateError)
        }
      }

      // -------------------------
      // ✅ NEW LOGIC — SAVE PURCHASE
      // -------------------------
      if (creditsToAdd > 0) {
        // Prevent duplicate insert
        const { data: existingPurchase } = await supabase
          .from('purchases')
          .select('id')
          .eq('stripe_session_id', stripeSessionId)
          .single()

        if (!existingPurchase) {
          const { error: purchaseError } = await supabase
            .from('purchases')
            .insert([
              {
                user_id: userId,
                stripe_session_id: stripeSessionId,
                amount: amountTotal,
                credits_added: creditsToAdd,
                currency,
                payment_status: paymentStatus
              }
            ])

          console.log('purchaseError:', purchaseError || 'Purchase saved')
        } else {
          console.log('Purchase already exists — skipping insert')
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
