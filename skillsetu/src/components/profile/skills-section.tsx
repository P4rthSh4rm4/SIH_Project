"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Target,
  Plus,
  X,
  Search,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import type { Skill } from "@/lib/types";
import type { ProfileSkillEntry } from "@/lib/hooks/useProfileSkills";
import { toast } from "sonner";

interface SkillsSectionProps {
  skills: ProfileSkillEntry[];
  loading: boolean;
  onAdd: (
    skillId: string,
    proficiency: number
  ) => Promise<{ success: boolean; error?: string }>;
  onRemove: (
    skillId: string
  ) => Promise<{ success: boolean; error?: string }>;
  onSearch: (query: string) => Promise<Skill[]>;
}

export function SkillsSection({
  skills,
  loading,
  onAdd,
  onRemove,
  onSearch,
}: SkillsSectionProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Skill[]>([]);
  const [searching, setSearching] = useState(false);
  const [proficiency, setProficiency] = useState("50");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [adding, setAdding] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      const results = await onSearch(searchQuery);
      // Filter out skills the user already has
      const existingIds = new Set(skills.map((s) => s.skill_id));
      setSearchResults(results.filter((r) => !existingIds.has(r.id)));
      setSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch, skills]);

  const handleAdd = async () => {
    if (!selectedSkill) return;
    setAdding(true);

    const result = await onAdd(selectedSkill.id, parseInt(proficiency));

    setAdding(false);
    if (result.success) {
      toast.success(`${selectedSkill.name} added`);
      setSelectedSkill(null);
      setSearchQuery("");
      setProficiency("50");
      setOpen(false);
    } else {
      toast.error(result.error ?? "Failed to add skill");
    }
  };

  const handleRemove = async (skillId: string, skillName: string) => {
    const result = await onRemove(skillId);
    if (result.success) {
      toast.success(`${skillName} removed`);
    } else {
      toast.error(result.error ?? "Failed to remove skill");
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Skills
          </CardTitle>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setSelectedSkill(null); setSearchQuery(""); } }}>
            <DialogTrigger
              render={
                <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Skill
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Skill</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {/* Search */}
                <div className="space-y-2">
                  <Label>Search Skills</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSelectedSkill(null);
                      }}
                      className="pl-9"
                      placeholder="Search for a skill..."
                    />
                  </div>
                </div>

                {/* Search results */}
                {searching && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                )}

                {!searching && searchResults.length > 0 && (
                  <div className="max-h-40 overflow-y-auto space-y-1 border rounded-lg p-2">
                    {searchResults.map((skill) => (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => {
                          setSelectedSkill(skill);
                          setSearchQuery(skill.name);
                          setSearchResults([]);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent/50 transition-colors flex items-center justify-between ${
                          selectedSkill?.id === skill.id
                            ? "bg-primary/10"
                            : ""
                        }`}
                      >
                        <span>{skill.name}</span>
                        {skill.category && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] ml-2"
                          >
                            {skill.category}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {!searching &&
                  searchQuery.trim().length > 0 &&
                  searchResults.length === 0 &&
                  !selectedSkill && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      No skills found for &ldquo;{searchQuery}&rdquo;
                    </p>
                  )}

                {selectedSkill && (
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm font-medium">{selectedSkill.name}</p>
                    {selectedSkill.category && (
                      <p className="text-xs text-muted-foreground">
                        {selectedSkill.category}
                      </p>
                    )}
                  </div>
                )}

                {/* Proficiency */}
                <div className="space-y-2">
                  <Label>
                    Proficiency: {proficiency}%
                  </Label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={proficiency}
                    onChange={(e) => setProficiency(e.target.value)}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose
                  render={
                    <Button variant="outline">Cancel</Button>
                  }
                />
                <Button
                  onClick={handleAdd}
                  disabled={!selectedSkill || adding}
                >
                  {adding ? "Adding…" : "Add Skill"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-muted animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No skills mapped yet
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Add skills to improve your match score
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {skills.map((entry) => (
              <div
                key={entry.skill_id}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-accent/30 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {entry.skill.name}
                    </span>
                    {entry.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {entry.skill.category && (
                      <Badge
                        variant="secondary"
                        className="text-[10px]"
                      >
                        {entry.skill.category}
                      </Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className="text-[10px] capitalize"
                    >
                      {entry.source.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                {/* Proficiency bar */}
                <div className="w-24 shrink-0">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-0.5">
                    <span>Proficiency</span>
                    <span>{entry.proficiency_score}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-chart-4 rounded-full transition-all duration-500"
                      style={{ width: `${entry.proficiency_score}%` }}
                    />
                  </div>
                </div>

                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                  onClick={() =>
                    handleRemove(entry.skill_id, entry.skill.name)
                  }
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
