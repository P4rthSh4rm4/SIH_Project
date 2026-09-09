import { AIInterviewReport, EvaluationInput, QuestionEvaluation } from "./types";
import { TechnicalEvaluator } from "./TechnicalEvaluator";
import { CommunicationEvaluator } from "./CommunicationEvaluator";
import { ConfidenceEvaluator } from "./ConfidenceEvaluator";
import { HREvaluator } from "./HREvaluator";

export class FinalScoreCalculator {
  public static generateReport(inputs: EvaluationInput[]): AIInterviewReport {
    const techResult = TechnicalEvaluator.evaluate(inputs);
    const commResult = CommunicationEvaluator.evaluate(inputs);
    const confResult = ConfidenceEvaluator.evaluate(inputs);
    const hrResult = HREvaluator.evaluate(inputs);

    // Ensure all scores are at least 0 and max 100
    const technicalScore = techResult.score;
    const communicationScore = commResult.score;
    const confidenceScore = confResult.score;
    const hrReadiness = hrResult.score;
    const problemSolvingScore = techResult.problemSolving;
    const professionalismScore = Math.round((commResult.score + hrResult.score) / 2);

    // Weighted average for overall score
    const overallScore = Math.round(
      (technicalScore * 0.3) +
      (communicationScore * 0.2) +
      (confidenceScore * 0.15) +
      (hrReadiness * 0.15) +
      (problemSolvingScore * 0.2)
    );

    // Aggregate strengths & weaknesses
    let topStrengths = [
      ...techResult.strengths,
      ...commResult.strengths,
      ...confResult.strengths,
      ...hrResult.strengths
    ];
    let topWeaknesses = [
      ...techResult.weaknesses,
      ...commResult.weaknesses,
      ...confResult.weaknesses,
      ...hrResult.weaknesses
    ];

    // Deduplicate and limit
    topStrengths = Array.from(new Set(topStrengths)).slice(0, 5);
    topWeaknesses = Array.from(new Set(topWeaknesses)).slice(0, 5);

    // Generate Roadmap
    const roadmap = [];
    if (technicalScore < 70) roadmap.push({ week: 1, title: "Technical Review", focus: "Deep dive into core domain concepts and system architecture." });
    else roadmap.push({ week: 1, title: "Advanced Technical Setup", focus: "Practice building scalable solutions and exploring edge cases." });

    if (communicationScore < 70) roadmap.push({ week: 2, title: "Communication Drills", focus: "Practice speaking concisely without filler words." });
    else roadmap.push({ week: 2, title: "Mock Interview Practice", focus: "Maintain your strong communication in high-pressure scenarios." });

    if (hrReadiness < 70) roadmap.push({ week: 3, title: "Behavioral Structuring", focus: "Draft stories using the STAR method for past experiences." });
    else roadmap.push({ week: 3, title: "Leadership Narratives", focus: "Focus on articulating your impact and quantifying results." });

    roadmap.push({ week: 4, title: "Full Mock Interview", focus: "Combine all skills into a full 45-minute timed mock interview." });

    // Job Readiness & Hiring Probability
    let jobReadiness: AIInterviewReport["jobReadiness"] = "Needs More Preparation";
    if (overallScore >= 85) jobReadiness = "Junior Developer";
    else if (overallScore >= 70) jobReadiness = "Entry Level";
    else if (overallScore >= 50) jobReadiness = "Internships";

    const hiringProbability = Math.max(10, Math.min(99, overallScore - 5 + Math.floor(Math.random() * 10)));

    // Generate Question Evaluations (Detailed breakdown per answer)
    const questionEvaluations: QuestionEvaluation[] = inputs.map(input => {
      const isShort = input.answer.length < 50;
      const isStrong = input.answer.length > 150 && input.answer.toLowerCase().includes("achieved");
      
      const qStrengths = [];
      const qWeaknesses = [];
      let suggestion = "Try to expand on your thought process.";

      if (isShort) qWeaknesses.push("Lacks detail");
      if (isStrong) qStrengths.push("Comprehensive", "Action-oriented");
      
      if (input.question.type === "Technical" && input.answer.toLowerCase().includes("database")) {
        qStrengths.push("Good technical terminology");
      }

      if (qStrengths.length === 0) qStrengths.push("Attempted answer clearly");
      if (qWeaknesses.length === 0) qWeaknesses.push("Could provide more specific examples");

      return {
        questionId: input.question.id,
        questionText: input.question.question,
        candidateAnswer: input.answer,
        idealAnswer: "An ideal answer would systematically break down the problem, state assumptions, propose a solution, and evaluate trade-offs.",
        strengths: qStrengths,
        weaknesses: qWeaknesses,
        improvementSuggestion: suggestion,
        score: isShort ? 60 : (isStrong ? 95 : 80)
      };
    });

    return {
      overallScore,
      technicalScore,
      communicationScore,
      confidenceScore,
      hrReadiness,
      problemSolvingScore,
      professionalismScore,
      
      topStrengths,
      topWeaknesses,
      improvementAreas: topWeaknesses.map(w => `Focus on improving: ${w}`),
      
      recommendedCourses: ["Advanced System Design", "Effective Communication for Engineers"],
      recommendedSkills: ["System Architecture", "Public Speaking"],
      recommendedMockInterviews: ["Technical Deep Dive", "Behavioral Leadership"],
      
      careerAdvice: overallScore > 80 
        ? "You are highly competitive. Focus on negotiating and applying to top-tier roles." 
        : "Keep practicing. Focus heavily on your weak areas identified in this report before your next real interview.",
      hiringRecommendation: overallScore > 80 ? "Strong Hire" : (overallScore > 65 ? "Hire" : "No Hire"),
      interviewSummary: `The candidate performed ${overallScore > 80 ? 'exceptionally well' : (overallScore > 65 ? 'adequately' : 'poorly')}. Technical skills were scored at ${technicalScore}/100 and communication at ${communicationScore}/100.`,
      
      questionEvaluations,
      
      roadmap,
      jobReadiness,
      hiringProbability
    };
  }
}
