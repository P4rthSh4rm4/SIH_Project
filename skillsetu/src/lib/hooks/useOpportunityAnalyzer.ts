"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface AnalysisResult {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendation: string;
}

export function useOpportunityAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyze = useCallback(async (opportunityId: string) => {
    try {
      setLoading(true);
      setResult(null);

      const response = await fetch("/api/gemini/analyze-opportunity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ opportunityId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "NO_RESUME") {
          toast.error("Resume Required", {
            description: data.message,
          });
        } else {
          toast.error("Analysis Failed", {
            description: data.error || "An unknown error occurred.",
          });
        }
        return false;
      }

      setResult(data as AnalysisResult);
      return true;
    } catch (err) {
      console.error("[useOpportunityAnalyzer]", err);
      toast.error("Analysis Error", {
        description: "Failed to communicate with the AI service.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
  }, []);

  return {
    analyze,
    result,
    loading,
    reset,
  };
}
