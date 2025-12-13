import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function GET() {
  try {
    const stream = await fal.stream(
      "workflows/MSAI-Studio-is8ypgvdt74v/your-mood-today",
      {
        input: {
          enable_safety_checker: true,
          upload_your_portrait:
            "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png",
        },
      }
    );

    const result = await stream.done();

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err) {
    console.error("FAL STREAM ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
