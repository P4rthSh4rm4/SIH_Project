import { EvaluationInput } from "./types";

export class TechnicalEvaluator {
  private static readonly TECH_KEYWORDS = [
    "api", "database", "react", "node", "architecture", "scale", "performance", "optimization", 
    "sql", "nosql", "cloud", "aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "agile",
    "algorithm", "data structure", "time complexity", "space complexity", "o(1)", "o(n)",
    "system design", "microservices", "monolith", "rest", "graphql", "authentication", "authorization"
  ];

  public static evaluate(inputs: EvaluationInput[]) {
    let totalScore = 0;
    let problemSolvingScore = 0;
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    const techInputs = inputs.filter(i => i.question.type === "Technical" || i.question.type === "Aptitude");
    
    if (techInputs.length === 0) {
      return { score: 85, problemSolving: 85, strengths, weaknesses }; // default if not tested
    }

    techInputs.forEach(input => {
      const answer = input.answer.toLowerCase();
      let qScore = 0;
      let psScore = 0;

      // Length completeness
      if (answer.length > 200) { qScore += 40; psScore += 40; }
      else if (answer.length > 100) { qScore += 25; psScore += 25; }
      else if (answer.length > 30) { qScore += 10; psScore += 10; }

      // Keyword coverage
      const foundKeywords = this.TECH_KEYWORDS.filter(kw => answer.includes(kw));
      qScore += Math.min(foundKeywords.length * 10, 40);
      
      // Problem solving indicators
      const psIndicators = ["because", "therefore", "first", "then", "approach", "solution", "optimize", "trade-off"];
      const foundPs = psIndicators.filter(ind => answer.includes(ind));
      psScore += Math.min(foundPs.length * 15, 40);

      // Add difficulty multiplier
      if (input.question.difficulty === "Hard") {
        qScore = Math.min(100, qScore * 1.2);
        psScore = Math.min(100, psScore * 1.2);
      }

      totalScore += qScore;
      problemSolvingScore += psScore;
    });

    const finalTechScore = Math.round(totalScore / techInputs.length) || 0;
    const finalPsScore = Math.round(problemSolvingScore / techInputs.length) || 0;

    if (finalTechScore >= 80) strengths.push("Strong Technical Vocabulary", "In-depth Concept Understanding");
    else weaknesses.push("Technical Depth", "Missing Key Terminology");

    if (finalPsScore >= 80) strengths.push("Logical Problem Solving Approach", "Clear Reasoning");
    else weaknesses.push("Problem Solving Approach", "Explaining Trade-offs");

    return {
      score: Math.min(100, Math.max(0, finalTechScore)),
      problemSolving: Math.min(100, Math.max(0, finalPsScore)),
      strengths,
      weaknesses
    };
  }
}
