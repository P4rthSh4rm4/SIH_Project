import { InterviewQuestion } from "@/lib/data/mock-interview-questions";

export interface EvaluationInput {
  question: InterviewQuestion;
  answer: string;
}

export interface QuestionEvaluation {
  questionId: string;
  questionText: string;
  candidateAnswer: string;
  idealAnswer: string;
  strengths: string[];
  weaknesses: string[];
  improvementSuggestion: string;
  score: number | null;
  skipped?: boolean;
}

export interface AIInterviewReport {
  overallScore: number | null;
  technicalScore: number | null;
  communicationScore: number | null;
  confidenceScore: number | null;
  hrReadiness: number | null;
  problemSolvingScore: number | null;
  professionalismScore: number | null;
  
  topStrengths: string[];
  topWeaknesses: string[];
  improvementAreas: string[];
  recommendedCourses: string[];
  recommendedSkills: string[];
  recommendedMockInterviews: string[];
  careerAdvice: string;
  hiringRecommendation: string;
  interviewSummary: string;
  
  questionEvaluations: QuestionEvaluation[];
  
  roadmap: { week: number; title: string; focus: string }[];
  jobReadiness: "Internships" | "Entry Level" | "Junior Developer" | "Needs More Preparation" | "Not Evaluated";
  hiringProbability: number | null;

  status: "Completed" | "Incomplete" | "Partially Completed";
  completionPercentage: number;
  answeredQuestions: number;
  totalQuestions: number;
}
