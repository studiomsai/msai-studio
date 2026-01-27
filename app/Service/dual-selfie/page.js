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
      router.push('/Page/login');
    }
  }, [authLoading, user, router]);

  /* ▶ Upload & Generate */
  const handleGenerate = async () => {
    if (!user) return alert("Please login");
    if (!file1 || !file2) return alert("Please select both images");
    if (credit < 2) return alert("Insufficient credits");

    setLoading(true);
    setResult(null);
    document.body.classList.add("generating-work");

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
      setCredit((c) => c - 2);

      // Upload result image to user folder
      if (json.result && json.result.output && json.result.output.images && json.result.output.images[0]) {
        try {
          const imageUrl = json.result.output.images[0].url;
          const response = await fetch(imageUrl);
          if (!response.ok) throw new Error('Failed to fetch result image');
          const blob = await response.blob();
          const contentType = response.headers.get('content-type');
          let ext = 'png'; // default
          if (contentType) {
            if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg';
            else if (contentType.includes('png')) ext = 'png';
            else if (contentType.includes('gif')) ext = 'gif';
            // add more if needed
          }
          const filePath = `${user.id}/result-${Date.now()}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("profile-images")
            .upload(filePath, blob, {
              cacheControl: "3600",
              upsert: true,
            });
          console.log("filePath", filePath);
          if (uploadError) {
            console.error("❌ Upload failed for result image:", uploadError);
            alert("Result generated but failed to save to profile");
          } else {
            console.log("✅ Result image uploaded to:", filePath);
          }
        } catch (uploadErr) {
          console.error("🔥 Upload error:", uploadErr);
          alert("Result generated but failed to save to profile");
        }
      }
    } catch (err) {
      console.error("🔥 Generate error:", err);
      alert(err.message);
    } finally {
      document.body.classList.remove("generating-work");
      setLoading(false);
    }
  };

  if (authLoading) return <p style={{ padding: 30 }} className="loading-page"> <Image
                                src="/icon/galaxy-loading.gif"
                                alt="Loading"
                                className="loading-image"
                                width="200"
                                height="200"
                              /></p>;
  if (!user) return null; // This should not be reached due to redirect

  return (
    <div className="dashboard-container container mx-auto">
      <h1 className="text-2xl md:text-4xl font-medium text-center mb-8 sub-title w-full mt-20">
        Dual Selfie
      </h1>

      <div className="dashboard-card">
        <p className="credits-text">
          <strong>Available Credits:</strong><span className="text-green-500"> {credit} </span> 
        </p>
        <p className="credits-text"><strong>Note:</strong> Minimum  <span className="text-green-500">2 credits </span>require</p>

        <div className="file-input-container">
         <p>Person 1 Image</p>
          <div className="file-input-wrapper">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile1(e.target.files[0])}
              className="file-input" id="person1"
              />
              <label htmlFor="person1">Choose Person Image</label>
          </div>
          <p>Person 2 Image</p>
          <div className="file-input-wrapper">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile2(e.target.files[0])}
              className="file-input" id="person2"
            />
            <label htmlFor="person2">Choose Person Image</label>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || credit < 2}
          className="primary-btn generate-button"
        >
          {loading ? "Generating…" : "Upload & Generate"}
        </button>

        {credit < 2 && (
          <p className="insufficient-credits">
            Insufficient credits 
          </p>
        )}
    </div>
        <div className="result-section p-6 rounded-lg shadow-md w-full max-w-4xl">
          <h3 className="results-title">Results:</h3>
          {!result && (
            <div className="loader-wrapper">
              <div className="orbital">
                <div className="ringOne"></div>
                <div className="ringTwo"></div>
                <div className="ringThree"></div>
                <div className="core">
                  <Image
                                src="/icon/loader.png"
                                alt="Generated Image"
                                className="setting-image"
                                width="400"
                                height="400"
                              />
                </div>
                <div className="spin"></div>
              </div>
            </div>
          )}
        {result && (
          <div className="results-container">
                   
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
    </div>
  );
}
