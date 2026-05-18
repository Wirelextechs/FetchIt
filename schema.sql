-- 1. Create message_type ENUM if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_type') THEN
        CREATE TYPE message_type AS ENUM (
            'text',
            'system_escrow_released',
            'system_withdrawal_success',
            'system_mission_completed'
        );
    END IF;
END $$;

-- 2. Update/Create chat_sessions table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id UUID REFERENCES public.gigs(id) ON DELETE SET NULL,
    direct_request_id UUID REFERENCES public.direct_requests(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    escrow_amount NUMERIC DEFAULT 0,
    escrow_released BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was already there
ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS rider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS escrow_amount NUMERIC DEFAULT 0;
ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS escrow_released BOOLEAN DEFAULT FALSE;

-- 3. Update/Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    message_type message_type DEFAULT 'text',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Handle column rename/add if table was already there
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='text') THEN
        ALTER TABLE public.messages RENAME COLUMN "text" TO message_text;
    END IF;
END $$;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_type message_type DEFAULT 'text';

-- 4. Create user_transactions table
CREATE TABLE IF NOT EXISTS public.user_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL, -- 'debit', 'credit'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_transactions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Chat Sessions: Users can view sessions they are part of
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.chat_sessions;
CREATE POLICY "Users can view their own sessions"
ON public.chat_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = rider_id);

-- Messages: Users can view messages in sessions they are part of
DROP POLICY IF EXISTS "Users can view messages in their sessions" ON public.messages;
CREATE POLICY "Users can view messages in their sessions"
ON public.messages FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.chat_sessions
        WHERE id = messages.session_id
        AND (user_id = auth.uid() OR rider_id = auth.uid())
    )
);

-- Messages: Users can insert messages in active sessions they are part of
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.chat_sessions
        WHERE id = session_id
        AND status = 'active'
        AND (user_id = auth.uid() OR rider_id = auth.uid())
    )
);

-- User Transactions: Users can view their own transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.user_transactions;
CREATE POLICY "Users can view their own transactions"
ON public.user_transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 7. Enable Real-time
-- Adding tables to the supabase_realtime publication
BEGIN;
  -- Remove if already exists to avoid errors
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.chat_sessions;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.messages;

  -- Add tables
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
COMMIT;
