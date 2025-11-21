'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { fal } from '@fal-ai/client'

fal.config({
  proxyUrl: '/api/fal/proxy',
})

export const dynamic = 'force-dynamic'

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
  const [runLogs, setRunLogs] = useState([]) // NEW: Store logs to find hidden URLs
  
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
    } catch (error) {
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
    setMediaResult(null)
    setRunLogs([]) // Clear previous logs

    try {
      let imageUrl = null
      if (selectedFile) {
          imageUrl = await fal.storage.upload(selectedFile)
      }

      setStatus('Queued. Waiting for AI...')

      const result = await fal.subscribe('workflows/Mc-Mark/your-mood-today-video', {
        input: {
          prompt: "make me smile",
          upload_image: imageUrl
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
             if (update.logs && update.logs.length > 0) {
                 // Save logs to state
                 setRunLogs(prev => [...prev, ...update.logs])
                 const lastLog = update.logs[update.logs.length - 1]
                 setStatus(`AI: ${lastLog.message}`)
             } else {
                 setStatus('AI is generating video...')
             }
          }
        }
      })

      setStatus('Done!')
      setMediaResult(result)
      
    } catch (error) {
      console.error(error)
      setStatus(`Error: ${error.message}`)
      refundCredits(cost)
    }
    
    setLoading(false)
  }

  const renderResults = (data) => {
    // Combine the result object AND the logs into one giant string to search
    const combinedSource = JSON.stringify(data) + JSON.stringify(runLogs)
    
    let images = []
    let videoUrl = null

    // 1. Direct object checks (The nice way)
    if (data && data.images) images = data.images
    if (data && data.video) videoUrl = data.video.url || data.video

    // 2. Regex Search (The aggressive way - scans logs too)
    if (!videoUrl) {
        // Look for any URL ending in mp4
        const videoMatch = combinedSource.match(/https?:\/\/[^"'\s]+\.mp4/i)
        if (videoMatch) videoUrl = videoMatch[0]
    }
    
    if (images.length === 0) {
        // Look for any URL ending in png/jpg
        const imageRegex = /https?:\/\/[^"'\s]+\.(?:png|jpg|jpeg|webp)/gi
        const matches = combinedSource.match(imageRegex) || []
        // Remove duplicates
        images = [...new Set(matches)]
        // Filter out the uploaded image if possible (usually input images have different domain or path)
    }

    // If we found nothing, show the debug info
    if (!data && runLogs.length === 0) return null

    return (
        <div className="grid gap-6 mt-4">
            {images.length > 0 && (
                <div>
                    <h4 className="font-bold mb-2 text-slate-700">Images</h4>
                    <div className="grid grid-cols-2 gap-4">
                        {images.map((img, i) => (
                            <div key={i}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img.url || img} className="w-full rounded-lg shadow-md" alt="AI Result" />
                                <a href={img.url || img} target="_blank" download className="block mt-2 text-center bg-blue-600 text-white py-2 rounded text-sm">Download</a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {videoUrl && (
                <div>
                    <h4 className="font-bold mb-2 text-slate-700">Video</h4>
                    <video controls src={videoUrl} className="w-full rounded-lg shadow-md"></video>
                    <a href={videoUrl} target="_blank" download className="block mt-2 text-center bg-slate-900 text-white py-2 rounded text-sm">Download Video</a>
                </div>
            )}

            {images.length === 0 && !videoUrl && (
                <div className="bg-yellow-50 p-4 rounded text-yellow-700">
                    <p className="font-bold">Parsing...</p>
                    <p className="text-xs mb-2">We could not extract the media automatically. Please check the raw data below for links starting with 'https':</p>
                    <pre className="bg-slate-800 text-slate-200 p-4 rounded text-xs overflow-auto max-h-64">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                    <p className="text-xs mt-4 font-bold">Logs:</p>
                    <pre className="bg-slate-800 text-slate-300 p-4 rounded text-xs overflow-auto max-h-64">
                        {JSON.stringify(runLogs, null, 2)}
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
                {loading ? 'Processing...' : 'Run App'}
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