import type { Candidate } from "@/app/industry/candidates/page";
import type { Opportunity, Skill } from "@/lib/types";

export interface OpportunityMatchResult {
  isDeterminable: boolean;
  score: number;
  category: "Excellent Match" | "Strong Match" | "Partial Match" | "Low Match" | "Not Determinable";
  breakdown: {
    matchedRequiredSkills: { id: string, name: string }[];
    missingRequiredSkills: { id: string, name: string }[];
    matchedPreferredSkills: { id: string, name: string }[];
    missingPreferredSkills: { id: string, name: string }[];
    eligibility: { label: string; passed: boolean; value: string; required: string }[];
    assessments: { label: string; passed: boolean; value: string; required: string }[];
    experienceNotes: string[];
  };
}

export function calculateOpportunityMatch(
  candidate: Candidate,
  opportunity: Opportunity,
  allSkills: { value: string; label: string }[] // value is id, label is name
): OpportunityMatchResult {
  
  let maxWeight = 0;
  let earnedWeight = 0;

  const breakdown: OpportunityMatchResult["breakdown"] = {
    matchedRequiredSkills: [],
    missingRequiredSkills: [],
    matchedPreferredSkills: [],
    missingPreferredSkills: [],
    eligibility: [],
    assessments: [],
    experienceNotes: [],
  };

  const candidateSkillIds = new Set(candidate.skills.map(s => s.id));
  const getSkillName = (id: string) => allSkills.find(s => s.value === id)?.label || "Unknown Skill";

  // 1. Required Skills (Max 40)
  const reqSkills = opportunity.required_skills || [];
  if (reqSkills.length > 0) {
    maxWeight += 40;
    let matchedCount = 0;
    
    reqSkills.forEach(skillId => {
      if (candidateSkillIds.has(skillId)) {
        matchedCount++;
        breakdown.matchedRequiredSkills.push({ id: skillId, name: getSkillName(skillId) });
      } else {
        breakdown.missingRequiredSkills.push({ id: skillId, name: getSkillName(skillId) });
      }
    });

    earnedWeight += (matchedCount / reqSkills.length) * 40;
  }

  // 2. Preferred Skills (Max 15)
  const prefSkills = opportunity.preferred_skills || [];
  if (prefSkills.length > 0) {
    maxWeight += 15;
    let matchedCount = 0;
    
    prefSkills.forEach(skillId => {
      if (candidateSkillIds.has(skillId)) {
        matchedCount++;
        breakdown.matchedPreferredSkills.push({ id: skillId, name: getSkillName(skillId) });
      } else {
        breakdown.missingPreferredSkills.push({ id: skillId, name: getSkillName(skillId) });
      }
    });

    earnedWeight += (matchedCount / prefSkills.length) * 15;
  }

  // Helper to check if a string requirement is actually specified
  const isValidReq = (val: any) => typeof val === "string" ? val.trim() !== "" && val.toLowerCase() !== "none" : !!val;

  // 3. Eligibility (Max 15)
  const elig = opportunity.eligibility_requirements as Record<string, any> || {};
  const hasEligibility = !!(elig.min_cgpa || isValidReq(elig.degree) || isValidReq(elig.branch) || isValidReq(elig.batch));
  
  if (hasEligibility) {
    maxWeight += 15;
    let checksTotal = 0;
    let checksPassed = 0;
    const topEdu = candidate.education[0] || {};

    if (elig.min_cgpa) {
      checksTotal++;
      const minCgpa = parseFloat(elig.min_cgpa);
      const cCgpa = topEdu.cgpa || 0;
      const passed = cCgpa >= minCgpa;
      if (passed) checksPassed++;
      breakdown.eligibility.push({ label: "Minimum CGPA", passed, value: cCgpa.toString(), required: minCgpa.toString() });
    }

    if (isValidReq(elig.degree)) {
      checksTotal++;
      const reqDegree = (elig.degree as string).toLowerCase();
      const cDegree = (topEdu.degree || "").toLowerCase();
      const passed = !!cDegree && cDegree.includes(reqDegree);
      if (passed) checksPassed++;
      breakdown.eligibility.push({ label: "Degree", passed, value: topEdu.degree || "N/A", required: elig.degree });
    }

    if (isValidReq(elig.branch)) {
      checksTotal++;
      const reqBranch = (elig.branch as string).toLowerCase();
      const cBranch = (topEdu.branch || "").toLowerCase();
      const passed = !!cBranch && cBranch.includes(reqBranch);
      if (passed) checksPassed++;
      breakdown.eligibility.push({ label: "Branch", passed, value: topEdu.branch || "N/A", required: elig.branch });
    }

    if (isValidReq(elig.batch)) {
      checksTotal++;
      const reqBatch = (elig.batch as string).toLowerCase();
      const cBatch = (topEdu.batch || "").toLowerCase();
      const passed = !!cBatch && cBatch === reqBatch;
      if (passed) checksPassed++;
      breakdown.eligibility.push({ label: "Batch", passed, value: topEdu.batch || "N/A", required: elig.batch });
    }

    if (checksTotal > 0) {
      earnedWeight += (checksPassed / checksTotal) * 15;
    } else {
      maxWeight -= 15; // Revert if all were empty after all
    }
  }

  // Note: Experience is just recorded for context, not scored numericly
  if (isValidReq(elig.experience)) {
    breakdown.experienceNotes.push(`Opportunity requires: ${elig.experience}. Candidate has ${candidate.experienceCount} logged experiences.`);
  }

  // 4. Screening & Assessments (Max 15)
  const screen = opportunity.smart_screening_requirements as Record<string, any> || {};
  const assess = opportunity.assessment_requirements as Record<string, any> || {};
  
  const isResumeRequired = screen.resume_required === true || screen.resume_required === "true";
  
  const hasScreening = !!(screen.min_technical_score || screen.min_communication_score || screen.min_placement_readiness || isResumeRequired || assess.aptitude || assess.technical || assess.mock_interview);

  if (hasScreening) {
    maxWeight += 15;
    let checksTotal = 0;
    let checksPassed = 0;

    if (screen.min_technical_score) {
      checksTotal++;
      const passed = candidate.technicalScore >= screen.min_technical_score;
      if (passed) checksPassed++;
      breakdown.assessments.push({ label: "Min Technical Score", passed, value: candidate.technicalScore.toString(), required: screen.min_technical_score.toString() });
    }

    if (screen.min_communication_score) {
      checksTotal++;
      const passed = candidate.communicationScore >= screen.min_communication_score;
      if (passed) checksPassed++;
      breakdown.assessments.push({ label: "Min Communication Score", passed, value: candidate.communicationScore.toString(), required: screen.min_communication_score.toString() });
    }

    if (screen.min_placement_readiness) {
      checksTotal++;
      const passed = candidate.overallScore >= screen.min_placement_readiness;
      if (passed) checksPassed++;
      breakdown.assessments.push({ label: "Min Placement Readiness", passed, value: candidate.overallScore.toString(), required: screen.min_placement_readiness.toString() });
    }

    if (isResumeRequired) {
      checksTotal++;
      const passed = !!candidate.resumeUrl;
      if (passed) checksPassed++;
      breakdown.assessments.push({ label: "Resume Required", passed, value: passed ? "Provided" : "Missing", required: "Yes" });
    }

    if (assess.aptitude) {
      checksTotal++;
      const passed = candidate.aptitudeScore > 0;
      if (passed) checksPassed++;
      breakdown.assessments.push({ label: "Aptitude Assessment", passed, value: passed ? "Completed" : "Pending", required: "Required" });
    }

    if (assess.mock_interview) {
      checksTotal++;
      const passed = candidate.rawInterviews.length > 0;
      if (passed) checksPassed++;
      breakdown.assessments.push({ label: "Mock Interview", passed, value: passed ? "Completed" : "Pending", required: "Required" });
    }

    earnedWeight += (checksPassed / checksTotal) * 15;
  }

  // 5. Candidate Readiness (Max 15)
  // Only apply if the opportunity actually has SOME requirements
  if (maxWeight > 0) {
    maxWeight += 15;
    earnedWeight += (candidate.overallScore / 100) * 15;
  }

  // Calculate Final Deterministic Score
  if (maxWeight === 0) {
    return {
      isDeterminable: false,
      score: 0,
      category: "Not Determinable",
      breakdown
    };
  }

  const score = Math.round((earnedWeight / maxWeight) * 100);
  
  let category: OpportunityMatchResult["category"] = "Low Match";
  if (score >= 85) category = "Excellent Match";
  else if (score >= 70) category = "Strong Match";
  else if (score >= 50) category = "Partial Match";

  return {
    isDeterminable: true,
    score,
    category,
    breakdown
  };
}
