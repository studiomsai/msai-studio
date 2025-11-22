import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) return NextResponse.json({ error: 'Missing URL' }, { status: 400 })

  try {
    // FIX: Removed 'Content-Type' header for GET requests.
    // We only send the Key.
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Accept': 'application/json' // Accept JSON, but don't claim to send it
      }
    })

    // 1. Get Raw Text first
    const rawText = await response.text()

    // 2. Try to parse
    try {
        const data = JSON.parse(rawText)
        return NextResponse.json(data)
    } catch (jsonError) {
        console.log("Non-JSON response from FAL:", rawText)
        return NextResponse.json({ 
            status: 'UNKNOWN', 
            raw_content: rawText,
            debug_note: "FAL returned non-JSON data" 
        })
    }

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}