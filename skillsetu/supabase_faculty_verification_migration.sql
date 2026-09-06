-- Migration: Faculty Verification Workflow
-- Run this in your Supabase SQL editor to support Academician verifications

-- 1. Add verification_status to opportunities
ALTER TABLE public.opportunities 
ADD COLUMN verification_status TEXT DEFAULT 'pending' 
CHECK (verification_status IN ('pending', 'approved', 'rejected'));

-- Update existing active opportunities to be approved (assuming they were already verified)
UPDATE public.opportunities SET verification_status = 'approved' WHERE status = 'active';

-- 2. Update status constraint on applications to include pending_faculty and faculty_rejected
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE public.applications 
ADD CONSTRAINT applications_status_check 
CHECK (status IN ('pending_faculty', 'faculty_rejected', 'applied', 'shortlisted', 'interview', 'offer', 'rejected', 'withdrawn'));

-- Set the default value to pending_faculty so new applications are sent to faculty first
ALTER TABLE public.applications ALTER COLUMN status SET DEFAULT 'pending_faculty';
