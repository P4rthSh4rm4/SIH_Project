"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Search, GraduationCap, Briefcase, Mail, MapPin, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { UserProfile } from "@/lib/types";
import { toast } from "sonner";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [invited, setInvited] = useState<string[]>([]);

  useEffect(() => {
    async function fetchCandidates() {
      try {
        const supabase = createClient();
        // For demonstration, we just pull users with role student
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("role", "student");

        if (error) throw error;
        setCandidates(data || []);
      } catch (err) {
        console.error("Failed to fetch candidates", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCandidates();
  }, []);

  const handleInvite = (id: string, name: string) => {
    setInvited(prev => [...prev, id]);
    toast.success(`Invitation sent to ${name}!`);
  };

  const filteredCandidates = candidates.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

  // Mock skills to assign to candidates visually
  const mockSkills = ["React", "TypeScript", "Node.js", "Python", "Figma", "AWS"];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-500" />
            Talent Pool
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Browse verified student profiles, review their skill sets, and invite top candidates to apply for your opportunities.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name..." 
            className="pl-9 bg-secondary/50 border-border/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-xl border border-border/50" />)}
        </div>
      ) : filteredCandidates.length === 0 ? (
        <Card className="border-border/50 border-dashed bg-secondary/10">
          <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground">No candidates found</p>
            <p className="text-sm">Try adjusting your search filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate, index) => {
             // Assign a random subset of skills based on their index for demo purposes
             const cSkills = mockSkills.slice((index % 3), (index % 3) + 3);
             const isInvited = invited.includes(candidate.id);

             return (
              <Card key={candidate.id} className="border-border/50 flex flex-col hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg shrink-0">
                        {candidate.name?.charAt(0) || "S"}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{candidate.name}</CardTitle>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <GraduationCap className="w-3 h-3" /> B.Tech Computer Science
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      95% Match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-4 flex-1">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Verified Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cSkills.map(skill => (
                          <Badge key={skill} variant="secondary" className="bg-secondary/50 font-medium">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Willing to relocate</span>
                      <span className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> Seeking Internship</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 border-t border-border/50 mt-4 bg-muted/10 p-4">
                  {isInvited ? (
                    <Button variant="outline" className="w-full bg-blue-50 text-blue-700 border-blue-200 cursor-default hover:bg-blue-50" disabled>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Invited to Apply
                    </Button>
                  ) : (
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20" onClick={() => handleInvite(candidate.id, candidate.name)}>
                      <Mail className="w-4 h-4 mr-2" /> Invite to Apply
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
