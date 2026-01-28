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
  const [file, setFile] = useState(null);
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Function to handle direct download
   const handleDownload = async (url, filename = "dual-selfie.jpg") => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Download failed");

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("Download error:", err);
    alert("Failed to download image");
  }
};
  
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
    if (!file) return alert("Please select an image");
    if (credit <= 100) return alert("Insufficient credits");

    setLoading(true);
    setResult(null);
    document.body.classList.add("generating-work");

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
      const res = await fetch("/api/run-fal-popcorn-on-steroids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          imageUrl: imageUrl,
          story: story,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Generation failed");
      }

      setResult(json.result);
      setCredit((c) => c - 100);

      // Upload result images to user folder
      const imageArrays = [json.result.output?.images, json.result.output?.images_2, json.result.output?.images_3, json.result.output?.images_4, json.result.output?.images_5];
      for (let i = 0; i < imageArrays.length; i++) {
        const imageArray = imageArrays[i];
        if (imageArray && imageArray[0]) {
          try {
            const imageUrl = imageArray[0].url;
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
            const filePath = `${user.id}/result-${Date.now()}-${i}.${ext}`;
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
      }

      // Upload result video to user folder
      if (json.result && json.result.output && json.result.output.video && json.result.output.video.url) {
        try {
          const videoUrl = json.result.output.video.url;
          const response = await fetch(videoUrl);
          if (!response.ok) throw new Error('Failed to fetch result video');
          const blob = await response.blob();
          const contentType = response.headers.get('content-type');
          let ext = 'mp4'; // default
          if (contentType) {
            if (contentType.includes('mp4')) ext = 'mp4';
            else if (contentType.includes('webm')) ext = 'webm';
            else if (contentType.includes('avi')) ext = 'avi';
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
            console.error("❌ Upload failed for result video:", uploadError);
            alert("Result generated but failed to save to profile");
          } else {
            console.log("✅ Result video uploaded to:", filePath);
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
        Popcorn on Steroids
      </h1>

      <div className="dashboard-card">
        <p className="credits-text">
          <strong>Available Credits:</strong><span className="text-green-500"> {credit} </span>
        </p>
        <p className="credits-text"><strong>Note:</strong> Minimum  <span className="text-green-500">100 credits </span>require</p>

        <div className="file-input-container">
            <p>Please upload the Image here:</p>
          <div className="file-input-wrapper">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="file-input" id="popcorn"
          />
          <label htmlFor="popcorn">Choose Image</label>
          </div>
        </div>

        <div className="story-input-container">
          <label htmlFor="story" className="story-label">Your Story:</label>
          <textarea
            id="story"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Enter your story here..."
            className="story-textarea"
            rows={4}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || credit < 100}
          className="primary-btn generate-button"
        >
          {loading ? "Generating…" : "Upload & Generate"}
        </button>

        {credit < 100 && (
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
                  <h4 className="media-heading">Generated Images</h4>
                  <div className="flex flex-wrap gap-4">
                     <div className="relative group">
                       <Image src={result.output.images[0].url} alt="Generated Image" className="caricature-image" width="400" height="400" unoptimized={true}
                            priority={true}
                            onError={() => console.error("Failed to load generated image")}/>
                       <div className="absolute top-2 right-2 cursor-pointer bg-black p-3 rounded mr-1 download-btn" onClick={() => handleDownload(result.output.images[0].url, 'popcorn-1.jpg')}>
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                       </div>
                     </div>
                     <div className="relative group">
                       <Image src={result.output.images_2[0].url} alt="Generated Image" className="caricature-image" width="400" height="400" unoptimized={true}
                            priority={true}
                            onError={() => console.error("Failed to load generated image")}/>
                       <div className="absolute top-2 right-2 cursor-pointer bg-black p-3 rounded mr-1 download-btn" onClick={() => handleDownload(result.output.images_2[0].url, 'popcorn-2.jpg')}>
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                       </div>
                     </div>
                     <div className="relative group">
                       <Image src={result.output.images_3[0].url} alt="Generated Image" className="caricature-image" width="400" height="400" unoptimized={true}
                            priority={true}
                            onError={() => console.error("Failed to load generated image")}/>
                       <div className="absolute top-2 right-2 cursor-pointer bg-black p-3 rounded mr-1 download-btn" onClick={() => handleDownload(result.output.images_3[0].url, 'popcorn-3.jpg')}>
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                       </div>
                     </div>
                     <div className="relative group">
                       <Image src={result.output.images_4[0].url} alt="Generated Image" className="caricature-image" width="400" height="400" unoptimized={true}
                            priority={true}
                            onError={() => console.error("Failed to load generated image")}/>
                       <div className="absolute top-2 right-2 cursor-pointer bg-black p-3 rounded mr-1 download-btn" onClick={() => handleDownload(result.output.images_4[0].url, 'popcorn-4.jpg')}>
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                       </div>
                     </div>
                     <div className="relative group">
                       <Image src={result.output.images_5[0].url} alt="Generated Image" className="caricature-image" width="400" height="400" unoptimized={true}
                            priority={true}
                            onError={() => console.error("Failed to load generated image")}/>
                       <div className="absolute top-2 right-2 cursor-pointer bg-black p-3 rounded mr-1 download-btn" onClick={() => handleDownload(result.output.images_5[0].url, 'popcorn-5.jpg')}>
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                       </div>
                     </div>
                  </div>
                </div>
              )}
              {result.output?.video?.url && (
                <div className="media-item">
                  <h4 className="media-heading">Generated Video</h4>
                  <div className="relative group">
                    <video
                      controls
                      src={result.output.video.url}
                      className="generated-video"
                    />
                    <div className="absolute top-2 right-2 cursor-pointer bg-black p-3 rounded mr-1 download-btn z-10" onClick={() => handleDownload(result.output.video.url, 'popcorn-video.mp4')}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
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
