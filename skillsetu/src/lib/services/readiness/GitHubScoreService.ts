import type { ReadinessMetric, ScoreBreakdownItem } from "./types";
import type { PortfolioItem } from "@/lib/types";

/**
 * GitHub Readiness Service
 *
 * Data sources:
 *  - student_profiles.github → GitHub URL
 *  - portfolio_items → projects with GitHub repo links
 *
 * Returns 0 if GitHub URL is not connected.
 * Does NOT assume repo counts or activity (no GitHub API).
 */
export function calculateGitHubScore(
  githubUrl: string | undefined | null,
  portfolioItems: PortfolioItem[]
): ReadinessMetric {
  const breakdown: ScoreBreakdownItem[] = [];
  const missingItems: string[] = [];
  const recommendations: string[] = [];

  // ── Gate: GitHub URL ──
  const hasGitHub = !!githubUrl;
  breakdown.push({
    label: "GitHub URL",
    value: hasGitHub ? 30 : 0,
    maxValue: 30,
    status: hasGitHub ? "present" : "missing",
  });

  if (!hasGitHub) {
    return {
      score: 0,
      maxScore: 100,
      attempted: false,
      breakdown,
      missingItems: ["GitHub profile not linked"],
      recommendations: ["Add your GitHub profile URL in Profile settings."],
    };
  }

  // ── Projects with GitHub repo links (40 pts) ──
  const projects = portfolioItems.filter(p => p.type === "project");
  const githubLinked = projects.filter(p =>
    p.url && (p.url.includes("github.com") || p.url.includes("gitlab.com") || p.url.includes("bitbucket.org"))
  );

  const linkPts = Math.min(githubLinked.length * 10, 40);
  breakdown.push({
    label: `GitHub-linked Projects (${githubLinked.length})`,
    value: linkPts,
    maxValue: 40,
    status: githubLinked.length >= 4 ? "present" : githubLinked.length > 0 ? "partial" : "missing",
  });

  if (githubLinked.length === 0) {
    missingItems.push("No projects linked to a GitHub repository");
    recommendations.push("Link your portfolio projects to GitHub repositories.");
  } else if (githubLinked.length < 3) {
    missingItems.push(`Only ${githubLinked.length} project(s) linked to GitHub`);
    recommendations.push("Link more projects to GitHub to showcase your work.");
  }

  // ── Quality: GitHub-linked projects with descriptions (30 pts) ──
  const withDesc = githubLinked.filter(p => p.description && p.description.length > 30);
  const descPts = Math.min(withDesc.length * 10, 30);
  breakdown.push({
    label: `Projects with README-quality Descriptions (${withDesc.length})`,
    value: descPts,
    maxValue: 30,
    status: withDesc.length >= 3 ? "present" : withDesc.length > 0 ? "partial" : "missing",
  });

  if (withDesc.length < githubLinked.length) {
    missingItems.push(`${githubLinked.length - withDesc.length} GitHub project(s) missing detailed descriptions`);
    recommendations.push("Add detailed README-style descriptions to your GitHub-linked projects.");
  }

  const totalScore = 30 + linkPts + descPts;

  return {
    score: Math.min(totalScore, 100),
    maxScore: 100,
    attempted: true,
    breakdown,
    missingItems,
    recommendations,
  };
}
