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
    if (credit < 15) return alert("Insufficient credits");

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
      const res = await fetch("/api/run-fal-10-expression", {
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
      setCredit((c) => c - 15);
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
        10 Expression Images
      </h1>

      <div className="dashboard-card">
        <p className="credits-text">
          <strong>Available Credits:</strong><span className="text-green-500"> {credit} </span>
        </p>
        <p className="credits-text"><strong>Note:</strong> Minimum  <span className="text-green-500">15 credits </span>require</p>

        <div className="file-input-container">
            <p>Please upload the Image here:</p>
          <div className="file-input-wrapper">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="file-input" id="expression"
          />
          <label htmlFor="expression">Choose Image</label>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || credit < 15}
          className="primary-btn generate-button"
        >
          {loading ? "Generating…" : "Upload & Generate"}
        </button>

        {credit < 15 && (
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
                       <Image src={result.output.images[0].url} alt="Generated Image" className="expression-image" width={200} height={200} unoptimized={true}
                            priority={true}
                            onError={() => console.error("Failed to load generated image")}/>
                       <div className="absolute top-2 right-2 cursor-pointer bg-black p-3 rounded mr-1 download-btn" onClick={() => handleDownload(result.output.images[0].url, 'expression-1.jpg')}>
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                       </div>
                     </div>
                     <div className="relative group">
                       <Image src={result.output.images_2[0].url} alt="Generated Image" className="expression-image" width={200} height={200} unoptimized={true}
                            priority={true}
                            onError={() => console.error("Failed to load generated image")}/>
                       <div className="absolute top-2 right-2 cursor-pointer bg-black p-3 rounded mr-1 download-btn" onClick={() => handleDownload(result.output.images_2[0].url, 'expression-2.jpg')}>
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                       </div>
                     </div>
                     <div className="relative group">
                       <Image src={result.output.images_3[0].url} alt="Generated Image" className="expression-image" width={200} height={200} unoptimized={true}
                            priority={true}
                            onError={() => console.error("Failed to load generated image")}/>
                       <div className="absolute top-2 right-2 cursor-pointer bg-black p-3 rounded mr-1 download-btn" onClick={() => handleDownload(result.output.images_3[0].url, 'expression-3.jpg')}>
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                       </div>
                     </div>
                     <div className="relative group">
                       <Image src={result.output.images_4[0].url} alt="Generated Image" className="expression-image" width={200} height={200} unoptimized={true}
                            priority={true}
                            onError={() => console.error("Failed to load generated image")}/>
                       <div className="absolute top-2 right-2 cursor-pointer bg-black p-3 rounded mr-1 download-btn" onClick={() => handleDownload(result.output.images_4[0].url, 'expression-4.jpg')}>
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                       </div>
                     </div>
                     <div className="relative group">
                       <Image src={result.output.images_5[0].url} alt="Generated Image" className="expression-image" width={200} height={200} unoptimized={true}
                            priority={true}
                            onError={() => console.error("Failed to load generated image")}/>
                       <div className="absolute top-2 right-2 cursor-pointer bg-black p-3 rounded mr-1 download-btn" onClick={() => handleDownload(result.output.images_5[0].url, 'expression-5.jpg')}>
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                       </div>
                     </div>
                     <div className="relative group">
                       <Image src={result.output.images_6[0].url} alt="Generated Image" className="expression-image" width={200} height={200} unoptimized={true}
                            priority={true}
                            onError={() => console.error("Failed to load generated image")}/>
                       <div className="absolute top-2 right-2 cursor-pointer bg-black p-3 rounded mr-1 download-btn" onClick={() => handleDownload(result.output.images_6[0].url, 'expression-6.jpg')}>
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                       </div>
                     </div>
                     <div className="relative group">
                       <Image src={result.output.images_7[0].url} alt="Generated Image" className="expression-image" width={200} height={200}/>
                       <div className="absolute top-2 right-2 cursor-pointer bg-black p-3 rounded mr-1 download-btn" onClick={() => handleDownload(result.output.images_7[0].url, 'expression-7.jpg')}>
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                       </div>
                     </div>
                     <div className="relative group">
                       <Image src={result.output.images_8[0].url} alt="Generated Image" className="expression-image" width={200} height={200} unoptimized={true}
                            priority={true}
                            onError={() => console.error("Failed to load generated image")}/>
                       <div className="absolute top-2 right-2 cursor-pointer bg-black p-3 rounded mr-1 download-btn" onClick={() => handleDownload(result.output.images_8[0].url, 'expression-8.jpg')}>
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                       </div>
                     </div>
                     <div className="relative group">
                       <Image src={result.output.images_9[0].url} alt="Generated Image" className="expression-image" width={200} height={200} unoptimized={true}
                            priority={true}
                            onError={() => console.error("Failed to load generated image")}/>
                       <div className="absolute top-2 right-2 cursor-pointer bg-black p-3 rounded mr-1 download-btn" onClick={() => handleDownload(result.output.images_9[0].url, 'expression-9.jpg')}>
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                       </div>
                     </div>
                      <div className="relative group">
                        <Image src={result.output.images_10[0].url} alt="Generated Image" className="expression-image" width={200} height={200} unoptimized={true}
                             priority={true}
                             onError={() => console.error("Failed to load generated image")}/>
                        <div className="absolute top-2 right-2 cursor-pointer bg-black p-3 rounded mr-1 download-btn" onClick={() => handleDownload(result.output.images_10[0].url, 'expression-10.jpg')}>
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
