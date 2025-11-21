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

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}