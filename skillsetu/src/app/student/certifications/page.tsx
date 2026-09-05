"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award, ShieldCheck, Share2, Download, CheckCircle2,
  Medal, Star, ExternalLink
} from "lucide-react";
import { useSkillAnalytics } from "@/lib/hooks/useSkillAnalytics";
import Link from "next/link";
import { toast } from "sonner";

export default function CertificationsPage() {
  const { skills, loading } = useSkillAnalytics();

  // verified skills serve as micro-credentials/certifications
  const verifiedSkills = skills.filter((s) => s.verified);
  const unverifiedSkills = skills.filter((s) => !s.verified);

  const handleShare = (skillName: string) => {
    navigator.clipboard.writeText(`I just earned a verified skill badge in ${skillName} on SkillSetu!`);
    toast.success("Share text copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certifications</h1>
          <p className="text-muted-foreground mt-1">Loading your verified credentials...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certifications & Badges</h1>
          <p className="text-muted-foreground mt-1">
            Your verified skills and micro-credentials earned through assessments and courses.
          </p>
        </div>
      </div>

      {verifiedSkills.length === 0 ? (
        <Card className="border-border/50 border-dashed bg-secondary/20">
          <CardContent className="p-12 text-center text-muted-foreground">
            <Award className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No verified skills yet</p>
            <p className="text-sm mb-4">Take skill assessments to earn verified badges.</p>
            <Button asChild>
              <Link href="/student/assessment">Go to Assessments</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {verifiedSkills.map((skill) => (
            <Card key={skill.id} className="border-border/50 overflow-hidden relative hover:shadow-lg transition-all group">
              {/* Certificate Header Banner */}
              <div className="h-24 bg-gradient-to-r from-emerald-600 to-emerald-400 p-4 relative overflow-hidden flex items-center justify-center">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
                
                <div className="w-14 h-14 bg-background rounded-full flex items-center justify-center shadow-lg relative z-10">
                  <ShieldCheck className="w-7 h-7 text-emerald-500" />
                </div>
              </div>

              <CardContent className="p-5 text-center pt-6">
                <Badge className="mb-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Credential
                </Badge>
                <h3 className="font-bold text-xl mb-1">{skill.name}</h3>
                <p className="text-xs text-muted-foreground capitalize mb-4">{skill.category} • Proficiency: {skill.score}%</p>
                
                <div className="flex justify-center mb-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(skill.score / 20) ? 'text-amber-400 fill-amber-400' : 'text-muted/30'}`} />
                    ))}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-0 border-t border-border/10 mt-auto bg-muted/10 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => handleShare(skill.name)}>
                  <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share
                </Button>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Certificate
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {unverifiedSkills.length > 0 && (
        <div className="mt-12 space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Medal className="w-5 h-5 text-muted-foreground" /> In Progress / Unverified Skills
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {unverifiedSkills.map((skill) => (
              <Card key={skill.id} className="border-border/50 bg-secondary/10">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">{skill.name}</h4>
                    <p className="text-xs text-muted-foreground">{skill.score}% Score</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-primary">
                    <Link href="/student/assessment">
                      Verify <ExternalLink className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
