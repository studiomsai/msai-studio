import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { name, email, phone, country, comments } = await request.json()

    // Basic validation
    if (!name || !email || !comments) {
      return NextResponse.json(
        { error: 'Name, email, and comments are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Insert into Supabase contact table
    const { data, error } = await supabase
      .from('contact')
      .insert([
        {
          name,
          email,
          phone: phone || null,
          country: country || null,
          comments,
          created_at: new Date().toISOString()
        }
      ])

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save contact form' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Contact form submitted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
