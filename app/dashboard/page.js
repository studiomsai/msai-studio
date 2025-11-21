'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

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
  
  // Login State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [authMsg, setAuthMsg] = useState('')

  // Helper function defined BEFORE usage to satisfy Linter
  async function fetchCredits(userId) {
    const { data } = await supabase.from('profiles').select('credits').eq('id', userId).single()
    if(data) setCredits(data.credits)
  }

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

  async function handleEmailAuth(e) {
    e.preventDefault()
    setLoading(true)
    setAuthMsg('')
    
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setAuthMsg(error.message)
      else setAuthMsg("Success! You are signed up. You can now log in.")
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setAuthMsg(error.message)
    }
    setLoading(false)
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
  }

  async function handleRunApp(appId) {
    setLoading(true)
    setStatus('Initializing secure run...')
    setResult(null)
    const inputs = { prompt: "A futuristic fashion photoshoot, 8k resolution" }

    try {
      const res = await fetch('/api/run-fal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, appId, inputs })
      })
      const data = await res.json()
      if(data.error) {
        setStatus('Failed: ' + data.error)
      } else {
        setStatus('Generation Request Sent!')
        setResult(data)
        if(session?.user?.id) fetchCredits(session.user.id) 
      }
    } catch (error) { 
      console.error(error)
      setStatus("System Error") 
    }
    setLoading(false)
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 pt-20">
        <div className="bg-white p-10 rounded-xl shadow-xl text-center max-w-md w-full mx-4">
          <h2 className="text-3xl font-bold mb-2">Welcome to MSAI</h2>
          <p className="mb-8 text-slate-500">{isSignUp ? 'Create an account' : 'Sign in to continue'}</p>
          
          {authMsg && <div className="bg-blue-50 text-blue-600 p-3 mb-4 rounded text-sm">{authMsg}</div>}

          <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Email</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                className="w-full border p-3 rounded mt-1 text-slate-900 bg-white" 
                placeholder="you@example.com" 
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Password</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                className="w-full border p-3 rounded mt-1 text-slate-900 bg-white" 
                placeholder="••••••••" 
              />
            </div>
            <button disabled={loading} className="w-full bg-slate-900 text-white p-3 rounded font-bold hover:bg-slate-800 transition">
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
            </button>
          </form>

          <div className="my-6 border-t relative">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-slate-400">OR</span>
          </div>

          <button onClick={handleGoogleLogin} className="w-full border border-slate-300 p-3 rounded flex items-center justify-center gap-3 font-medium hover:bg-slate-50 transition">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google Logo" className="w-5 h-5"/>
            Continue with Google
          </button>

          <p className="mt-6 text-sm text-slate-500">
            {isSignUp ? 'Already have an account?' : 'No account yet?'} 
            <button onClick={()=>setIsSignUp(!isSignUp)} className="text-blue-600 font-bold ml-2 underline">
              {isSignUp ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pt-32 px-5 pb-20 min-h-screen">
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

      {status && (
        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
          <h3 className="font-bold text-lg mb-2">Status: <span className="text-blue-600">{status}</span></h3>
          {result && (
            <div className="mt-4">
                <p className="text-green-600 font-medium mb-2">Success! Result:</p>
                <div className="bg-slate-900 text-slate-200 p-4 rounded text-xs overflow-auto font-mono max-h-64">
                    {JSON.stringify(result, null, 2)}
                </div>
            </div>
          )}
        </div>
      )}
      
      <div className="text-center mt-20">
        <button onClick={() => supabase.auth.signOut()} className="text-slate-400 hover:text-slate-600 text-sm underline">Sign Out</button>
      </div>
    </div>
  )
}