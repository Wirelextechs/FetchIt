-- ==========================================
-- UPDATE POLICY FOR GIGS TABLE (ACCEPT GIG FIX)
-- ==========================================

-- 1. Ensure Row Level Security is enabled on gigs
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;

-- 2. Drop any conflicting or existing update policy for gigs
DROP POLICY IF EXISTS "Allow riders to accept pending gigs" ON public.gigs;
DROP POLICY IF EXISTS "Allow riders to update pending gigs" ON public.gigs;

-- 3. Create the new UPDATE policy
-- This allows authenticated users (riders) to update a gig (transitioning it from 'pending' to 'assigned') 
-- only if the gig's current status is 'pending', and ensures they can only assign it to themselves.
CREATE POLICY "Allow riders to accept pending gigs"
ON public.gigs
FOR UPDATE
TO authenticated
USING (status = 'pending')
WITH CHECK (
  status = 'assigned' AND 
  assigned_rider_id = auth.uid()
);
