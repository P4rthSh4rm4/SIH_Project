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
  score: number;
}

export interface AIInterviewReport {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  hrReadiness: number;
  problemSolvingScore: number;
  professionalismScore: number;
  
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
  jobReadiness: "Internships" | "Entry Level" | "Junior Developer" | "Needs More Preparation";
  hiringProbability: number;
}
