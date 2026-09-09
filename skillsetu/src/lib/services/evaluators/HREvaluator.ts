import { EvaluationInput } from "./types";

export class HREvaluator {
  private static readonly LEADERSHIP_WORDS = ["led", "managed", "directed", "initiated", "guided", "spearheaded"];
  private static readonly TEAMWORK_WORDS = ["team", "collaborated", "together", "we", "partnered", "assisted", "supported"];
  
  // Basic regex to find numbers/percentages/dollars as a proxy for "quantified achievements"
  private static readonly QUANTIFIED_REGEX = /\b(\d+%|\$\d+|\d+)\b/g;

  public static evaluate(inputs: EvaluationInput[]) {
    let totalScore = 0;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    const hrInputs = inputs.filter(i => i.question.type === "HR" || i.question.type === "Behavioral" || i.question.type === "Mixed");

    if (hrInputs.length === 0) {
      return { score: 85, strengths, weaknesses };
    }

    let starUsageCount = 0;
    let quantifiedCount = 0;

    hrInputs.forEach(input => {
      const answer = input.answer;
      const answerLower = answer.toLowerCase();
      let qScore = 70; // Base score

      // Check STAR structure (Situation, Task, Action, Result)
      // We look for structural transitions or past-tense narrative
      const hasSituation = /(when i|during my time|at my previous|situation was)/.test(answerLower);
      const hasAction = /(i decided to|i implemented|i built|i led|my role was)/.test(answerLower);
      const hasResult = /(resulted in|as a result|we achieved|led to|improved by)/.test(answerLower);
      
      if (hasSituation && hasAction && hasResult) {
        qScore += 20;
        starUsageCount++;
      } else if (hasAction && hasResult) {
        qScore += 10;
      }

      // Leadership & Teamwork
      let softSkillsCount = 0;
      this.LEADERSHIP_WORDS.forEach(w => { if (answerLower.includes(w)) softSkillsCount++; });
      this.TEAMWORK_WORDS.forEach(w => { if (answerLower.includes(w)) softSkillsCount++; });
      qScore += Math.min(softSkillsCount * 5, 10);

      // Quantified achievements
      const numbers = answer.match(this.QUANTIFIED_REGEX);
      if (numbers && numbers.length > 0) {
        qScore += 10;
        quantifiedCount++;
      }

      totalScore += Math.max(0, Math.min(100, qScore));
    });

    const finalScore = Math.round(totalScore / hrInputs.length);

    if (starUsageCount > 0) strengths.push("Uses STAR method effectively");
    else weaknesses.push("Answers lack structured framework (STAR)");

    if (quantifiedCount > 0) strengths.push("Quantifies achievements with data");
    else weaknesses.push("Fails to use data/metrics to prove results");

    return {
      score: finalScore,
      strengths,
      weaknesses
    };
  }
}
