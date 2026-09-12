export type InterviewType = 'HR' | 'Technical' | 'Behavioral' | 'Aptitude' | 'Mixed';
export type InterviewDifficulty = 'Easy' | 'Medium' | 'Hard';
export type InterviewMode = 'Text' | 'Voice' | 'Video';

export interface InterviewQuestion {
  id: string;
  type: InterviewType;
  domain?: string; // Optional if it's general like HR
  difficulty: InterviewDifficulty;
  question: string;
  expectedKeywords?: string[]; // For future AI scoring
}

export const MOCK_QUESTIONS: InterviewQuestion[] = [
  // HR Questions
  { id: 'hr_1', type: 'HR', difficulty: 'Easy', question: 'Tell me about yourself and your background.' },
  { id: 'hr_2', type: 'HR', difficulty: 'Easy', question: 'Why do you want to work for our company?' },
  { id: 'hr_3', type: 'HR', difficulty: 'Medium', question: 'Where do you see yourself in 5 years?' },
  { id: 'hr_4', type: 'HR', difficulty: 'Medium', question: 'What are your greatest strengths and weaknesses?' },
  { id: 'hr_5', type: 'HR', difficulty: 'Hard', question: 'Tell me about a time you disagreed with a manager.' },
  
  // Behavioral Questions
  { id: 'beh_1', type: 'Behavioral', difficulty: 'Easy', question: 'Describe a time you worked successfully in a team.' },
  { id: 'beh_2', type: 'Behavioral', difficulty: 'Medium', question: 'Tell me about a time you had to meet a tight deadline.' },
  { id: 'beh_3', type: 'Behavioral', difficulty: 'Medium', question: 'How do you handle stress and pressure?' },
  { id: 'beh_4', type: 'Behavioral', difficulty: 'Hard', question: 'Give an example of a time when you showed initiative and took the lead.' },
  { id: 'beh_5', type: 'Behavioral', difficulty: 'Hard', question: 'Tell me about a time you failed and how you handled it.' },

  // Aptitude Questions
  { id: 'apt_1', type: 'Aptitude', difficulty: 'Easy', question: 'If 5 machines take 5 minutes to make 5 widgets, how long does it take 100 machines to make 100 widgets?' },
  { id: 'apt_2', type: 'Aptitude', difficulty: 'Medium', question: 'A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?' },
  { id: 'apt_3', type: 'Aptitude', difficulty: 'Hard', question: 'In a lake, there is a patch of lily pads. Every day, the patch doubles in size. If it takes 48 days to cover the entire lake, how long would it take to cover half of it?' },

  // Technical - General
  { id: 'tech_gen_1', type: 'Technical', difficulty: 'Easy', question: 'What is version control, and why is Git useful?' },
  { id: 'tech_gen_2', type: 'Technical', difficulty: 'Medium', question: 'Explain the difference between a process and a thread.' },
  { id: 'tech_gen_3', type: 'Technical', difficulty: 'Medium', question: 'What are RESTful APIs?' },
  { id: 'tech_gen_4', type: 'Technical', difficulty: 'Hard', question: 'Explain Time Complexity and Big O notation with examples.' },

  // Technical - Full Stack / Frontend / Backend
  { id: 'tech_fs_1', type: 'Technical', domain: 'Full Stack', difficulty: 'Medium', question: 'How do you handle state management in a large React application?' },
  { id: 'tech_fs_2', type: 'Technical', domain: 'Backend', difficulty: 'Medium', question: 'What is indexing in a database, and how does it improve query performance?' },
  { id: 'tech_fs_3', type: 'Technical', domain: 'Frontend', difficulty: 'Hard', question: 'Explain the Virtual DOM and how React reconciliation works.' },
  { id: 'tech_fs_4', type: 'Technical', domain: 'Full Stack', difficulty: 'Hard', question: 'How would you design a scalable microservices architecture for an e-commerce platform?' },

  // Technical - Data / AI
  { id: 'tech_da_1', type: 'Technical', domain: 'Data Analyst', difficulty: 'Medium', question: 'Explain the difference between supervised and unsupervised learning.' },
  { id: 'tech_da_2', type: 'Technical', domain: 'Data Analyst', difficulty: 'Hard', question: 'How do you handle missing or imbalanced data in a dataset?' },
  { id: 'tech_ai_1', type: 'Technical', domain: 'AI/ML', difficulty: 'Medium', question: 'What is overfitting in machine learning, and how can you prevent it?' },
  { id: 'tech_ai_2', type: 'Technical', domain: 'AI/ML', difficulty: 'Hard', question: 'Explain the architecture of a Transformer model and why attention mechanisms are important.' },
];

/**
 * Generates a mock interview question set simulating an AI backend.
 */
export function generateMockQuestions(
  type: InterviewType,
  domain: string,
  difficulty: InterviewDifficulty,
  count: number = 5
): InterviewQuestion[] {
  let pool = MOCK_QUESTIONS.filter(q => q.difficulty === difficulty);

  if (type === 'Mixed') {
    // Just get a bit of everything
    // No specific filter
  } else if (type === 'Technical') {
    // Filter by Technical and domain (fallback to general technical if specific domain questions aren't found)
    pool = pool.filter(q => 
      q.type === 'Technical' && (!q.domain || q.domain.toLowerCase().includes(domain.toLowerCase()) || domain.toLowerCase().includes(q.domain.toLowerCase()))
    );
    // If pool is too small, add general technical questions
    if (pool.length < count) {
       const generalTech = MOCK_QUESTIONS.filter(q => q.type === 'Technical' && !q.domain);
       pool = [...pool, ...generalTech];
    }
  } else {
    // HR, Behavioral, Aptitude
    pool = pool.filter(q => q.type === type);
  }

  // If we still don't have enough questions (due to small mock DB), relax the difficulty constraint
  if (pool.length < count) {
    const backupPool = MOCK_QUESTIONS.filter(q => q.type === type);
    pool = [...new Set([...pool, ...backupPool])];
  }

  // Shuffle array
  const shuffled = pool.sort(() => 0.5 - Math.random());
  
  // Return the requested count
  return shuffled.slice(0, count);
}
