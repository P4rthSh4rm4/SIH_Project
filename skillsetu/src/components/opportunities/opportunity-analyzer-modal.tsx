"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Sparkles, Loader2, Target, Lightbulb } from "lucide-react";
import { useOpportunityAnalyzer } from "@/lib/hooks/useOpportunityAnalyzer";

interface OpportunityAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityId: string | null;
  opportunityTitle: string;
}

export function OpportunityAnalyzerModal({
  isOpen,
  onClose,
  opportunityId,
  opportunityTitle,
}: OpportunityAnalyzerModalProps) {
  const { analyze, result, loading, reset } = useOpportunityAnalyzer();

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    } else if (isOpen && opportunityId && !result && !loading) {
      // Auto-start analysis when opened
      analyze(opportunityId).then((success) => {
        if (!success) {
          onClose(); // Close if it failed (e.g. no resume)
        }
      });
    }
  }, [isOpen, opportunityId, analyze, result, loading, reset, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-card p-0 overflow-hidden border-border/50">
        <div className="h-2 bg-gradient-to-r from-primary via-chart-4 to-chart-2" />
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              AI Resume Analysis
            </DialogTitle>
            <DialogDescription className="text-base">
              Comparing your resume against <strong className="text-foreground">{opportunityTitle}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 min-h-[300px] flex flex-col relative">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in bg-card/50 backdrop-blur-sm z-10 rounded-xl">
                <div className="relative w-20 h-20 flex items-center justify-center mb-6">
                  <div className="absolute inset-0 border-4 border-muted rounded-full" />
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <Sparkles className="w-8 h-8 text-chart-4 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold font-heading">Scanning Resume...</h3>
                <p className="text-muted-foreground text-sm mt-2 max-w-[280px] text-center">
                  Our AI is comparing your skills and experience against the job requirements.
                </p>
              </div>
            ) : result ? (
              <div className="space-y-8 animate-fade-in pb-4">
                {/* Score Ring */}
                <div className="flex flex-col items-center justify-center bg-muted/30 p-6 rounded-2xl border border-border/40">
                  <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        className="stroke-muted/40"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        className={
                          result.matchScore >= 80
                            ? "stroke-emerald-500"
                            : result.matchScore >= 50
                              ? "stroke-amber-500"
                              : "stroke-rose-500"
                        }
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 56}
                        strokeDashoffset={
                          2 * Math.PI * 56 - (result.matchScore / 100) * (2 * Math.PI * 56)
                        }
                        style={{ transition: "stroke-dashoffset 1s ease-out" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-extrabold">{result.matchScore}%</span>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Match</span>
                    </div>
                  </div>
                  <p className="text-center text-sm font-medium text-muted-foreground max-w-sm">
                    {result.matchScore >= 80
                      ? "Excellent fit! Your resume aligns very well with the requirements."
                      : result.matchScore >= 50
                        ? "Good potential, but there are some skill gaps you could address."
                        : "Low match. Consider upskilling in the missing areas before applying."}
                  </p>
                </div>

                {/* Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Matching Skills */}
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 font-bold text-[0.95rem]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Matching Skills
                    </h4>
                    {result.matchingSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.matchingSkills.map((s) => (
                          <span key={s} className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2.5 py-1 rounded-md text-xs font-bold">
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No direct matches found.</p>
                    )}
                  </div>

                  {/* Missing Skills */}
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 font-bold text-[0.95rem]">
                      <XCircle className="w-4 h-4 text-rose-500" />
                      Missing Skills
                    </h4>
                    {result.missingSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.missingSkills.map((s) => (
                          <span key={s} className="bg-rose-500/10 text-rose-600 border border-rose-500/20 px-2.5 py-1 rounded-md text-xs font-bold">
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">You meet all listed requirements!</p>
                    )}
                  </div>
                </div>

                {/* Recommendation */}
                <div className="bg-chart-4/10 border border-chart-4/20 p-5 rounded-xl flex gap-4">
                  <div className="shrink-0 mt-0.5">
                    <Lightbulb className="w-5 h-5 text-chart-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1 text-chart-4">AI Recommendation</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground font-medium">
                      {result.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-2 flex justify-end gap-3 pt-4 border-t border-border/40">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {result && result.matchScore >= 50 && (
              <Button className="bg-gradient-to-r from-primary to-chart-4 text-white hover:opacity-90 shadow-lg shadow-primary/20">
                Apply Now <Target className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
