-- ==========================================
-- FETCHIT RIDER PROFILE & ZONE PRICING SCHEMA
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Extend public.users table with Avatar and Zone Pricing Matrix
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS price_within_city NUMERIC DEFAULT 15;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS price_around_city NUMERIC DEFAULT 30;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS price_outside_city NUMERIC DEFAULT 50;

-- 2. Initialize the 'avatars' storage bucket inside Supabase Storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Drop existing policies to prevent conflicts upon re-execution
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own avatars" ON storage.objects;

-- 4. Enable Storage RLS Policies for the avatars bucket
CREATE POLICY "Allow authenticated users to upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow public read access to avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Allow authenticated users to update their own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = owner);

CREATE POLICY "Allow authenticated users to delete their own avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = owner);
