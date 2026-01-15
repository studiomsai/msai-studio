import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

fal.config({
  credentials: process.env.FAL_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("🔥 RAW REQUEST BODY:", body);

    const { userId, imageUrl } = body;

    // 🔴 HARD GUARD (MOST IMPORTANT LINE)
    if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim() === "") {
      console.error("❌ EMPTY imageUrl RECEIVED:", imageUrl);

      return NextResponse.json(
        {
          error: "Image URL is empty before calling FAL",
          receivedImageUrl: imageUrl,
        },
        { status: 400 }
      );
    }

    // 1️⃣ Credit check
    const { data: user, error } = await supabase
      .from("users")
      .select("available_credit")
      .eq("id", userId)
      .single();

    if (error) throw error;

    if (user.available_credit < 30) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 403 }
      );
    }

    console.log("✅ IMAGE URL SENT TO FAL:", imageUrl);

    // 2️⃣ Call FAL
    const stream = await fal.stream(
      "workflows/MSAI-Studio-is8ypgvdt74v/your-mood-today",
      {
        input: {
          upload_your_portrait: imageUrl,
          enable_safety_checker: true,
        },
      }
    );

    const result = await stream.done();

    // 3️⃣ Deduct credit
    await supabase
      .from("users")
      .update({
        available_credit: user.available_credit - 30,
      })
      .eq("id", userId);

    // 4️⃣ Upload result image and video to user folder
    if (result.output && result.output.images && result.output.images[0]) {
      try {
        const imageUrl = result.output.images[0].url;
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
        const filePath = `${userId}/result-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("profile-images")
          .upload(filePath, blob, {
            cacheControl: "3600",
            upsert: true,
          });
        if (uploadError) {
          console.error("❌ Upload failed for result image:", uploadError);
        } else {
          console.log("✅ Result image uploaded to:", filePath);
        }
      } catch (uploadErr) {
        console.error("🔥 Upload error for image:", uploadErr);
      }
    }


    // 5️⃣ Save work to database
    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("RUN-FAL ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
