'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
// 1. Initialize Supabase Client for client-side uploads
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 2. CHANGE THIS to your actual Supabase Storage Bucket name
const BUCKET_NAME = 'uploads'; 

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('IDLE'); // IDLE, UPLOADING, QUEUED, GENERATING, COMPLETED
  const [videoUrl, setVideoUrl] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');

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

  // --- Helper: Upload to Supabase Storage ---
  const uploadImage = async (fileToUpload) => {
    const fileName = `${Date.now()}-${fileToUpload.name}`;
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileToUpload);

    if (error) throw new Error(`Upload Failed: ${error.message}`);

    // Get Public URL
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

      if (!res.ok) throw new Error(json.error || 'Polling connection failed');

      // Update Logs
      if (json.logs) {
        const newLogs = json.logs.map(l => l.message).filter(Boolean);
        setLogs(newLogs);
      }

      if (json.status === 'COMPLETED') {
        // Extract Video URL (Checks multiple common paths)
        const finalUrl = json.data.video?.url || json.data.images?.[0]?.url || json.data.url;
        
        if (!finalUrl) throw new Error('Job completed but no video URL found.');

        setVideoUrl(finalUrl);
        setStatus('COMPLETED');
        setLoading(false);
      } else if (json.status === 'FAILED') {
        setError('AI Generation Failed.');
        setLoading(false);
      } else {
        // Still running -> Check again in 4 seconds
        setStatus(json.status);
        setTimeout(() => checkStatus(requestId), 4000);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  // --- Main Handler ---
  const handleGenerate = async () => {
    if (!file) {
      setError('Please select an image first.');
      return;
    }

    setLoading(true);
    setError('');
    setLogs([]);
    setStatus('UPLOADING');

    try {
      // 1. Upload File
      const imageUrl = await uploadImage(file);
      console.log('Uploaded Image:', imageUrl);

      // 2. Trigger Generation
      setStatus('QUEUED');
      const res = await fetch('/api/run-fal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          upload_your_portrait: imageUrl 
        }),
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Your Mood Today
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Upload a portrait to generate a mood video using AI.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 space-y-6">
          
          {/* File Input Area */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 hover:bg-gray-50 transition">
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
              className="cursor-pointer flex flex-col items-center"
            >
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="h-64 object-cover rounded-lg shadow-md mb-4"
                />
              ) : (
                <div className="h-32 w-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl text-gray-400">📷</span>
                </div>
              )}
              <span className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                {file ? 'Change Image' : 'Select Portrait'}
              </span>
            </label>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleGenerate}
            disabled={loading || !file}
            className={`w-full py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-all 
              ${loading || !file 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
          >
            {loading ? `Processing: ${status}...` : 'Generate Video'}
          </button>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Logs Console */}
          {loading && (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-48 overflow-y-auto shadow-inner">
              <p className="text-gray-500 border-b border-gray-700 pb-2 mb-2">System Logs:</p>
              {logs.length === 0 && <p className="animate-pulse">Initializing workflow...</p>}
              {logs.map((log, i) => (
                <div key={i} className="mb-1">{`> ${log}`}</div>
              ))}
            </div>
          )}

          {/* Result Video */}
          {videoUrl && (
            <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-green-600">Generation Complete!</h3>
                <p className="text-gray-500">Here is your result:</p>
              </div>
              <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-gray-100">
                <video 
                  src={videoUrl} 
                  controls 
                  autoPlay 
                  loop 
                  className="w-full"
                />
              </div>
              <a 
                href={videoUrl} 
                download="mood-video.mp4"
                className="block text-center text-blue-600 hover:underline"
                target="_blank"
                rel="noreferrer"
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