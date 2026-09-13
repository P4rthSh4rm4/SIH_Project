import { calculateTechnicalScore, calculateSoftSkillsScore, calculateAptitudeScore, calculateResumeScore, calculatePortfolioScore, calculateGitHubScore, calculateLinkedInScore, calculateExperienceScore } from "./src/lib/services/readiness/index";

const data = {
  skills: [],
  portfolioItems: [],
  education: [],
  experiences: [],
  certificates: [],
  completedInterviews: [],
  assessments: [],
  industryFeedback: [],
  profile: null
};

const READINESS_WEIGHTS = {
  technical:  0.25,
  softSkills: 0.15,
  aptitude:   0.15,
  resume:     0.10,
  portfolio:  0.10,
  github:     0.10,
  linkedin:   0.05,
  experience: 0.10,
};

// Hack: We need to bypass the TS compilation error for 'github' on 'never'
// by using any
const profileAny = data.profile as any;

const technicalMetric = calculateTechnicalScore(data.skills, data.completedInterviews);
const softSkillsMetric = calculateSoftSkillsScore(data.skills, data.completedInterviews);
const aptitudeMetric = calculateAptitudeScore(data.assessments);
const resumeMetric = calculateResumeScore(
  profileAny,
  data.skills.length,
  data.education.length,
  data.experiences.length,
  data.portfolioItems.length,
  data.certificates.length
);
const portfolioMetric = calculatePortfolioScore(data.portfolioItems);
const githubMetric = calculateGitHubScore(profileAny?.github, data.portfolioItems);
const linkedinMetric = calculateLinkedInScore(
  profileAny,
  data.skills.length,
  data.education.length,
  data.experiences.length
);
const experienceMetric = calculateExperienceScore(
  data.portfolioItems,
  data.certificates.length,
  data.certificates,
  0 
);

let weightedSum = 0;
let totalWeight = 0;

if (technicalMetric.attempted) { weightedSum += technicalMetric.score * READINESS_WEIGHTS.technical; totalWeight += READINESS_WEIGHTS.technical; }
if (softSkillsMetric.attempted) { weightedSum += softSkillsMetric.score * READINESS_WEIGHTS.softSkills; totalWeight += READINESS_WEIGHTS.softSkills; }
if (aptitudeMetric.attempted) { weightedSum += aptitudeMetric.score * READINESS_WEIGHTS.aptitude; totalWeight += READINESS_WEIGHTS.aptitude; }
if (resumeMetric.attempted) { weightedSum += resumeMetric.score * READINESS_WEIGHTS.resume; totalWeight += READINESS_WEIGHTS.resume; }
if (portfolioMetric.attempted) { weightedSum += portfolioMetric.score * READINESS_WEIGHTS.portfolio; totalWeight += READINESS_WEIGHTS.portfolio; }
if (githubMetric.attempted) { weightedSum += githubMetric.score * READINESS_WEIGHTS.github; totalWeight += READINESS_WEIGHTS.github; }
if (linkedinMetric.attempted) { weightedSum += linkedinMetric.score * READINESS_WEIGHTS.linkedin; totalWeight += READINESS_WEIGHTS.linkedin; }
if (experienceMetric.attempted) { weightedSum += experienceMetric.score * READINESS_WEIGHTS.experience; totalWeight += READINESS_WEIGHTS.experience; }

const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

console.log("overallScore:", overallScore);
console.log("technicalMetric:", technicalMetric.attempted, technicalMetric.score);
console.log("softSkillsMetric:", softSkillsMetric.attempted, softSkillsMetric.score);
console.log("aptitudeMetric:", aptitudeMetric.attempted, aptitudeMetric.score);
console.log("resumeMetric:", resumeMetric.attempted, resumeMetric.score);
console.log("portfolioMetric:", portfolioMetric.attempted, portfolioMetric.score);
console.log("githubMetric:", githubMetric.attempted, githubMetric.score);
console.log("linkedinMetric:", linkedinMetric.attempted, linkedinMetric.score);
console.log("experienceMetric:", experienceMetric.attempted, experienceMetric.score);
