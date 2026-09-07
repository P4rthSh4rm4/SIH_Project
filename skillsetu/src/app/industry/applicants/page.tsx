"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutGrid, MoreHorizontal, MessageSquare, Calendar, CheckCircle2, ChevronRight, XCircle } from "lucide-react";

type ApplicantStatus = "applied" | "shortlisted" | "interview" | "offer";

const MOCK_APPLICANTS = [
  { id: "1", name: "Parth Sharma", role: "Frontend Developer Intern", status: "applied", match: 92, date: "2d ago" },
  { id: "2", name: "Ananya Patel", role: "AI Research Assistant", status: "applied", match: 88, date: "3d ago" },
  { id: "3", name: "Rohan Kumar", role: "Frontend Developer Intern", status: "shortlisted", match: 95, date: "5d ago" },
  { id: "4", name: "Priya Singh", role: "Cloud Ops Intern", status: "interview", match: 89, date: "1w ago" },
  { id: "5", name: "Dev Verma", role: "AI Research Assistant", status: "offer", match: 98, date: "2w ago" },
];

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState(MOCK_APPLICANTS);
  const [filterRole, setFilterRole] = useState("all");

  const roles = Array.from(new Set(MOCK_APPLICANTS.map(a => a.role)));

  const moveApplicant = (id: string, newStatus: ApplicantStatus) => {
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const filteredApplicants = filterRole === "all" ? applicants : applicants.filter(a => a.role === filterRole);

  const columns: { id: ApplicantStatus; label: string; color: string }[] = [
    { id: "applied", label: "Applied", color: "bg-slate-100 border-slate-200 text-slate-700" },
    { id: "shortlisted", label: "Shortlisted", color: "bg-blue-100 border-blue-200 text-blue-700" },
    { id: "interview", label: "Interview", color: "bg-purple-100 border-purple-200 text-purple-700" },
    { id: "offer", label: "Offer", color: "bg-emerald-100 border-emerald-200 text-emerald-700" },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-10 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutGrid className="w-8 h-8 text-blue-500" />
            Applicant Tracking
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Manage your hiring pipeline. Move candidates through the stages of your recruitment process.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterRole} onValueChange={(val) => setFilterRole(val || "all")}>
            <SelectTrigger className="w-[250px] bg-secondary/50">
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map(role => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 min-h-[600px]">
        {columns.map(col => {
          const colApplicants = filteredApplicants.filter(a => a.status === col.id);
          
          return (
            <div key={col.id} className="w-[320px] shrink-0 flex flex-col bg-muted/30 rounded-xl border border-border/50">
              <div className="p-4 border-b border-border/50 flex justify-between items-center">
                <Badge variant="outline" className={`${col.color} font-semibold uppercase tracking-wider`}>
                  {col.label}
                </Badge>
                <span className="text-sm font-medium text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border/50">
                  {colApplicants.length}
                </span>
              </div>
              
              <div className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar">
                {colApplicants.map(app => (
                  <Card key={app.id} className="border-border/50 shadow-sm cursor-pointer hover:shadow-md transition-shadow group">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{app.name}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{app.role}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 py-2 flex items-center justify-between text-xs">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        {app.match}% Match
                      </Badge>
                      <span className="text-muted-foreground">{app.date}</span>
                    </CardContent>
                    <CardFooter className="p-3 pt-2 bg-muted/10 border-t border-border/10 flex justify-between gap-1">
                       <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:bg-blue-50" title="Message">
                         <MessageSquare className="w-3.5 h-3.5" />
                       </Button>
                       <Button variant="ghost" size="icon" className="h-7 w-7 text-purple-600 hover:bg-purple-50" title="Schedule">
                         <Calendar className="w-3.5 h-3.5" />
                       </Button>
                       <div className="flex-1" />
                       {col.id === "applied" && (
                         <Button variant="outline" size="sm" className="h-7 text-xs bg-white hover:bg-blue-50 text-blue-600 border-blue-200" onClick={() => moveApplicant(app.id, "shortlisted")}>
                           Shortlist <ChevronRight className="w-3 h-3 ml-1" />
                         </Button>
                       )}
                       {col.id === "shortlisted" && (
                         <Button variant="outline" size="sm" className="h-7 text-xs bg-white hover:bg-purple-50 text-purple-600 border-purple-200" onClick={() => moveApplicant(app.id, "interview")}>
                           Interview <ChevronRight className="w-3 h-3 ml-1" />
                         </Button>
                       )}
                       {col.id === "interview" && (
                         <Button variant="outline" size="sm" className="h-7 text-xs bg-white hover:bg-emerald-50 text-emerald-600 border-emerald-200" onClick={() => moveApplicant(app.id, "offer")}>
                           Offer <CheckCircle2 className="w-3 h-3 ml-1" />
                         </Button>
                       )}
                       {col.id === "offer" && (
                         <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 px-3">
                           Hired 🎉
                         </Badge>
                       )}
                    </CardFooter>
                  </Card>
                ))}
                
                {colApplicants.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center text-xs text-muted-foreground">
                    Drop candidates here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
