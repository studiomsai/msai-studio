'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
// Import the official client
import { fal } from '@fal-ai/client'

// Configure the proxy
fal.config({
  proxyUrl: '/api/fal/proxy',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Dashboard() {
  const [session, setSession] = useState(null)
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  
  // Results
  const [finalImage, setFinalImage] = useState(null)
  const [finalVideo, setFinalVideo] = useState(null)
  const [rawDebug, setRawDebug] = useState(null)
  
  const [selectedFile, setSelectedFile] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [authMsg, setAuthMsg] = useState('')

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
    try {
      let result
      if (isSignUp) {
        result = await supabase.auth.signUp({ email, password })
      } else {
        result = await supabase.auth.signInWithPassword({ email, password })
      }
      if (result.error) setAuthMsg(result.error.message)
      else if (isSignUp) setAuthMsg("Success! Account created. You can log in.")
    } catch (err) {
      setAuthMsg("Error logging in.")
    }
    setLoading(false)
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
  }

  async function deductCredits(cost) {
    if (!session?.user?.id) return false
    const { data: profile } = await supabase.from('profiles').select('credits').eq('id', session.user.id).single()
    if (!profile || profile.credits < cost) {
        setStatus('Not enough credits.')
        return false
    }
    await supabase.from('profiles').update({ credits: profile.credits - cost }).eq('id', session.user.id)
    fetchCredits(session.user.id)
    return true
  }

  async function refundCredits(cost) {
    if (!session?.user?.id) return
    const { data: profile } = await supabase.from('profiles').select('credits').eq('id', session.user.id).single()
    await supabase.from('profiles').update({ credits: profile.credits + cost }).eq('id', session.user.id)
    fetchCredits(session.user.id)
    setStatus('Run failed. Credits refunded.')
  }

  // --- THE OFFICIAL FAL STREAMING LOGIC ---
  async function handleRunApp(appId) {
    if (!selectedFile && appId === 'mood') {
        alert("Please select an image first!")
        return
    }

    const cost = 20
    const paid = await deductCredits(cost)
    if (!paid) return

    setLoading(true)
    setStatus('Uploading Image...')
    setFinalImage(null)
    setFinalVideo(null)
    setRawDebug(null)

    try {
      let imageUrl = null
      if (selectedFile) {
          // 1. Upload using official storage (No 413 Error)
          imageUrl = await fal.storage.upload(selectedFile)
      }

      setStatus('Streaming workflow...')

      // 2. Use fal.stream (The official way)
      const stream = await fal.stream("workflows/Mc-Mark/your-mood-today-v2", {
        input: {
          upload_your_portrait: imageUrl // Exact key from your V2 workflow
        }
      });

      // 3. Listen for logs and partial results
      for await (const event of stream) {
        if (event.logs && event.logs.length > 0) {
            const lastLog = event.logs[event.logs.length - 1].message
            setStatus(`AI: ${lastLog}`)
        }
        // Sometimes images appear during the stream
        if (event.images && event.images.length > 0) setFinalImage(event.images[0].url)
        if (event.video) setFinalVideo(event.video.url)
      }

      // 4. Get Final Result
      const result = await stream.done()
      
      // 5. Check result object
      if (result.images && result.images.length > 0) setFinalImage(result.images[0].url)
      if (result.video) setFinalVideo(result.video.url)

      // 6. Fallback: if the library hid the video in the logs/output object
      if (!result.video && !result.images) {
          // Scan the raw JSON just in case
          const json = JSON.stringify(result)
          const match = json.match(/https?:\/\/[^"']+\.mp4/i)
          if (match) setFinalVideo(match[0])
          else setRawDebug(result) // Show debug if truly nothing found
      }

      setStatus('Done!')
      
    } catch (error) {
      console.error(error)
      setStatus(`Error: ${error.message}`)
      refundCredits(cost)
    }
    
    setLoading(false)
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 pt-20">
        <div className="bg-white p-10 rounded-xl shadow-xl text-center max-w-md w-full mx-4">
          <h2 className="text-3xl font-bold mb-4">Welcome to MSAI</h2>
          {authMsg && <div className="bg-blue-50 text-blue-600 p-3 mb-4 rounded text-sm">{authMsg}</div>}
          <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full border p-3 rounded text-slate-900 bg-white" placeholder="Email" />
            <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full border p-3 rounded text-slate-900 bg-white" placeholder="Password" />
            <button disabled={loading} className="w-full bg-slate-900 text-white p-3 rounded font-bold hover:bg-slate-800 transition">
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
            </button>
          </form>
          <div className="my-6 border-t relative"><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-slate-400">OR</span></div>
          <button onClick={handleGoogleLogin} className="w-full border border-slate-300 p-3 rounded flex items-center justify-center gap-3 font-medium hover:bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5"/>
            Continue with Google
          </button>
          <p className="mt-6 text-sm text-slate-500">
            <button onClick={()=>setIsSignUp(!isSignUp)} className="text-blue-600 font-bold underline">{isSignUp ? 'Login' : 'Sign Up'}</button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pt-32 px-5 pb-20 min-h-screen">
      <div className="flex justify-between items-end mb-12 border-b border-slate-200 pb-6">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <div className="text-right">
            <div className="text-sm text-slate-400 font-bold uppercase">Credits</div>
            <div className="text-5xl font-bold text-blue-600">{credits}</div>
            <a href="/shop" className="text-sm text-blue-500 hover:underline">+ Buy More</a>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-lg mb-8">
        <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl">😊</div>
            <div>
                <h3 className="font-bold text-2xl">Your Mood Today</h3>
                <p className="text-slate-500">Upload a selfie. Get a mood animation.</p>
            </div>
        </div>
        
        <div className="mb-6">
            <label className="block text-sm font-bold mb-2 text-slate-700">Upload Portrait</label>
            <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
        </div>

        <div className="flex justify-between items-center">
            <span className="font-bold text-blue-600">20 Credits</span>
            <button 
                onClick={() => handleRunApp('mood')} 
                disabled={loading || credits < 20}
                className="bg-slate-900 text-white px-8 py-3 rounded-full hover:bg-blue-600 disabled:opacity-50 transition"
            >
                {loading ? 'Processing...' : 'Run App'}
            </button>
        </div>
      </div>

      {/* RESULT AREA */}
      {(status || finalImage || finalVideo || rawDebug) && (
        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 mb-12">
          <h3 className="font-bold text-lg mb-2">
            Status: <span className={loading ? "text-blue-600 animate-pulse" : "text-green-600"}>{status}</span>
          </h3>
          
          <div className="grid gap-6 mt-4">
            {finalImage && (
                <div>
                    <h4 className="font-bold mb-2 text-slate-700">Your Mood Frame</h4>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={finalImage} className="w-full rounded-lg shadow-md" alt="Result" />
                    <a href={finalImage} target="_blank" download className="block mt-2 text-center bg-blue-600 text-white py-2 rounded text-sm">Download Image</a>
                </div>
            )}

            {finalVideo && (
                <div>
                    <h4 className="font-bold mb-2 text-slate-700">Your Mood Animation</h4>
                    <video controls src={finalVideo} className="w-full rounded-lg shadow-md"></video>
                    <a href={finalVideo} target="_blank" download className="block mt-2 text-center bg-slate-900 text-white py-2 rounded text-sm">Download Video</a>
                </div>
            )}

            {/* Debugging */}
            {!finalImage && !finalVideo && rawDebug && (
                <div className="bg-yellow-50 p-4 rounded text-yellow-700 mt-4">
                    <p className="font-bold text-sm">Debug Data:</p>
                    <pre className="bg-slate-800 text-slate-200 p-4 rounded text-xs overflow-auto max-h-64 mt-2">
                        {JSON.stringify(rawDebug, null, 2)}
                    </pre>
                </div>
            )}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 opacity-50">
        <div className="bg-white p-6 rounded-xl border">
            <h3 className="font-bold text-xl">Pro Photoshoot</h3>
            <p>Coming soon...</p>
        </div>
        <div className="bg-white p-6 rounded-xl border">
            <h3 className="font-bold text-xl">Story to Video</h3>
            <p>Coming soon...</p>
        </div>
      </div>

      <div className="text-center mt-20">
        <button onClick={() => supabase.auth.signOut()} className="text-slate-400 underline">Sign Out</button>
      </div>
    </div>
  )
}