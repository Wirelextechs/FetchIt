-- 1. Add assigned_rider_id to gigs if it doesn't exist
ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS assigned_rider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Update status check constraint for gigs if applicable (Next.js/Supabase doesn't always have one, but good to be safe)
-- ALTER TABLE public.gigs DROP CONSTRAINT IF EXISTS gigs_status_check;
-- ALTER TABLE public.gigs ADD CONSTRAINT gigs_status_check CHECK (status IN ('pending', 'assigned', 'completed', 'cancelled', 'expired'));

-- 3. Nuclear RLS Fix for chat_sessions
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.chat_sessions;

CREATE POLICY "Enable read/insert/update for participants"
ON public.chat_sessions
FOR ALL
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = rider_id)
WITH CHECK (auth.uid() = user_id OR auth.uid() = rider_id);

-- 4. Nuclear RLS Fix for messages
DROP POLICY IF EXISTS "Users can manage messages in their sessions" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages in their sessions" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

CREATE POLICY "Enable read/insert for participants"
ON public.messages
FOR ALL
TO authenticated
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

-- 5. Profiles (users table) RLS Fix
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.users;
CREATE POLICY "Authenticated users can view basic profiles"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- 6. Ensure real-time is enabled for these tables (re-run to be sure)
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
