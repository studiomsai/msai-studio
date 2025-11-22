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
        'Accept': 'application/json'
      }
    })

    // Get text first to safely handle non-JSON errors
    const rawText = await response.text()

    try {
        const data = JSON.parse(rawText)
        return NextResponse.json(data)
    } catch (jsonError) {
        return NextResponse.json({ 
            status: 'UNKNOWN', 
            raw_content: rawText 
        })
    }

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}