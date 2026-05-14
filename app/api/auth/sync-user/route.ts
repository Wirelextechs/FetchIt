import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// POST /api/auth/sync-user
// Called after successful sign-up to ensure a public.users record exists.
// Uses the service role key to bypass RLS.
export async function POST(req: Request) {
  try {
    const { userId, phone } = await req.json();

    if (!userId || !phone) {
      return NextResponse.json({ error: 'Missing userId or phone' }, { status: 400 });
    }

    // Upsert into public.users — if already exists, do nothing
    const { error } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          id: userId,
          phone: phone,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'id', ignoreDuplicates: true }
      );

    if (error) {
      console.error('[sync-user] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[sync-user] Fatal:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
