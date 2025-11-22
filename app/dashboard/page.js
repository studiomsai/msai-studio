'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// --- CONFIGURATION ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const BUCKET_NAME = 'uploads'; 
const CREDIT_COST = 20;

export default function Dashboard() {
  const router = useRouter();
  
  // --- STATE ---
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('IDLE'); 
  
  // Result State
  const [videoUrl, setVideoUrl] = useState(null);
  const [imagesUrl, setImagesUrl] = useState(null);
  
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  
  // User State
  const [credits, setCredits] = useState(null);
  const [userId, setUserId] = useState(null);

  // --- 1. LOAD USER & CREDITS ---
  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      setUserId(user.id);
      const { data } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
      if (data) setCredits(data.credits);
    };
    getUserData();
  }, [router]);

  // --- HELPER: FILE SELECTION ---
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setVideoUrl(null);
      setImagesUrl(null);
      setError('');
    }
  };

  // --- HELPER: UPLOAD IMAGE ---
  const uploadImage = async (fileToUpload) => {
    // Sanitize filename
    const cleanName = fileToUpload.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `${Date.now()}_${cleanName}`;
    
    const { error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, fileToUpload);
    if (error) throw error;
    
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    return data.publicUrl;
  };

  // --- CORE: POLLING LOGIC (RELAXED) ---
  const checkStatus = async (requestId) => {
    try {
      // 1. Check Status
      const res = await fetch(`/api/poll?request_id=${requestId}`);
      const json = await res.json(); // We know backend now always returns JSON

      // Update Logs
      if (json.logs) {
        const newLogs = json.logs.map(l => l.message).filter(Boolean);
        if (newLogs.length > 0) setLogs(newLogs);
      }

      // 2. Decide what to do based on status
      if (json.status === 'COMPLETED') {
        setStatus('FETCHING_RESULT');
        console.log("Job marked COMPLETED. Fetching result...");

        // Try to get the result. 
        // If the result URL is invalid/empty, we handle it safely.
        try {
            let finalData = json;
            
            if (json.response_url) {
                const encodedUrl = encodeURIComponent(json.response_url);
                const resultRes = await fetch(`/api/poll?url=${encodedUrl}`);
                
                if (resultRes.ok) {
                    finalData = await resultRes.json();
                } else {
                    console.warn("Result URL not ready yet, retrying status check...");
                    // If result fetch fails, maybe it's not actually ready. Go back to polling.
                    setTimeout(() => checkStatus(requestId), 5000);
                    return; 
                }
            }

            // Extract Media
            const vid = finalData.video?.url || finalData.url; 
            const imgs = finalData.images;

            if (vid || (imgs && imgs.length > 0)) {
                if (vid) setVideoUrl(vid);
                if (imgs) setImagesUrl(imgs[0].url);
                
                setStatus('COMPLETED');
                setLoading(false);
                setCredits((prev) => Math.max(0, prev - CREDIT_COST));
            } else {
               throw new Error('Completed, but no media found.');
            }

        } catch (fetchErr) {
            console.error("Result fetch error:", fetchErr);
            // Don't fail the whole job, just retry fetching result
            setTimeout(() => checkStatus(requestId), 5000);
        }

      } else if (json.status === 'FAILED') {
        setError(`Generation Failed: ${json.error || 'Unknown error'}`);
        setLoading(false);
      } else {
        // Still running (IN_QUEUE, IN_PROGRESS, or fake 404 IN_QUEUE)
        // Wait 5 seconds (Relaxed Polling)
        setStatus(json.status || 'LOADING');
        setTimeout(() => checkStatus(requestId), 5000);
      }
    } catch (err) {
      console.error("Network/System Error:", err);
      // Don't kill the app on temporary network glitches, just retry
      setTimeout(() => checkStatus(requestId), 5000);
    }
  };

  // --- MAIN ACTION ---
  const handleGenerate = async () => {
    if (!file) return setError('Please select an image first.');
    if (credits < CREDIT_COST) return setError('Insufficient credits.');
    if (!userId) return setError('Please log in again.');

    setLoading(true);
    setError('');
    setLogs([]);
    setVideoUrl(null);
    setImagesUrl(null);
    setStatus('UPLOADING');

    try {
      const imageUrl = await uploadImage(file);

      setStatus('QUEUED');
      const res = await fetch('/api/run-fal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upload_your_portrait: imageUrl, user_id: userId }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to start job');
      
      // Start polling
      checkStatus(data.request_id);

    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Your Mood Today</h1>
          <div className="mt-2 flex justify-center items-center space-x-2">
             <span className="text-gray-600">Available Credits:</span>
             {credits === null ? (
               <span className="animate-pulse bg-gray-200 w-8 h-6 rounded"></span>
             ) : (
               <span className={`font-bold ${credits < CREDIT_COST ? 'text-red-500' : 'text-green-600'}`}>{credits}</span>
             )}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 space-y-6">
          
          {/* File Picker */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 hover:bg-gray-50 transition relative">
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="file-upload" disabled={loading} />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center w-full">
              {previewUrl ? (
                <div className="relative">
                    <img src={previewUrl} alt="Preview" className="h-64 w-64 object-cover rounded-full shadow-md mb-4 border-4 border-white" />
                    <div className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow text-xs font-bold text-gray-600">CHANGE</div>
                </div>
              ) : (
                <div className="h-32 w-32 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl">📷</div>
              )}
              {!previewUrl && <span className="text-blue-600 font-semibold">Select Portrait</span>}
            </label>
          </div>

          {/* Buttons */}
          {credits !== null && credits < CREDIT_COST ? (
            <div className="text-center space-y-3">
                <div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">You need <strong>{CREDIT_COST} credits</strong>.</div>
                <button onClick={() => router.push('/shop')} className="w-full py-3 rounded-xl text-lg font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg transition-transform transform hover:scale-105">Buy Credits ⚡</button>
            </div>
          ) : (
            <button onClick={handleGenerate} disabled={loading || !file} className={`w-full py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-2 ${loading || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5'}`}>
                {loading ? <span>Processing: {status}...</span> : <><span>Generate Video</span><span className="bg-white/20 px-2 py-0.5 rounded text-sm font-normal">-{CREDIT_COST}</span></>}
            </button>
          )}

          {/* Error */}
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm text-center rounded border border-red-200">{error}</div>}

          {/* Logs */}
          {loading && logs.length > 0 && <div className="text-xs text-gray-400 font-mono text-center h-6 overflow-hidden">{logs[logs.length - 1]}</div>}

          {/* RESULTS */}
          {(videoUrl || imagesUrl) && (
            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h3 className="text-center text-lg font-bold text-green-600">Your Results!</h3>
              
              {/* Video */}
              {videoUrl && (
                <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-gray-100 bg-black">
                  <video src={videoUrl} controls autoPlay loop className="w-full" />
                </div>
              )}
              
              {/* Image Grid Preview */}
              {imagesUrl && (
                 <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
                   <img src={imagesUrl} alt="Generated" className="w-full" />
                 </div>
              )}

              {videoUrl && (
                <a href={videoUrl} download="mood.mp4" target="_blank" className="block text-center text-blue-600 text-sm hover:underline font-bold">
                  Download Video ⬇️
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}