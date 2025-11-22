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
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('IDLE'); 
  const [requestId, setRequestId] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [imagesUrl, setImagesUrl] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [credits, setCredits] = useState(null);
  const [userId, setUserId] = useState(null);

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

  const uploadImage = async (fileToUpload) => {
    const cleanName = fileToUpload.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `${Date.now()}_${cleanName}`;
    const { error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, fileToUpload);
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    return data.publicUrl;
  };

  // --- CORE: POLLING LOGIC ---
  const checkStatus = async (reqId) => {
    try {
      const res = await fetch(`/api/poll?request_id=${reqId}`);
      const json = await res.json();

      if (json.logs && json.logs.length > 0) {
        const newLogs = json.logs.map(l => l.message).filter(Boolean);
        setLogs(prev => [...new Set([...prev, ...newLogs])]);
      }

      if (json.status === 'COMPLETED') {
        setStatus('FETCHING_RESULT');
        
        if (json.response_url) {
            const encodedUrl = encodeURIComponent(json.response_url);
            const resultRes = await fetch(`/api/poll?url=${encodedUrl}`);
            
            // Handle non-200 safely
            if (!resultRes.ok) {
                const errDetail = await resultRes.json();
                throw new Error(errDetail.error || `Server Error ${resultRes.status}`);
            }
            
            const finalData = await resultRes.json();

            // Check if we caught a non-JSON response in the proxy
            if (finalData.status === 'COMPLETED_NON_JSON') {
                console.error("Non-JSON Result:", finalData.raw_content);
                throw new Error(`FAL returned invalid data: ${finalData.raw_content}`);
            }

            const vid = finalData.video?.url || finalData.url; 
            const imgs = finalData.images;

            if (vid || (imgs && imgs.length > 0)) {
                if (vid) setVideoUrl(vid);
                if (imgs) setImagesUrl(imgs[0].url);
                setStatus('COMPLETED');
                setLoading(false);
                setCredits((prev) => Math.max(0, prev - CREDIT_COST));
            } else {
               throw new Error('Workflow finished but returned no media.');
            }
        } else {
            throw new Error('Workflow finished without a response URL.');
        }

      } else if (json.status === 'FAILED') {
        setError(`Generation Failed: ${json.error || 'Unknown error'}`);
        setLoading(false);
      } else {
        setStatus(json.status || 'LOADING');
        setTimeout(() => checkStatus(reqId), 5000);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      // Stop loading on hard error
      if (err.message.includes("Upstream") || err.message.includes("FAL returned")) {
          setLoading(false);
      } else {
          // Retry temporary errors
          setTimeout(() => checkStatus(reqId), 5000);
      }
    }
  };

  const handleGenerate = async () => {
    if (!file) return setError('Please select an image first.');
    if (credits < CREDIT_COST) return setError('Insufficient credits.');
    if (!userId) return setError('Please log in again.');

    setLoading(true);
    setError('');
    setLogs([]);
    setVideoUrl(null);
    setImagesUrl(null);
    setRequestId(null);
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
      
      setRequestId(data.request_id);
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
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Your Mood Today</h1>
          <div className="mt-2 flex justify-center items-center space-x-2">
             <span className="text-gray-600">Available Credits:</span>
             {credits === null ? <span className="animate-pulse bg-gray-200 w-8 h-6 rounded"></span> : <span className={`font-bold ${credits < CREDIT_COST ? 'text-red-500' : 'text-green-600'}`}>{credits}</span>}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 space-y-6">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 hover:bg-gray-50 transition relative">
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="file-upload" disabled={loading} />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center w-full">
              {previewUrl ? <div className="relative"><img src={previewUrl} alt="Preview" className="h-64 w-64 object-cover rounded-full shadow-md mb-4 border-4 border-white" /><div className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow text-xs font-bold text-gray-600">CHANGE</div></div> : <div className="h-32 w-32 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl">📷</div>}
              {!previewUrl && <span className="text-blue-600 font-semibold">Select Portrait</span>}
            </label>
          </div>
          {credits !== null && credits < CREDIT_COST ? (
            <div className="text-center space-y-3"><div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">You need <strong>{CREDIT_COST} credits</strong>.</div><button onClick={() => router.push('/shop')} className="w-full py-3 rounded-xl text-lg font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg transition-transform transform hover:scale-105">Buy Credits ⚡</button></div>
          ) : (
            <button onClick={handleGenerate} disabled={loading || !file} className={`w-full py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-2 ${loading || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5'}`}>
                {loading ? <span>Processing: {status}...</span> : <><span>Generate Video</span><span className="bg-white/20 px-2 py-0.5 rounded text-sm font-normal">-{CREDIT_COST}</span></>}
            </button>
          )}
          {requestId && <div className="text-xs text-center text-gray-400 font-mono select-all">ID: {requestId}</div>}
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm text-center rounded border border-red-200 font-medium whitespace-pre-wrap break-words">{error}</div>}
          {logs.length > 0 && <div className="bg-gray-900 rounded-lg p-3 text-left h-32 overflow-y-auto shadow-inner border border-gray-700"><div className="text-xs text-gray-400 mb-2 border-b border-gray-700 pb-1">Server Logs:</div>{logs.map((log, i) => <div key={i} className="text-xs font-mono text-green-400 mb-1 whitespace-pre-wrap break-words">{`> ${log}`}</div>)}</div>}
          {(videoUrl || imagesUrl) && <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700"><h3 className="text-center text-lg font-bold text-green-600">Your Results!</h3>{videoUrl && <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-gray-100 bg-black"><video src={videoUrl} controls autoPlay loop className="w-full" /></div>}{imagesUrl && <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200"><img src={imagesUrl} alt="Generated" className="w-full" /></div>}{videoUrl && <a href={videoUrl} download="mood.mp4" target="_blank" className="block text-center text-blue-600 text-sm hover:underline font-bold">Download Video ⬇️</a>}</div>}
        </div>
      </div>
    </div>
  );
}