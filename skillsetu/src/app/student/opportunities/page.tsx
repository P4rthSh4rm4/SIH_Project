"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Briefcase, Search, MapPin, Building2, Clock, 
  DollarSign, GraduationCap, ArrowRight, Loader2,
  CheckCircle2, AlertCircle, Percent
} from "lucide-react";
import { useOpportunities } from "@/lib/hooks/useOpportunities";
import { toast } from "sonner";
import { awardXp } from "@/lib/supabase/queries";

export default function OpportunitiesPage() {
  const { opportunities, loading, applyToOpportunity } = useOpportunities();
  const [searchQuery, setSearchQuery] = useState("");
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const filteredOpportunities = opportunities.filter((opp) => 
    opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (opp.location && opp.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleApply = async (oppId: string, matchScore: number) => {
    setApplyingId(oppId);
    try {
      const { success, error } = await applyToOpportunity(oppId, matchScore);
      if (success) {
        toast.success("Application submitted successfully!");
        await awardXp("job_applied", { opportunity_id: oppId });
      } else {
        toast.error(error || "Failed to submit application");
      }
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Opportunities</h1>
          <p className="text-muted-foreground mt-1">Finding the best matches for your profile...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Opportunities</h1>
          <p className="text-muted-foreground mt-1">
            Discover internships and jobs matched to your verified skills.
          </p>
        </div>
        
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by role, company, or location..."
            className="pl-9 h-10 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredOpportunities.length === 0 ? (
          <Card className="border-border/50 border-dashed bg-secondary/20">
            <CardContent className="p-12 text-center text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No opportunities found</p>
              <p className="text-sm">Try adjusting your search query or check back later.</p>
            </CardContent>
          </Card>
        ) : (
          filteredOpportunities.map((opp) => {
            const isApplying = applyingId === opp.id;
            
            // Match score styling
            const matchColor = 
              opp.matchScore >= 80 ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" :
              opp.matchScore >= 50 ? "text-amber-500 bg-amber-500/10 border-amber-500/20" :
              "text-red-500 bg-red-500/10 border-red-500/20";
            
            const MatchIcon = opp.matchScore >= 80 ? CheckCircle2 : opp.matchScore >= 50 ? Percent : AlertCircle;

            return (
              <Card key={opp.id} className={`border-border/50 hover:shadow-md transition-all ${opp.hasApplied ? "opacity-75" : ""}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Main Info */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                            <Building2 className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg leading-tight">{opp.title}</h3>
                            <p className="text-muted-foreground text-sm">{opp.company_name}</p>
                          </div>
                        </div>
                        
                        <div className="flex sm:flex-col items-center sm:items-end gap-2">
                          <Badge variant="outline" className={`flex items-center gap-1 text-xs py-1 ${matchColor}`}>
                            <MatchIcon className="w-3 h-3" />
                            {opp.matchScore}% Match
                          </Badge>
                          <Badge variant="secondary" className="capitalize">
                            {opp.type}
                          </Badge>
                        </div>
                      </div>

                      {/* Details row */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground pt-2">
                        {opp.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" /> {opp.location}
                          </div>
                        )}
                        {opp.salary_range && (
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4" /> {opp.salary_range}
                          </div>
                        )}
                        {opp.experience_level && (
                          <div className="flex items-center gap-1.5 capitalize">
                            <GraduationCap className="w-4 h-4" /> {opp.experience_level}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" /> Posted {new Date(opp.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <p className="text-sm line-clamp-2 pt-2">
                        {opp.description}
                      </p>
                    </div>

                    {/* Action */}
                    <div className="flex flex-col justify-end min-w-[120px] pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-border/30 md:pl-4 mt-4 md:mt-0">
                      {opp.hasApplied ? (
                        <div className="flex flex-col items-center justify-center text-center p-3 bg-secondary/30 rounded-xl h-full border border-border/30">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-1" />
                          <span className="text-sm font-medium">Applied</span>
                        </div>
                      ) : (
                        <Button 
                          className="w-full h-full min-h-[60px]" 
                          disabled={isApplying}
                          onClick={() => handleApply(opp.id, opp.matchScore)}
                        >
                          {isApplying ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>Apply Now <ArrowRight className="w-4 h-4 ml-2" /></>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
