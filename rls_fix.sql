-- Update RLS for chat_sessions
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.chat_sessions;
CREATE POLICY "Users can manage their own sessions"
ON public.chat_sessions
FOR ALL -- Covers SELECT, INSERT, UPDATE, DELETE
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = rider_id)
WITH CHECK (auth.uid() = user_id OR auth.uid() = rider_id);

-- Update RLS for messages
DROP POLICY IF EXISTS "Users can view messages in their sessions" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

CREATE POLICY "Users can manage messages in their sessions"
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
