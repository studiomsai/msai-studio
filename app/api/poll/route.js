import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) return NextResponse.json({ error: 'Missing URL' }, { status: 400 })

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    // 1. Get Raw Text first (Prevents the JSON crash)
    const rawText = await response.text()

    // 2. Try to parse it as JSON
    try {
        const data = JSON.parse(rawText)
        return NextResponse.json(data)
    } catch (jsonError) {
        // 3. If not JSON, return the raw text so we can see what happened
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