'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Client (Frontend)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Dashboard() {
  const [session, setSession] = useState(null)
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  
  // Check if user is logged in when page loads
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if(session) fetchCredits(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if(session) fetchCredits(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchCredits(userId) {
    const { data } = await supabase.from('profiles').select('credits').eq('id', userId).single()
    if(data) setCredits(data.credits)
  }

  async function handleLogin() {
    await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
  }

  async function handleRunApp(appId) {
    setLoading(true)
    setStatus('Initializing secure run...')
    setResult(null)
    
    // For this demo, we use a default prompt. 
    // In the final version, we will add input fields for each app.
    const inputs = { prompt: "A futuristic fashion photoshoot, 8k resolution, photorealistic" }

    try {
      const res = await fetch('/api/run-fal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          appId: appId,
          inputs: inputs
        })
      })

      const data = await res.json()

      if(data.error) {
        alert("Error: " + data.error)
        setStatus('Failed.')
      } else {
        setStatus('Generation Request Sent!')
        setResult(data)
        // Refresh credits to show the deduction
        fetchCredits(session.user.id) 
      }
    } catch (e) {
      alert("System Error")
    }
    setLoading(false)
  }

  // --- VIEW 1: NOT LOGGED IN ---
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 pt-20">
        <div className="bg-white p-10 rounded-xl shadow-xl text-center max-w-md mx-4">
          <h2 className="text-3xl font-bold mb-4">Welcome to MSAI</h2>
          <p className="mb-8 text-slate-500">Creating an account is free and without obligation.</p>
          <button 
            onClick={handleLogin} 
            className="w-full bg-white border border-slate-300 p-4 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-3 font-medium transition hover:shadow-md"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6"/>
            Sign up with Google
          </button>
        </div>
      </div>
    )
  }

  // --- VIEW 2: LOGGED IN DASHBOARD ---
  return (
    <div className="max-w-6xl mx-auto pt-32 px-5 pb-20 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-slate-200 pb-6">
        <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-slate-500">Logged in as {session.user.email}</p>
        </div>
        <div className="text-right mt-4 md:mt-0">
            <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Available Credits</div>
            <div className="text-5xl font-bold text-blue-600">{credits}</div>
            <a href="/shop" className="text-sm text-blue-500 hover:underline">+ Buy More</a>
        </div>
      </div>

      {/* App Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {[ 
          {id: 'mood', name: 'Your Mood Today', cost: 20, icon: '😊', desc: 'Selfie to Animation'},
          {id: 'photo', name: 'Pro Photoshoot', cost: 15, icon: '📸', desc: 'AI Fashion Photography'},
          {id: 'story', name: 'Story to Video', cost: 32, icon: '🎬', desc: 'Script to Movie'}
        ].map(app => (
          <div key={app.id} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-lg hover:shadow-2xl transition duration-300">
            <div className="text-4xl mb-4">{app.icon}</div>
            <h3 className="font-bold text-2xl mb-2">{app.name}</h3>
            <p className="text-slate-500 mb-6">{app.desc}</p>
            <div className="flex justify-between items-center">
                <span className="font-bold text-blue-600">{app.cost} Credits</span>
                <button 
                    onClick={() => handleRunApp(app.id)} 
                    disabled={loading || credits < app.cost}
                    className="bg-slate-900 text-white px-6 py-2 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    {loading ? 'Working...' : 'Run App'}
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* Results Area */}
      {status && (
        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in">
          <h3 className="font-bold text-lg mb-2">Status: <span className="text-blue-600">{status}</span></h3>
          {result && (
            <div className="mt-4">
                <p className="text-green-600 font-medium">Success! The job has been sent to the AI Engine.</p>
                <div className="bg-slate-900 text-slate-200 p-4 rounded mt-2 text-xs overflow-auto font-mono">
                    {JSON.stringify(result, null, 2)}
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}