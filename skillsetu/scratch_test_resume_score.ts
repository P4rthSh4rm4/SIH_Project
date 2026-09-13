import { calculateResumeScore } from './src/lib/services/readiness/ResumeScoreService.ts';

const res = calculateResumeScore(null, 0, 0, 0, 0, 0);
console.log("Score with null profile:", res.score, "Attempted:", res.attempted);
