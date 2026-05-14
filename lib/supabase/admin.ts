import { createClient } from '@supabase/supabase-js';

// Service role client — bypasses RLS. NEVER expose this on the client side.
// Only used in API routes (server-side).
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
