"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Client-side Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [credit, setCredit] = useState(null);
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
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

  /* Redirect to login if not authenticated */
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  /* ▶ Upload & Generate */
  const handleGenerate = async () => {
    if (!user) return alert("Please login");
    if (!file1 || !file2) return alert("Please select both images");
    if (credit < 20) return alert("Insufficient credits (20 required)");

    setLoading(true);
    setResult(null);

    try {
      /* 1️⃣ Upload first image to Supabase */
      const ext1 = file1.name.split(".").pop();
      const filePath1 = `fal/${user.id}-1-${Date.now()}.${ext1}`;

      console.log("⬆️ Uploading file1 to:", filePath1);

      const { error: uploadError1 } = await supabase.storage
        .from("profile-images")
        .upload(filePath1, file1, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError1) {
        console.error("❌ Upload failed for file1:", uploadError1);
        throw new Error("First image upload failed");
      }

      const imageUrl1 =
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}` +
        `/storage/v1/object/public/profile-images/${filePath1}`;

      console.log("🌍 FINAL imageUrl1:", imageUrl1);

      if (!imageUrl1 || imageUrl1.trim() === "") {
        throw new Error("First image URL is empty");
      }

      /* 2️⃣ Upload second image to Supabase */
      const ext2 = file2.name.split(".").pop();
      const filePath2 = `fal/${user.id}-2-${Date.now()}.${ext2}`;

      console.log("⬆️ Uploading file2 to:", filePath2);

      const { error: uploadError2 } = await supabase.storage
        .from("profile-images")
        .upload(filePath2, file2, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError2) {
        console.error("❌ Upload failed for file2:", uploadError2);
        throw new Error("Second image upload failed");
      }

      const imageUrl2 =
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}` +
        `/storage/v1/object/public/profile-images/${filePath2}`;

      console.log("🌍 FINAL imageUrl2:", imageUrl2);

      if (!imageUrl2 || imageUrl2.trim() === "") {
        throw new Error("Second image URL is empty");
      }

      /* 3️⃣ Verify URLs are accessible */
      const headCheck1 = await fetch(imageUrl1, { method: "HEAD" });
      if (!headCheck1.ok) {
        throw new Error("First image URL is not publicly accessible");
      }

      const headCheck2 = await fetch(imageUrl2, { method: "HEAD" });
      if (!headCheck2.ok) {
        throw new Error("Second image URL is not publicly accessible");
      }

      console.log("✅ Both image URLs verified, sending to backend");

      /* 4️⃣ Call backend */
      const res = await fetch("/api/run-fal-dual-selfie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          imageUrl1: imageUrl1,
          imageUrl2: imageUrl2,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Generation failed");
      }

      setResult(json.result);
      setCredit((c) => c - 20);
    } catch (err) {
      console.error("🔥 Generate error:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <p style={{ padding: 30 }}>Loading…</p>;
  if (!user) return null; // This should not be reached due to redirect

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">
        Dual Selfie
      </h1>

      <div className="dashboard-card">
        <p className="credits-text">
          <strong>Available Credits:</strong> {credit}
        </p>

        <div className="file-input-container">
          <label>Person 1 Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile1(e.target.files[0])}
            className="file-input"
          />
          <label>Person 2 Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile2(e.target.files[0])}
            className="file-input"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || credit < 20}
          className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-full font-bold text-lg transition shadow-lg shadow-blue-600/40"
        >
          {loading ? "Generating…" : "Upload & Generate"}
        </button>

        {credit < 20 && (
          <p className="insufficient-credits">
            Insufficient credits (20 required)
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
                        <Image
                          src={result.output.images[0].url}
                          alt="Generated Image"
                          className="caricature-image"
                          width="400"
                          height="400"
                          unoptimized={true}
                          priority={true}
                          onError={() => console.error("Failed to load generated image")}
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
