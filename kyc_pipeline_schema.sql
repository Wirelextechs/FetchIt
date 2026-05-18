-- =======================================================
-- FETCHIT CUSTOM KYC PIPELINE SCHEMA
-- =======================================================

-- 1. Ensure users table has is_verified and full_name columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 2. Create KYC Submission Status Enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
    CREATE TYPE kyc_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$;

-- 3. Create KYC Submissions Table
CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provided_full_name TEXT NOT NULL,
  provided_id_number TEXT NOT NULL,
  id_card_url TEXT NOT NULL,
  selfie_url TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  license_plate TEXT NOT NULL,
  status kyc_status NOT NULL DEFAULT 'pending',
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on kyc_submissions
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

-- Drop old policies to prevent duplicate insertion errors
DROP POLICY IF EXISTS "Riders can insert their own submissions" ON public.kyc_submissions;
DROP POLICY IF EXISTS "Riders can select their own submissions" ON public.kyc_submissions;

-- Submissions Policies
CREATE POLICY "Riders can insert their own submissions"
  ON public.kyc_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "Riders can select their own submissions"
  ON public.kyc_submissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = rider_id);

-- 4. Supabase Storage Bucket Configuration
-- Insert bucket record if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc_documents',
  'kyc_documents',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop old storage policies to prevent duplicates
DROP POLICY IF EXISTS "Allow authenticated users to upload KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to read their own KYC documents" ON storage.objects;

-- Allow authenticated users to upload (insert) files into kyc_documents
-- Note: Row Level Security is already enabled on storage.objects by default in all Supabase instances.
CREATE POLICY "Allow authenticated users to upload KYC documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'kyc_documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to view (select) their own uploaded files
CREATE POLICY "Allow users to read their own KYC documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'kyc_documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
