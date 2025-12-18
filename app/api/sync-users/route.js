import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const dynamic = 'force-dynamic';

export async function POST(_request) { // eslint-disable-line @typescript-eslint/no-unused-vars
  try {
    // Fetch all authenticated users from Supabase Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('Error fetching auth users:', authError);
      return NextResponse.json({ error: 'Failed to fetch auth users' }, { status: 500 });
    }

    if (!authUsers || authUsers.users.length === 0) {
      return NextResponse.json({ message: 'No auth users found' }, { status: 200 });
    }

    // Get existing users from the users table
    const { data: existingUsers, error: existingError } = await supabase
      .from('users')
      .select('id');

    if (existingError) {
      console.error('Error fetching existing users:', existingError);
      return NextResponse.json({ error: 'Failed to fetch existing users' }, { status: 500 });
    }

    const existingUserIds = new Set(existingUsers.map(user => user.id));

    // Filter out users that already exist in the users table
    const usersToInsert = authUsers.users
      .filter(user => !existingUserIds.has(user.id))
      .map(user => ({
        id: user.id,
        full_name: user.user_metadata?.display_name || user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        profile_image: null,
        available_credit: 0,
        total_credit: 0
      }));

    if (usersToInsert.length === 0) {
      return NextResponse.json({
        message: 'All auth users are already synced to the users table',
        synced: 0
      }, { status: 200 });
    }

    // Insert missing users into the users table
    const { data: insertedUsers, error: insertError } = await supabase
      .from('users')
      .insert(usersToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting users:', insertError);
      return NextResponse.json({ error: 'Failed to insert users' }, { status: 500 });
    }

    return NextResponse.json({
      message: `Successfully synced ${insertedUsers.length} users to the users table`,
      synced: insertedUsers.length,
      users: insertedUsers
    }, { status: 200 });

  } catch (error) {
    console.error('Sync users error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
