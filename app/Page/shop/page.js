'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Shop() {
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id)
    })
  }, [])

  // Helper to attach User ID to Stripe Link
  const getLink = (baseUrl) => {
    if (!userId) return "/Page/login" // Redirect to login if not signed in
    return `${baseUrl}?client_reference_id=${userId}`
  }

  return (
    <div className="container mx-auto pt-50 pb-30 px-5 credit-section">
      <h2 className="text-2xl md:text-4xl font-medium text-center mb-6 sub-title">Buy credits. Use them anytime.</h2>
      <p className="text-center text-lg mb-10">Choose the credit pack that matches your workflow.</p>
      
      {!userId && (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-center mb-10 border border-yellow-200">
          Please <strong>Log In</strong> via the Dashboard before purchasing credits.
        </div>
      )}
      
      <div className="flex flex-wrap justify-center gap-8">
        {/* Starter Pack */}
        <div className="service-box">
          <h3 className="font-tiktok text-lg md:text-xl mb-10">Starter Pack</h3>
          <p className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2">100<span className="text-3xl font-normal ml-2">Credits</span></p>
          <div className="text-2xl font-semibold mt-4 mb-6">$9.00</div>
          <a href={getLink("https://buy.stripe.com/test_fZu7sNaZ74RB0oz86OgYU00")} className="primary-btn w-full text-center">Buy Now</a>
          <p className="text-xs mt-4 text-slate-300 text-center">*Use credits for any app. No subscriptions or hidden costs.*</p>
        </div>

        {/* Medium Pack */}
        <div className="service-box relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00C0FF] text-[#0F0F0F] text-xl px-6 py-2 rounded-full font-semibold font-tiktok">Most Popular</div>
          <h3 className="font-tiktok text-lg md:text-xl mb-10">Medium Pack</h3>
             <p className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2">300<span className="text-3xl font-normal ml-2">Credits</span></p>
          <div className="text-2xl font-semibold mt-4 mb-6">$25.00</div>
          <a href={getLink("https://buy.stripe.com/00waEZgjr97RdblfzggYU03")} className="primary-btn w-full text-center">Buy Now</a>
           <p className="text-xs mt-4 text-slate-300 text-center">*Use credits for any app. No subscriptions or hidden costs.*</p>
        </div>

        {/* Large Pack */}
        <div className="service-box">
          <h3 className="font-tiktok text-lg md:text-xl mb-10">Large Pack</h3>
          <p className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2">1000<span className="text-3xl font-normal ml-2">Credits</span></p>
          <div className="text-2xl font-semibold mt-4 mb-6">$79.00</div>
          <a href={getLink("https://buy.stripe.com/00waEZc3b5VF8V5cn4gYU04")} className="primary-btn w-full text-center">Buy Now</a>
           <p className="text-xs mt-4 text-slate-300 text-center">*Use credits for any app. No subscriptions or hidden costs.*</p>
        </div>
      </div>
    </div>
  )
}