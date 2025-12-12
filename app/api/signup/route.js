import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { email, password, name, phone } = await request.json();

    // Sign up the user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        display_name: name,
        phone: phone
      },
      email_confirm: true // Auto-confirm email for testing, remove in production
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Insert into users table
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        full_name: name,
        email: email,
        phone: phone,
        profile_image: null,
        available_credit: 20,
        total_credit: 20
      });

    if (insertError) {
      console.error('Error inserting user:', insertError);
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: data.user
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
