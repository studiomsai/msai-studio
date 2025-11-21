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
  const [mediaResult, setMediaResult] = useState(null)
  
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
      setAuthMsg("An unexpected error occurred.")
    }
    setLoading(false)
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
  }

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 1536
        const scale = MAX_WIDTH / img.width
        canvas.width = scale < 1 ? MAX_WIDTH : img.width
        canvas.height = scale < 1 ? img.height * scale : img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const base64 = canvas.toDataURL('image/jpeg', 0.8)
        resolve(base64)
      }
      img.onerror = (e) => reject(e)
    })
  }

  // --- ROBUST POLLING LOGIC ---
  async function pollStatus(statusUrl) {
    setStatus('AI is generating... (This takes about 30s)')
    
    const interval = setInterval(async () => {
      try {
        // 1. Get the Status Update (Contains Logs)
        const res = await fetch(`/api/poll?url=${encodeURIComponent(statusUrl)}`)
        const statusData = await res.json()

        if (statusData.status === 'COMPLETED') {
          clearInterval(interval)
          setStatus('Finalizing...')
          
          let finalPayload = { ...statusData } // Start with status data (Logs)

          // 2. Try to get the Result Data (Merge if successful)
          if (statusData.response_url) {
             try {
                 const finalRes = await fetch(`/api/poll?url=${encodeURIComponent(statusData.response_url)}`)
                 const finalData = await finalRes.json()
                 // Merge them so we don't lose the logs!
                 finalPayload = { ...finalPayload, ...finalData }
             } catch (err) {
                 console.warn("Could not fetch response_url, using logs instead.")
             }
          }

          setMediaResult(finalPayload) 
          setLoading(false)
          setStatus('Done!')
          if(session?.user?.id) fetchCredits(session.user.id)

        } else if (statusData.status === 'FAILED' || statusData.error) {
          clearInterval(interval)
          setLoading(false)
          setStatus('Generation Failed. Credits refunded.')
        } else {
          setStatus(`AI Processing: ${statusData.status}...`)
        }
      } catch (e) {
        console.error("Polling error", e)
      }
    }, 2000)
  }

  async function handleRunApp(appId) {
    setLoading(true)
    setStatus('Starting...')
    setMediaResult(null)

    try {
      let inputs = {}

      if (appId === 'mood') {
        if (!selectedFile) {
          alert("Please select an image first!")
          setLoading(false)
          return
        }
        setStatus('Compressing image...')
        const base64Image = await compressImage(selectedFile)
        
        inputs = {
          prompt: "make me smile",
          upload_image: base64Image
        }
      } else {
        inputs = { prompt: "A futuristic masterpiece" }
      }

      setStatus('Sending to AI Engine...')
      
      const res = await fetch('/api/run-fal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, appId, inputs })
      })

      if (res.status === 413) throw new Error("Image too large.")
      const data = await res.json()

      if (data.error) {
        setStatus('Error: ' + data.error)
        setLoading(false)
        fetchCredits(session.user.id)
      } else {
        setStatus('Job Queued.')
        pollStatus(data.data.status_url)
      }

    } catch (e) {
      setStatus("Error: " + e.message)
      setLoading(false)
    }
  }

  // --- DEEP PARSER ---
  const renderResults = (data) => {
    if (!data) return null;
    
    const images = []
    let videoUrl = null

    // Stringify the WHOLE object (Status + Logs + Result)
    const jsonString = JSON.stringify(data)
    
    // Regex to find media links
    const urlRegex = /https?:\/\/[^"'\s]+\.(?:mp4|png|jpg|jpeg|webp)(?:[^"'\s]*)?/gi
    
    const matches = jsonString.match(urlRegex) || []
    const uniqueUrls = [...new Set(matches)]
    
    uniqueUrls.forEach(url => {
        const cleanUrl = url.replace(/\\/g, '') // Remove escape slashes
        // Filter out FAL internal system assets (optional, but keeps it clean)
        if(!cleanUrl.includes('fal.media')) return; 

        if (cleanUrl.match(/\.(mp4|webm)/i)) {
            // Grab the last video found (usually the final result)
            videoUrl = cleanUrl
        } else {
            images.push(cleanUrl)
        }
    })

    // Specific check for V3B/FAL media if regex missed standard extensions
    if (!videoUrl) {
        const outputMatch = jsonString.match(/"video":\s*{\s*"url":\s*"(https:\/\/[^"]+)"/);
        if(outputMatch) videoUrl = outputMatch[1];
    }

    return (
        <div className="grid gap-6 mt-4">
            {images.length > 0 && (
                <div>
                    <h4 className="font-bold mb-2 text-slate-700">Images Found</h4>
                    <div className="grid grid-cols-2 gap-4">
                        {images.map((url, i) => (
                            <div key={i}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} className="w-full rounded-lg shadow-md" alt="AI Result" />
                                <a href={url} target="_blank" download className="block mt-2 text-center bg-blue-600 text-white py-2 rounded text-sm">Download Image</a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {videoUrl && (
                <div>
                    <h4 className="font-bold mb-2 text-slate-700">Video Result</h4>
                    <video controls src={videoUrl} className="w-full rounded-lg shadow-md"></video>
                    <a href={videoUrl} target="_blank" download className="block mt-2 text-center bg-slate-900 text-white py-2 rounded text-sm">Download Video</a>
                </div>
            )}

            {images.length === 0 && !videoUrl && (
                <div className="bg-yellow-50 p-4 rounded text-yellow-700">
                    <p className="font-bold">Could not auto-detect media.</p>
                    <pre className="bg-slate-800 text-slate-200 p-4 rounded text-xs overflow-auto max-h-96">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    )
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
                {loading ? 'Running...' : 'Run App'}
            </button>
        </div>
      </div>

      {(status || mediaResult) && (
        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 mb-12">
          <h3 className="font-bold text-lg mb-2">
            Status: <span className={loading ? "text-blue-600 animate-pulse" : "text-green-600"}>{status}</span>
          </h3>
          {renderResults(mediaResult)}
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