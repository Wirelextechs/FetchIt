-- ==========================================
-- DATABASE SCHEMA UPDATE: KYC IDENTITY VERIFICATION
-- ==========================================

-- 1. Add is_verified column to public.users (profiles) table
-- This supports the Guest -> Unverified Rider -> Verified Rider funnel
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- 2. Backfill existing riders to default to unverified
UPDATE public.users SET is_verified = FALSE WHERE is_verified IS NULL;
