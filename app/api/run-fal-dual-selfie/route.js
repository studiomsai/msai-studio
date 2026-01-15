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

    const { userId, imageUrl1, imageUrl2 } = body;

    // 🔴 HARD GUARD (MOST IMPORTANT LINE)
    if (!imageUrl1 || typeof imageUrl1 !== "string" || imageUrl1.trim() === "") {
      console.error("❌ EMPTY imageUrl1 RECEIVED:", imageUrl1);

      return NextResponse.json(
        {
          error: "First image URL is empty before calling FAL",
          receivedImageUrl: imageUrl1,
        },
        { status: 400 }
      );
    }

    if (!imageUrl2 || typeof imageUrl2 !== "string" || imageUrl2.trim() === "") {
      console.error("❌ EMPTY imageUrl2 RECEIVED:", imageUrl2);

      return NextResponse.json(
        {
          error: "Second image URL is empty before calling FAL",
          receivedImageUrl: imageUrl2,
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

    if (user.available_credit < 2) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 403 }
      );
    }

    console.log("✅ IMAGE URLs SENT TO FAL:", { imageUrl1, imageUrl2 });

    // 2️⃣ Call FAL
    const stream = await fal.stream(
      "workflows/MSAI-Studio-is8ypgvdt74v/dual-selfie-shot",
      {
        input: {
          person_1: imageUrl1,
          person_2: imageUrl2,
        },
      }
    );

    const result = await stream.done();

    // 3️⃣ Deduct credit
    await supabase
      .from("users")
      .update({
        available_credit: user.available_credit - 2,
      })
      .eq("id", userId);

    // 4️⃣ Save work to database
   

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("RUN-FAL ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
