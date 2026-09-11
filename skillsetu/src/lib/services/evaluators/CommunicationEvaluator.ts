import { EvaluationInput } from "./types";

export class CommunicationEvaluator {
  private static readonly FILLER_WORDS = ["um", "uh", "like", "you know", "basically", "actually", "literally", "sort of", "kind of"];
  private static readonly PROFESSIONAL_WORDS = [
    "furthermore", "moreover", "collaborated", "facilitated", "implemented", "achieved", 
    "demonstrated", "analyzed", "resolved", "spearheaded", "managed", "coordinated", "developed"
  ];

  public static evaluate(inputs: EvaluationInput[]) {
    let totalScore = 0;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    let totalFillerCount = 0;
    let totalProfessionalCount = 0;

    if (inputs.length === 0) {
      return { score: null, strengths, weaknesses };
    }

    inputs.forEach(input => {
      const answer = input.answer.toLowerCase();
      let qScore = 100;

      // Count filler words
      let fillerCount = 0;
      this.FILLER_WORDS.forEach(filler => {
        const regex = new RegExp(`\\b${filler}\\b`, "g");
        const matches = answer.match(regex);
        if (matches) {
          fillerCount += matches.length;
        }
      });
      totalFillerCount += fillerCount;
      qScore -= (fillerCount * 5); // penalty

      // Count professional vocabulary
      let profCount = 0;
      this.PROFESSIONAL_WORDS.forEach(word => {
        if (answer.includes(word)) profCount++;
      });
      totalProfessionalCount += profCount;
      qScore += (profCount * 5); // bonus

      // Sentence structure (basic heuristic: length of sentences)
      const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 0);
      if (sentences.length === 0 && answer.length > 0) {
        qScore -= 20; // run-on sentence or no punctuation
      }

      totalScore += Math.max(0, Math.min(100, qScore));
    });

    const finalScore = Math.round(totalScore / inputs.length);

    if (totalFillerCount > inputs.length * 2) {
      weaknesses.push("Frequent use of filler words");
    } else if (totalFillerCount === 0) {
      strengths.push("Clear, filler-free communication");
    }

    if (totalProfessionalCount >= inputs.length) {
      strengths.push("Strong professional vocabulary");
    } else if (finalScore < 70) {
      weaknesses.push("Sentence structure and grammar");
    }

    return {
      score: finalScore,
      strengths,
      weaknesses
    };
  }
}
