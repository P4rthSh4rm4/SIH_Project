-- Migration: Add mode and media_metrics to mock_interviews table
ALTER TABLE mock_interviews
ADD COLUMN IF NOT EXISTS mode text DEFAULT 'Text',
ADD COLUMN IF NOT EXISTS media_metrics jsonb DEFAULT '{}'::jsonb;
