'use client';

import { useState } from 'react';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('IDLE'); 
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState([]);

  // --- 1. Polling Logic ---
  const checkStatus = async (requestId) => {
    try {
      // Call our proxy endpoint
      const res = await fetch(`/api/poll?request_id=${requestId}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Polling failed');

      // Update logs if the backend sends them
      if (json.logs) {
        const newLogs = json.logs.map(l => l.message).filter(Boolean);
        setLogs(newLogs);
      }

      if (json.status === 'COMPLETED') {
        // JOB DONE: Extract video URL
        // Note: Depending on the specific FAL workflow, the video might be in 
        // json.data.video.url OR json.data.images[0].url.
        // We check both to be safe.
        const finalUrl = json.data.video?.url || json.data.images?.[0]?.url || json.data.url;
        
        if (!finalUrl) {
          console.log('Full Result Data:', json.data); // Debugging if URL is missing
          throw new Error('Job completed but no video URL found in response');
        }

        setVideoUrl(finalUrl);
        setStatus('COMPLETED');
        setLoading(false);
      } else if (json.status === 'FAILED') {
        setError('AI Generation failed on FAL side.');
        setLoading(false);
      } else {
        // JOB RUNNING: Update status and wait 5 seconds
        setStatus(json.status); 
        setTimeout(() => checkStatus(requestId), 5000);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  // --- 2. Trigger Logic ---
  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVideoUrl(null);
    setLogs([]);
    setStatus('UPLOADING');

    // Replace this with your actual File Upload logic to get a public URL
    // For testing, use a hardcoded valid image URL if you don't have one yet
    const uploadedImageUrl = "https://storage.googleapis.com/falserverless/model_tests/portrait_input.jpg"; 

    try {
      // Call your backend to start the job
      const res = await fetch('/api/run-fal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          upload_your_portrait: uploadedImageUrl 
        }),
      });

      const data = await res.json();

      // ERROR TRAP: This is where your previous error likely happened
      if (!data.success) {
        throw new Error(data.error || 'Failed to reach backend');
      }
      if (!data.request_id) {
        console.error("Backend Response:", data);
        throw new Error("Backend did not return a request_id");
      }

      // Start Polling using the ID
      setStatus('QUEUED');
      checkStatus(data.request_id);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-2xl mx-auto text-center font-sans">
      <h1 className="text-3xl font-bold mb-6">Your Mood Today (FAL V2)</h1>

      <button 
        onClick={handleGenerate}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {loading ? `Status: ${status}` : 'Generate Video'}
      </button>

      {/* Status Logs */}
      {loading && (
        <div className="mt-4 p-4 bg-gray-100 rounded text-sm font-mono text-left h-32 overflow-y-auto border">
          <p className="font-bold text-gray-700 sticky top-0 bg-gray-100">Logs:</p>
          {logs.length === 0 && <p className="text-gray-400">Waiting for logs...</p>}
          {logs.map((log, i) => (
            <p key={i} className="text-gray-600 border-b border-gray-200 py-1">{log}</p>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 border border-red-200 rounded">
          Error: {error}
        </div>
      )}

      {/* Video Result */}
      {videoUrl && (
        <div className="mt-8 animate-in fade-in duration-700">
          <h3 className="text-xl font-bold text-green-600 mb-2">Your Video is Ready!</h3>
          <video src={videoUrl} controls autoPlay loop className="w-full rounded-lg shadow-2xl border border-gray-200" />
        </div>
      )}
    </div>
  );
}