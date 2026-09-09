-- Create the mock_interviews table
CREATE TABLE mock_interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    interview_type TEXT NOT NULL,
    career_path TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_taken INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'In Progress',
    
    -- Future AI Scoring Placeholders
    technical_score INTEGER,
    communication_score INTEGER,
    confidence_score INTEGER,
    problem_solving_score INTEGER,
    grammar_score INTEGER,
    overall_score INTEGER,
    ai_feedback JSONB
);

-- Add comments for documentation
COMMENT ON TABLE mock_interviews IS 'Stores student AI mock interview attempts and future AI evaluation scores';
COMMENT ON COLUMN mock_interviews.questions IS 'Array of question objects generated for the interview';
COMMENT ON COLUMN mock_interviews.answers IS 'Key-value map of question ID to student text answer';
COMMENT ON COLUMN mock_interviews.status IS 'Can be: In Progress, Completed, Abandoned';

-- Enable Row Level Security (RLS)
ALTER TABLE mock_interviews ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Students can select their own interviews
CREATE POLICY "Students can view their own mock interviews"
    ON mock_interviews FOR SELECT
    USING (auth.uid() = student_id);

-- Students can insert their own interviews
CREATE POLICY "Students can insert their own mock interviews"
    ON mock_interviews FOR INSERT
    WITH CHECK (auth.uid() = student_id);

-- Students can update their own interviews (for auto-saving progress)
CREATE POLICY "Students can update their own mock interviews"
    ON mock_interviews FOR UPDATE
    USING (auth.uid() = student_id)
    WITH CHECK (auth.uid() = student_id);

-- Create index for faster queries by student
CREATE INDEX idx_mock_interviews_student_id ON mock_interviews(student_id);
