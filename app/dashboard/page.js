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
  
  // State
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('IDLE'); 
  const [videoUrl, setVideoUrl] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  
  // User State
  const [credits, setCredits] = useState(null); // Start null to show loading state
  const [userId, setUserId] = useState(null);

  // 1. Fetch User & Credits on Load
  useEffect(() => {
    const getUserData = async () => {
      // Get Logged In User
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // If not logged in, redirect to login (optional protection)
        router.push('/login'); 
        return;
      }

      setUserId(user.id);

      // Fetch Credits from 'profiles' table
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (data) {
        setCredits(data.credits);
      }
    };

    getUserData();
  }, [router]);

  // --- Helper: Handle File Selection ---
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setVideoUrl(null);
      setError('');
    }
  };

  // --- Helper: Upload to Supabase ---
  const uploadImage = async (fileToUpload) => {
    const fileName = `${Date.now()}-${fileToUpload.name}`;
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileToUpload);

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return publicData.publicUrl;
  };

  // --- Core: Polling Logic ---
  const checkStatus = async (requestId) => {
    try {
      const res = await fetch(`/api/poll?request_id=${requestId}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Polling failed');

      if (json.logs) {
        const newLogs = json.logs.map(l => l.message).filter(Boolean);
        setLogs(newLogs);
      }

      if (json.status === 'COMPLETED') {
        const finalUrl = json.data.video?.url || json.data.images?.[0]?.url || json.data.url;
        if (!finalUrl) throw new Error('No video URL in response');

        setVideoUrl(finalUrl);
        setStatus('COMPLETED');
        setLoading(false);
        
        // Visually deduct credits (The backend already did the real deduction)
        setCredits((prev) => Math.max(0, prev - CREDIT_COST));

      } else if (json.status === 'FAILED') {
        setError('AI Generation Failed. No credits were deducted.');
        setLoading(false);
      } else {
        setStatus(json.status);
        setTimeout(() => checkStatus(requestId), 4000);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  // --- Main Action ---
  const handleGenerate = async () => {
    if (!file) return setError('Please select an image first.');
    if (credits < CREDIT_COST) return setError('Insufficient credits.');

    setLoading(true);
    setError('');
    setLogs([]);
    setStatus('UPLOADING');

    try {
      // 1. Upload
      const imageUrl = await uploadImage(file);

      // 2. Trigger Backend
      setStatus('QUEUED');
      const res = await fetch('/api/run-fal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upload_your_portrait: imageUrl }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.error || 'Failed to start job');

      // 3. Start Polling
      checkStatus(data.request_id);

    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    // Centered Layout Wrapper
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      <div className="w-full max-w-md space-y-8">
        
        {/* Header & Credits Display */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Your Mood Today
          </h1>
          <div className="mt-2 flex justify-center items-center space-x-2">
             <span className="text-gray-600">Available Credits:</span>
             {credits === null ? (
               <span className="animate-pulse bg-gray-200 w-8 h-6 rounded"></span>
             ) : (
               <span className={`font-bold ${credits < CREDIT_COST ? 'text-red-500' : 'text-green-600'}`}>
                 {credits}
               </span>
             )}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 space-y-6">
          
          {/* File Picker */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 hover:bg-gray-50 transition relative">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="hidden" 
              id="file-upload"
              disabled={loading}
            />
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer flex flex-col items-center w-full"
            >
              {previewUrl ? (
                <div className="relative">
                    <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="h-64 w-64 object-cover rounded-full shadow-md mb-4 border-4 border-white"
                    />
                    <div className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow text-xs font-bold text-gray-600">
                        CHANGE
                    </div>
                </div>
              ) : (
                <div className="h-32 w-32 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl">
                  📷
                </div>
              )}
              {!previewUrl && <span className="text-blue-600 font-semibold">Select Portrait</span>}
            </label>
          </div>

          {/* Buttons Area */}
          {credits !== null && credits < CREDIT_COST ? (
            // Zero/Low Credits State
            <div className="text-center space-y-3">
                <div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                    You need <strong>{CREDIT_COST} credits</strong> to generate a video.
                </div>
                <button
                    onClick={() => router.push('/shop')}
                    className="w-full py-3 rounded-xl text-lg font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg transition-transform transform hover:scale-105"
                >
                    Buy Credits ⚡
                </button>
            </div>
          ) : (
            // Normal Generate State
            <button 
                onClick={handleGenerate}
                disabled={loading || !file}
                className={`w-full py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-2
                ${loading || !file 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
            >
                {loading ? (
                    <span>Processing: {status}...</span>
                ) : (
                    <>
                        <span>Generate Video</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded text-sm font-normal">-{CREDIT_COST}</span>
                    </>
                )}
            </button>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm text-center rounded">
              {error}
            </div>
          )}

          {/* Progress/Logs */}
          {loading && logs.length > 0 && (
             <div className="text-xs text-gray-400 font-mono text-center h-6 overflow-hidden">
                {logs[logs.length - 1]}
             </div>
          )}

          {/* Result Video */}
          {videoUrl && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h3 className="text-center text-lg font-bold text-green-600 mb-3">Video Ready!</h3>
              <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-gray-100 bg-black">
                <video src={videoUrl} controls autoPlay loop className="w-full" />
              </div>
              <a 
                href={videoUrl} 
                download="mood.mp4"
                target="_blank"
                className="block mt-4 text-center text-blue-600 text-sm hover:underline"
              >
                Download Video
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}