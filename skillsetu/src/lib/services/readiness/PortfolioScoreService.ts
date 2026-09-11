import type { ReadinessMetric, ScoreBreakdownItem } from "./types";
import type { PortfolioItem } from "@/lib/types";

/**
 * Portfolio Quality Readiness Service
 *
 * Data source: portfolio_items (type = "project")
 * Evaluates: count, descriptions, links, images, GitHub repos, completeness
 */
export function calculatePortfolioScore(
  portfolioItems: PortfolioItem[]
): ReadinessMetric {
  const projects = portfolioItems.filter(p => p.type === "project");
  const breakdown: ScoreBreakdownItem[] = [];
  const missingItems: string[] = [];
  const recommendations: string[] = [];

  if (projects.length === 0) {
    return {
      score: 0,
      maxScore: 100,
      attempted: false,
      breakdown: [{ label: "Projects", value: 0, maxValue: 100, status: "missing" }],
      missingItems: ["No portfolio projects"],
      recommendations: ["Build and add at least 3 projects to your portfolio."],
    };
  }

  // ── Project Count (25 pts) ──
  const countPts = Math.min(projects.length * 5, 25);
  breakdown.push({
    label: `Project Count (${projects.length})`,
    value: countPts,
    maxValue: 25,
    status: projects.length >= 5 ? "present" : projects.length >= 3 ? "partial" : "present",
  });
  if (projects.length < 3) {
    missingItems.push(`Only ${projects.length} project(s) — recommend at least 3`);
    recommendations.push("Add more projects to demonstrate breadth of experience.");
  }

  // ── Descriptions (25 pts) ──
  const withDesc = projects.filter(p => p.description && p.description.length > 30);
  const descRatio = withDesc.length / projects.length;
  const descPts = Math.round(descRatio * 25);
  breakdown.push({
    label: `Descriptions (${withDesc.length}/${projects.length})`,
    value: descPts,
    maxValue: 25,
    status: descRatio >= 1 ? "present" : descRatio > 0 ? "partial" : "missing",
  });
  if (withDesc.length < projects.length) {
    missingItems.push(`${projects.length - withDesc.length} project(s) missing detailed descriptions`);
    recommendations.push("Add detailed descriptions (30+ characters) to all projects.");
  }

  // ── Links (20 pts) ──
  const withLink = projects.filter(p => p.url);
  const linkRatio = withLink.length / projects.length;
  const linkPts = Math.round(linkRatio * 20);
  breakdown.push({
    label: `Live/Repo Links (${withLink.length}/${projects.length})`,
    value: linkPts,
    maxValue: 20,
    status: linkRatio >= 1 ? "present" : linkRatio > 0 ? "partial" : "missing",
  });
  if (withLink.length < projects.length) {
    missingItems.push(`${projects.length - withLink.length} project(s) missing links`);
    recommendations.push("Add live demo or GitHub repository links to your projects.");
  }

  // ── Images (15 pts) ──
  const withImage = projects.filter(p => p.image_url);
  const imgRatio = withImage.length / projects.length;
  const imgPts = Math.round(imgRatio * 15);
  breakdown.push({
    label: `Screenshots (${withImage.length}/${projects.length})`,
    value: imgPts,
    maxValue: 15,
    status: imgRatio >= 1 ? "present" : imgRatio > 0 ? "partial" : "missing",
  });
  if (withImage.length < projects.length) {
    missingItems.push(`${projects.length - withImage.length} project(s) missing screenshots`);
    recommendations.push("Add screenshots or demo images to your projects.");
  }

  // ── Completeness bonus (15 pts) — projects with ALL fields ──
  const completeProjects = projects.filter(
    p => p.description && p.description.length > 30 && p.url && p.image_url
  );
  const compRatio = completeProjects.length / projects.length;
  const compPts = Math.round(compRatio * 15);
  breakdown.push({
    label: `Fully Complete (${completeProjects.length}/${projects.length})`,
    value: compPts,
    maxValue: 15,
    status: compRatio >= 1 ? "present" : compRatio > 0 ? "partial" : "missing",
  });

  const totalScore = countPts + descPts + linkPts + imgPts + compPts;

  return {
    score: Math.min(totalScore, 100),
    maxScore: 100,
    attempted: true,
    breakdown,
    missingItems,
    recommendations,
  };
}
