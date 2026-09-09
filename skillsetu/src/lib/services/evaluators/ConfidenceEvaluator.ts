import { EvaluationInput } from "./types";

export class ConfidenceEvaluator {
  private static readonly HESITATION_WORDS = ["maybe", "perhaps", "I guess", "I think", "probably", "might", "could be", "not sure"];
  private static readonly CONFIDENT_WORDS = ["certainly", "absolutely", "confident", "ensure", "guarantee", "led", "drove", "achieved"];

  public static evaluate(inputs: EvaluationInput[]) {
    let totalScore = 0;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    if (inputs.length === 0) {
      return { score: 85, strengths, weaknesses };
    }

    inputs.forEach(input => {
      const answer = input.answer;
      const answerLower = answer.toLowerCase();
      let qScore = 80; // Base score

      // Length analysis - Too short is bad, but too long without structure (rambling) is also bad
      if (answer.length < 50) {
        qScore -= 20; // Too short, lacks detail
      } else if (answer.length > 150) {
        qScore += 10; // Good length
      }

      // Hesitation deduction
      let hesitationCount = 0;
      this.HESITATION_WORDS.forEach(word => {
        if (answerLower.includes(word)) hesitationCount++;
      });
      qScore -= (hesitationCount * 5);

      // Confidence bonus
      let confidentCount = 0;
      this.CONFIDENT_WORDS.forEach(word => {
        if (answerLower.includes(word)) confidentCount++;
      });
      qScore += (confidentCount * 5);

      totalScore += Math.max(0, Math.min(100, qScore));
    });

    const finalScore = Math.round(totalScore / inputs.length);

    if (finalScore >= 85) {
      strengths.push("Speaks with conviction", "Action-oriented language");
    } else if (finalScore < 70) {
      weaknesses.push("Hesitation language", "Rambling or overly brief answers");
    }

    return {
      score: finalScore,
      strengths,
      weaknesses
    };
  }
}
