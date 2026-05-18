-- 1. Ensure chat_sessions has all necessary columns
ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS rider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS gig_id UUID REFERENCES public.gigs(id) ON DELETE SET NULL;
ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS direct_request_id UUID REFERENCES public.direct_requests(id) ON DELETE SET NULL;
ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed'));
ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS escrow_amount NUMERIC DEFAULT 0;
ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS escrow_released BOOLEAN DEFAULT FALSE;

-- 2. Ensure messages has all necessary columns
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_text TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';

-- Handle legacy 'text' column if it exists and 'message_text' doesn't have data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='text') THEN
        UPDATE public.messages SET message_text = text WHERE message_text IS NULL;
    END IF;
END $$;

-- 3. Ensure gigs has assigned_rider_id
ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS assigned_rider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. APPLY NUCLEAR RLS POLICIES (Bypass all previous blocks)

-- For users (profiles)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view basic profiles" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.users;
CREATE POLICY "Enable select for all authenticated" ON public.users FOR SELECT TO authenticated USING (true);

-- For chat_sessions
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read/insert/update for participants" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.chat_sessions;
CREATE POLICY "Enable all for participants" ON public.chat_sessions FOR ALL TO authenticated
USING (auth.uid() = user_id OR auth.uid() = rider_id)
WITH CHECK (auth.uid() = user_id OR auth.uid() = rider_id);

-- For messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read/insert for participants" ON public.messages;
DROP POLICY IF EXISTS "Users can manage messages in their sessions" ON public.messages;
CREATE POLICY "Enable all for session participants" ON public.messages FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.chat_sessions
        WHERE id = messages.session_id
        AND (user_id = auth.uid() OR rider_id = auth.uid())
    )
)
WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.chat_sessions
        WHERE id = session_id
        AND (user_id = auth.uid() OR rider_id = auth.uid())
    )
);

-- 5. Finalize Real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
