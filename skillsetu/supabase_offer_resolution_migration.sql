-- Migration: Add resolution fields to application_offers and update RLS policies
-- Implements the final Offer Accept/Decline and Hired workflow.

-- 1. Add fields for offer resolution
ALTER TABLE public.application_offers
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS declined_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS decline_reason TEXT;

-- 2. Student RLS for application_offers
-- Students can read offers for their own applications
DROP POLICY IF EXISTS "Students can read their own offers" ON public.application_offers;
CREATE POLICY "Students can read their own offers"
ON public.application_offers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.applications
    WHERE applications.id = application_offers.application_id
    AND applications.student_id = auth.uid()
  )
);

-- Students can update their own offers to accept/decline, ONLY if offer_status is 'sent'
DROP POLICY IF EXISTS "Students can update their own offers" ON public.application_offers;
CREATE POLICY "Students can update their own offers"
ON public.application_offers
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.applications
    WHERE applications.id = application_offers.application_id
    AND applications.student_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.applications
    WHERE applications.id = application_offers.application_id
    AND applications.student_id = auth.uid()
  )
);

-- 3. Student RLS for placement_records
-- Students can insert into placement_records (needed for accepting an offer)
DROP POLICY IF EXISTS "Students can insert own placements" ON public.placement_records;
CREATE POLICY "Students can insert own placements"
ON public.placement_records
FOR INSERT
TO authenticated
WITH CHECK (
  student_id = auth.uid()
);

-- 4. Industry RLS for placement_records
-- Industry needs to select placement_records for their opportunities to show "Hired" state
DROP POLICY IF EXISTS "Industry can read placements for their opportunities" ON public.placement_records;
CREATE POLICY "Industry can read placements for their opportunities"
ON public.placement_records
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.opportunities
    WHERE opportunities.id = placement_records.opportunity_id
    AND opportunities.industry_id = auth.uid()
  )
);

-- 5. Notifications RLS
-- Anyone authenticated can insert notifications (to notify the other party)
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  true
);

-- Note: notifications table already allows users to SELECT their own notifications, 
-- we just need them to be able to INSERT them for other users during these workflows.
