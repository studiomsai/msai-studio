"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Client-side Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [credit, setCredit] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* 🔐 Load user & credits */
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        setAuthLoading(false);
        return;
      }

      setUser(data.user);

      const { data: profile } = await supabase
        .from("users")
        .select("available_credit")
        .eq("id", data.user.id)
        .single();

      setCredit(profile?.available_credit ?? 0);
      setAuthLoading(false);
    };

    init();
  }, []);

  /* ▶ Upload & Generate */
  const handleGenerate = async () => {
    if (!user) return alert("Please login");
    if (!file) return alert("Please select an image");
    if (credit <= 0) return alert("Insufficient credits");

    setLoading(true);
    setResult(null);

    try {
      /* 1️⃣ Upload to Supabase */
      const ext = file.name.split(".").pop();
      const filePath = `fal/${user.id}-${Date.now()}.${ext}`;

      console.log("⬆️ Uploading to:", filePath);

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("❌ Upload failed:", uploadError);
        throw new Error("Image upload failed");
      }

      /* 2️⃣ MANUAL PUBLIC URL (NO HELPER) */
      const imageUrl =
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}` +
        `/storage/v1/object/public/profile-images/${filePath}`;

      console.log("🌍 FINAL imageUrl:", imageUrl);

      // 🔴 HARD STOP IF EMPTY
      if (!imageUrl || imageUrl.trim() === "") {
        throw new Error("Public image URL is empty");
      }

      /* 3️⃣ Verify URL is accessible */
      const headCheck = await fetch(imageUrl, { method: "HEAD" });
      if (!headCheck.ok) {
        throw new Error("Image URL is not publicly accessible");
      }

      console.log("✅ Image URL verified, sending to backend");

      /* 4️⃣ Call backend (INLINE VALUE — NO STATE REUSE) */
      const res = await fetch("/api/run-fal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          imageUrl: imageUrl, // 👈 EXACT VALUE
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Generation failed");
      }

      setResult(json.result);
      setCredit((c) => c - 1);
    } catch (err) {
      console.error("🔥 Generate error:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <p style={{ padding: 30 }}>Loading…</p>;
  if (!user) return <p style={{ padding: 30 }}>Please login</p>;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">
        Your Mood Today
      </h1>

      <div className="dashboard-card">
        <p className="credits-text">
          <strong>Available Credits:</strong> {credit}
        </p>

        <div className="file-input-container">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="file-input"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || credit <= 0}
          className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-full font-bold text-lg transition shadow-lg shadow-blue-600/40"
        >
          {loading ? "Generating…" : "Upload & Generate"}
        </button>

        {credit <= 0 && (
          <p className="insufficient-credits">
            Insufficient credits
          </p>
        )}
    </div>
        {result && (
          <div className="results-container">
            <h3 className="results-title">Your Results:</h3>
            <div className="media-grid">
              {result.output?.images?.[0]?.url && (
                <div className="media-item">
                  <h4 className="media-heading">Generated Image</h4>
                  <img
                    src={result.output.images[0].url}
                    alt="Generated Image"
                    className="generated-image"
                  />
                  <a
                    href={result.output.images[0].url}
                    download
                    className="download-button"
                  >
                    Download Image
                  </a>
                </div>
              )}
              {result.output?.video?.url && (
                <div className="media-item">
                  <h4 className="media-heading">Generated Video</h4>
                  <video
                    controls
                    src={result.output.video.url}
                    className="generated-video"
                  />
                  <a
                    href={result.output.video.url}
                    download
                    className="download-button"
                  >
                    Download Video
                  </a>
                </div>
              )}
            </div>
            {(!result.output?.images?.[0]?.url && !result.output?.video?.url) && (
              <pre className="json-fallback">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        )}
     
    </div>
  );
}
