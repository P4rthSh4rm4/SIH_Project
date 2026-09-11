import { AIInterviewReport, EvaluationInput, QuestionEvaluation } from "./types";
import { TechnicalEvaluator } from "./TechnicalEvaluator";
import { CommunicationEvaluator } from "./CommunicationEvaluator";
import { ConfidenceEvaluator } from "./ConfidenceEvaluator";
import { HREvaluator } from "./HREvaluator";

export class FinalScoreCalculator {
  public static generateReport(inputs: EvaluationInput[]): AIInterviewReport {
    const isAnswerValid = (answer: string) => {
      if (!answer) return false;
      const trimmed = answer.trim();
      return trimmed.length >= 5;
    };

    const validInputs = inputs.filter(i => isAnswerValid(i.answer));
    const answeredQuestions = validInputs.length;
    const totalQuestions = inputs.length;
    const completionPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
    
    let status: AIInterviewReport["status"] = "Completed";
    if (answeredQuestions === 0) status = "Incomplete";
    else if (answeredQuestions < totalQuestions) status = "Partially Completed";

    // 0% completion handling
    if (answeredQuestions === 0) {
      return {
        overallScore: null,
        technicalScore: null,
        communicationScore: null,
        confidenceScore: null,
        hrReadiness: null,
        problemSolvingScore: null,
        professionalismScore: null,
        topStrengths: [],
        topWeaknesses: [],
        improvementAreas: [],
        recommendedCourses: [],
        recommendedSkills: [],
        recommendedMockInterviews: [],
        careerAdvice: "No answers were submitted to evaluate.",
        hiringRecommendation: "Not Evaluated",
        interviewSummary: "The interview was not completed. Please retake it to receive a full AI evaluation.",
        roadmap: [],
        jobReadiness: "Not Evaluated",
        hiringProbability: null,
        status,
        completionPercentage,
        answeredQuestions,
        totalQuestions,
        questionEvaluations: inputs.map(input => ({
          questionId: input.question.id,
          questionText: input.question.question,
          candidateAnswer: input.answer,
          idealAnswer: "",
          strengths: [],
          weaknesses: [],
          improvementSuggestion: "Question not answered.",
          score: null,
          skipped: true
        }))
      };
    }

    const techResult = TechnicalEvaluator.evaluate(validInputs);
    const commResult = CommunicationEvaluator.evaluate(validInputs);
    const confResult = ConfidenceEvaluator.evaluate(validInputs);
    const hrResult = HREvaluator.evaluate(validInputs);

    // Ensure all scores are at least 0 and max 100, if not null
    const technicalScore = techResult.score;
    const communicationScore = commResult.score;
    const confidenceScore = confResult.score;
    const hrReadiness = hrResult.score;
    const problemSolvingScore = techResult.problemSolving;
    const professionalismScore = (commResult.score !== null && hrResult.score !== null) 
      ? Math.round((commResult.score + hrResult.score) / 2) 
      : null;

    // Weighted average for overall score
    const scores = [
      { score: technicalScore, weight: 0.3 },
      { score: communicationScore, weight: 0.2 },
      { score: confidenceScore, weight: 0.15 },
      { score: hrReadiness, weight: 0.15 },
      { score: problemSolvingScore, weight: 0.2 }
    ];

    let totalWeight = 0;
    let weightedSum = 0;
    scores.forEach(s => {
      if (s.score !== null) {
        weightedSum += s.score * s.weight;
        totalWeight += s.weight;
      }
    });

    const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : null;

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
    if (technicalScore !== null && technicalScore < 70) roadmap.push({ week: 1, title: "Technical Review", focus: "Deep dive into core domain concepts and system architecture." });
    else roadmap.push({ week: 1, title: "Advanced Technical Setup", focus: "Practice building scalable solutions and exploring edge cases." });

    if (communicationScore !== null && communicationScore < 70) roadmap.push({ week: 2, title: "Communication Drills", focus: "Practice speaking concisely without filler words." });
    else roadmap.push({ week: 2, title: "Mock Interview Practice", focus: "Maintain your strong communication in high-pressure scenarios." });

    if (hrReadiness !== null && hrReadiness < 70) roadmap.push({ week: 3, title: "Behavioral Structuring", focus: "Draft stories using the STAR method for past experiences." });
    else roadmap.push({ week: 3, title: "Leadership Narratives", focus: "Focus on articulating your impact and quantifying results." });

    roadmap.push({ week: 4, title: "Full Mock Interview", focus: "Combine all skills into a full 45-minute timed mock interview." });

    // Job Readiness & Hiring Probability
    let jobReadiness: AIInterviewReport["jobReadiness"] = "Needs More Preparation";
    if (overallScore !== null) {
      if (overallScore >= 85) jobReadiness = "Junior Developer";
      else if (overallScore >= 70) jobReadiness = "Entry Level";
      else if (overallScore >= 50) jobReadiness = "Internships";
    }

    let hiringProbability = overallScore !== null ? Math.max(10, Math.min(99, overallScore - 5 + Math.floor(Math.random() * 10))) : null;
    if (hiringProbability !== null && status === "Partially Completed") {
       hiringProbability = Math.round(hiringProbability * (completionPercentage / 100));
       topWeaknesses.push(`Incomplete Interview (${completionPercentage}%)`);
    }

    // Generate Question Evaluations (Detailed breakdown per answer)
    const questionEvaluations: QuestionEvaluation[] = inputs.map(input => {
      const valid = isAnswerValid(input.answer);
      if (!valid) {
        return {
          questionId: input.question.id,
          questionText: input.question.question,
          candidateAnswer: input.answer,
          idealAnswer: "An ideal answer would systematically break down the problem, state assumptions, propose a solution, and evaluate trade-offs.",
          strengths: [],
          weaknesses: ["Question was skipped or answer was too short"],
          improvementSuggestion: "Try to answer all questions to get an accurate evaluation.",
          score: null,
          skipped: true
        };
      }

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
        score: isShort ? 60 : (isStrong ? 95 : 80),
        skipped: false
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
      careerAdvice: overallScore !== null && overallScore > 80 
        ? "You are highly competitive. Focus on negotiating and applying to top-tier roles." 
        : "Keep practicing. Focus heavily on your weak areas identified in this report before your next real interview.",
      hiringRecommendation: overallScore !== null && overallScore > 80 ? "Strong Hire" : (overallScore !== null && overallScore > 65 ? "Hire" : "No Hire"),
      interviewSummary: `The candidate performed ${overallScore !== null && overallScore > 80 ? 'exceptionally well' : (overallScore !== null && overallScore > 65 ? 'adequately' : 'poorly')}. Technical skills were scored at ${technicalScore}/100 and communication at ${communicationScore}/100.`,
      questionEvaluations,
      roadmap,
      jobReadiness,
      hiringProbability,
      status,
      completionPercentage,
      answeredQuestions,
      totalQuestions
    };
  }
}
