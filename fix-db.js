// fix-db.js — Run via: node fix-db.js
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.lfkckxzgjqxguwwjwzyu:$Hydrogen5@fetchit@aws-0-eu-west-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
  query_timeout: 30000,
});

const migrations = [
  // ── Schema fixes ─────────────────────────────────────────────
  `ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS gig_type TEXT NOT NULL DEFAULT 'delivery'`,
  `ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS pickup_landmark TEXT`,
  `ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS dropoff_landmark TEXT`,
  `ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS offered_price NUMERIC DEFAULT 0`,
  `ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS is_visible_to_all BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS published_to_all_at TIMESTAMPTZ DEFAULT NOW()`,

  // ── Remove broken FK so user_id maps directly to auth.uid() ──
  // The FK gigs_user_id_fkey references public.users.id
  // but Supabase Auth users only exist in auth.users automatically.
  // We drop the FK and re-add it referencing auth.users instead.
  `ALTER TABLE public.gigs DROP CONSTRAINT IF EXISTS gigs_user_id_fkey`,
  `DELETE FROM public.messages WHERE session_id IN (SELECT id FROM public.chat_sessions WHERE gig_id IN (SELECT id FROM public.gigs WHERE user_id NOT IN (SELECT id FROM auth.users)))`,
  `DELETE FROM public.chat_wallets WHERE session_id IN (SELECT id FROM public.chat_sessions WHERE gig_id IN (SELECT id FROM public.gigs WHERE user_id NOT IN (SELECT id FROM auth.users)))`,
  `DELETE FROM public.chat_sessions WHERE gig_id IN (SELECT id FROM public.gigs WHERE user_id NOT IN (SELECT id FROM auth.users))`,
  `DELETE FROM public.gigs WHERE user_id NOT IN (SELECT id FROM auth.users)`,
  // Re-add FK to auth.users so auth.uid() matches
  `ALTER TABLE public.gigs 
     ADD CONSTRAINT gigs_user_id_fkey 
     FOREIGN KEY (user_id) 
     REFERENCES auth.users(id) ON DELETE CASCADE`,

  // ── RLS Policies ─────────────────────────────────────────────
  `DROP POLICY IF EXISTS "Users can insert their own gigs" ON public.gigs`,
  `DROP POLICY IF EXISTS "Authenticated users can view gigs" ON public.gigs`,
  `DROP POLICY IF EXISTS "Users can update their own gigs" ON public.gigs`,

  `CREATE POLICY "Users can insert their own gigs"
   ON public.gigs FOR INSERT TO authenticated
   WITH CHECK (auth.uid() = user_id)`,

  `CREATE POLICY "Authenticated users can view gigs"
   ON public.gigs FOR SELECT TO authenticated
   USING (true)`,

  `CREATE POLICY "Users can update their own gigs"
   ON public.gigs FOR UPDATE TO authenticated
   USING (auth.uid() = user_id)`,

  // ── Users Table Policies ──────────────────────────────────────
  `DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.users`,
  `DROP POLICY IF EXISTS "Users can update their own profile" ON public.users`,

  `CREATE POLICY "Authenticated users can view profiles"
   ON public.users FOR SELECT TO authenticated
   USING (true)`,

  `CREATE POLICY "Users can update their own profile"
   ON public.users FOR UPDATE TO authenticated
   USING (auth.uid() = id)`,

  // ── Saved Locations Table ─────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS public.saved_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    description TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `ALTER TABLE public.saved_locations ENABLE ROW LEVEL SECURITY`,

  `DROP POLICY IF EXISTS "Users can manage their own locations" ON public.saved_locations`,
  `CREATE POLICY "Users can manage their own locations"
   ON public.saved_locations FOR ALL TO authenticated
   USING (auth.uid() = user_id)
   WITH CHECK (auth.uid() = user_id)`,

  // ── Auto-sync auth.users → public.users trigger ───────────────
  // This ensures every new Supabase Auth user also gets a public.users record
  `CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
   RETURNS trigger AS $$
   BEGIN
     INSERT INTO public.users (id, phone_number, created_at)
     VALUES (
       NEW.id,
       SPLIT_PART(NEW.email, '@', 1),
       NOW()
     )
     ON CONFLICT (id) DO NOTHING;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER`,

  `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users`,

  `CREATE TRIGGER on_auth_user_created
   AFTER INSERT ON auth.users
   FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user()`,

  // ── Direct Requests Table ─────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS public.direct_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rider_id UUID NOT NULL, -- Temporarily removed FK for testing with dummy IDs
    pickup_landmark TEXT NOT NULL,
    dropoff_landmark TEXT NOT NULL,
    offered_price NUMERIC DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'expired'
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `ALTER TABLE public.direct_requests ENABLE ROW LEVEL SECURITY`,

  `ALTER TABLE public.direct_requests DROP CONSTRAINT IF EXISTS direct_requests_rider_id_fkey`,

  `DROP POLICY IF EXISTS "Users can manage their own direct requests" ON public.direct_requests`,
  `CREATE POLICY "Users can manage their own direct requests"
   ON public.direct_requests FOR ALL TO authenticated
   USING (auth.uid() = user_id OR auth.uid() = rider_id)`,

  // ── Chat Sessions Table Updates ───────────────────────────────
  `CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'`,
  `ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS direct_request_id UUID REFERENCES public.direct_requests(id) ON DELETE SET NULL`,
  `ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS gig_id UUID REFERENCES public.gigs(id) ON DELETE SET NULL`,

  `ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY`,

  `DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.chat_sessions`,
  `CREATE POLICY "Users can view their own chat sessions"
   ON public.chat_sessions FOR ALL TO authenticated
   USING (true)`, // Simplified for MVP, ideally restricted by link tables

  // ── Messages Table ────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY`,

  `DROP POLICY IF EXISTS "Users can view messages in their sessions" ON public.messages`,
  `CREATE POLICY "Users can view messages in their sessions"
   ON public.messages FOR SELECT TO authenticated
   USING (true)`,

  `DROP POLICY IF EXISTS "Users can send messages" ON public.messages`,
  `CREATE POLICY "Users can send messages"
   ON public.messages FOR INSERT TO authenticated
   WITH CHECK (auth.uid() = sender_id)`,
  // ── Rider & Shopper Extensions ───────────────────────────────
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_company_rider BOOLEAN DEFAULT false`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC DEFAULT 0`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_lat NUMERIC`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_lng NUMERIC`,

  `CREATE TABLE IF NOT EXISTS public.rider_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    earnings NUMERIC DEFAULT 0,
    gigs_completed INTEGER DEFAULT 0,
    hours_online NUMERIC DEFAULT 0,
    UNIQUE(rider_id, date)
  )`,

  `ALTER TABLE public.rider_analytics ENABLE ROW LEVEL SECURITY`,

  `DROP POLICY IF EXISTS "Riders can view their own analytics" ON public.rider_analytics`,
  `CREATE POLICY "Riders can view their own analytics"
   ON public.rider_analytics FOR SELECT TO authenticated
   USING (auth.uid() = rider_id)`,

  `CREATE TABLE IF NOT EXISTS public.sos_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    latitude NUMERIC,
    longitude NUMERIC,
    status TEXT DEFAULT 'active', -- 'active', 'resolved'
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY`,

  `DROP POLICY IF EXISTS "Riders can manage their own SOS alerts" ON public.sos_alerts`,
  `CREATE POLICY "Riders can manage their own SOS alerts"
   ON public.sos_alerts FOR ALL TO authenticated
   USING (auth.uid() = rider_id)`,

  `CREATE TABLE IF NOT EXISTS public.payout_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    momo_number TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed'
    transaction_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `ALTER TABLE public.payout_ledger ENABLE ROW LEVEL SECURITY`,

  `DROP POLICY IF EXISTS "Riders can view their own payouts" ON public.payout_ledger`,
  `CREATE POLICY "Riders can view their own payouts"
   ON public.payout_ledger FOR SELECT TO authenticated
   USING (auth.uid() = rider_id)`,
];

async function run() {
  await client.connect();
  console.log('✅ Connected to Supabase PostgreSQL\n');

  for (const sql of migrations) {
    const label = sql.trim().split('\n')[0].substring(0, 80);
    try {
      await client.query(sql);
      console.log('✅', label);
    } catch (err) {
      console.log('⚠️ ', label);
      console.log('   →', err.message);
    }
  }

  await client.end();
  console.log('\n🎉 All migrations complete!');
}

run().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
