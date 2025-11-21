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
  
  // This holds the final visual result
  const [mediaResult, setMediaResult] = useState(null)
  
  // App Inputs
  const [selectedFile, setSelectedFile] = useState(null)
  
  // Login Inputs
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
      const action = isSignUp ? supabase.auth.signUp : supabase.auth.signInWithPassword
      const { error } = await action({ email, password })
      if (error) setAuthMsg(error.message)
      else if (isSignUp) setAuthMsg("Success! Account created. You can log in.")
    } catch (err) { setAuthMsg("Error") }
    setLoading(false)
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
  }

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  // --- THE POLLING LOGIC ---
  async function pollStatus(statusUrl) {
    setStatus('AI is generating... (This takes about 30s)')
    
    const interval = setInterval(async () => {
      try {
        // Call our new backend proxy
        const res = await fetch(`/api/check-status?url=${encodeURIComponent(statusUrl)}`)
        const data = await res.json()

        if (data.status === 'COMPLETED') {
          clearInterval(interval)
          setLoading(false)
          setStatus('Done!')
          
          // Parse FAL Output to find Image and Video
          // Note: Workflow outputs differ. We look for common patterns.
          let finalImage = null
          let finalVideo = null

          // Logic to find media in the logs/output
          if (data.logs) {
             const imageLog = data.logs.find(l => l.message && l.message.includes('.png') || l.message.includes('.jpg'))
             const videoLog = data.logs.find(l => l.message && l.message.includes('.mp4'))
             // This is a fallback, normally FAL returns a 'outputs' object if configured or we use the response directly
          }
          
          // Simplified: We pass the whole data object to the render function
          setMediaResult(data) 
          
          // Refresh credits (in case of refund/update)
          if(session?.user?.id) fetchCredits(session.user.id)

        } else if (data.status === 'FAILED' || data.error) {
          clearInterval(interval)
          setLoading(false)
          setStatus('Generation Failed. Credits refunded.')
          // Logic to trigger refund should be here, but we handled pre-validation refund in run-fal
        } else {
          setStatus(`AI Processing: ${data.status}...`)
        }
      } catch (e) {
        console.error(e)
      }
    }, 2000) // Check every 2 seconds
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
        setStatus('Uploading image...')
        const base64Image = await fileToBase64(selectedFile)
        
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

      const data = await res.json()

      if (data.error) {
        setStatus('Error: ' + data.error)
        setLoading(false)
        fetchCredits(session.user.id)
      } else {
        // Success! Now we wait for the result.
        setStatus('Job Queued.')
        pollStatus(data.data.status_url)
      }

    } catch (e) {
      setStatus("System Error")
      setLoading(false)
    }
  }

  // Helper to render the complex FAL output
  const renderResults = (data) => {
    if (!data) return null;

    // We need to find the image and video URLs in the specific Workflow output
    // Workflow outputs are usually in 'outputs' array or 'logs'
    
    let images = []
    let video = null

    // 1. Check direct outputs (Standard FAL)
    if (data.outputs && data.outputs.length > 0) {
        data.outputs.forEach(out => {
            if (out.images) images.push(...out.images)
            if (out.video) video = out.video
        })
    }
    
    // 2. Fallback: If output structure is nested (Common in ComfyUI workflows)
    // We look recursively for "url" keys that end in png/mp4
    if (images.length === 0 && !video) {
        const jsonString = JSON.stringify(data)
        const urlRegex = /"url":"(https:\/\/[^"]+)"/g
        let match
        while ((match = urlRegex.exec(jsonString)) !== null) {
            const url = match[1]
            if (url.match(/\.(jpeg|jpg|gif|png)$/i)) images.push({ url })
            if (url.match(/\.(mp4|webm)$/i)) video = { url }
        }
    }

    return (
        <div className="grid gap-6 mt-4">
            {/* Display Images */}
            {images.length > 0 && (
                <div>
                    <h4 className="font-bold mb-2 text-slate-700">Your Mood Frame</h4>
                    <div className="grid grid-cols-2 gap-4">
                        {images.map((img, i) => (
                            <div key={i}>
                                <img src={img.url} className="w-full rounded-lg shadow-md" alt="AI Result" />
                                <a href={img.url} target="_blank" download className="block mt-2 text-center bg-blue-600 text-white py-2 rounded text-sm">Download Image</a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Display Video */}
            {video && (
                <div>
                    <h4 className="font-bold mb-2 text-slate-700">Your Mood Animation</h4>
                    <video controls src={video.url} className="w-full rounded-lg shadow-md"></video>
                    <a href={video.url} target="_blank" download className="block mt-2 text-center bg-slate-900 text-white py-2 rounded text-sm">Download Video</a>
                </div>
            )}

            {/* Fallback if nothing found but completed */}
            {images.length === 0 && !video && (
                <div className="bg-yellow-50 p-4 rounded text-yellow-700">
                    Workflow Completed, but couldn't parse media. 
                    <a href={data.response_url} target="_blank" className="underline ml-2">View Raw Data</a>
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

      {/* RESULT DISPLAY */}
      {(status || mediaResult) && (
        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 mb-12">
          <h3 className="font-bold text-lg mb-2">
            Status: <span className={loading ? "text-blue-600 animate-pulse" : "text-green-600"}>{status}</span>
          </h3>
          
          {/* Render the parsed images/videos */}
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