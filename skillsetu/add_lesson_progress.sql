-- Add lesson_progress_json column to learning_enrollments table
ALTER TABLE public.learning_enrollments 
ADD COLUMN IF NOT EXISTS lesson_progress_json JSONB DEFAULT '{}'::jsonb;
