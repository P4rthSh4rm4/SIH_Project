"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, TrendingUp, Eye, PlusCircle, ArrowRight, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import type { UserProfile, StudentProfile } from "@/lib/types";

const MOCK_OPPORTUNITIES = [
  {
    id: "mock-opp-1",
    title: "Software Engineer Intern (Frontend)",
    type: "internship",
    location: "Remote",
    stipend: "₹20,000/month",
    status: "active",
    applicationsCount: 12,
  },
  {
    id: "mock-opp-2",
    title: "Data Analyst Trainee",
    type: "job",
    location: "Bangalore",
    stipend: "₹6 LPA",
    status: "pending",
    applicationsCount: 0,
  }
];

export default function IndustryDashboard() {
  const [students, setStudents] = useState<(UserProfile & { profile: StudentProfile | null })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const supabase = createClient();
        
        // Fetch users who are students
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("*")
          .eq("role", "student")
          .limit(10);
          
        if (usersError) throw usersError;
        
        // Fetch their profiles
        const { data: profilesData } = await supabase
          .from("student_profiles")
          .select("*")
          .in("user_id", (usersData || []).map(u => u.id));
          
        const combined = (usersData || []).map(user => {
          const profile = profilesData?.find(p => p.user_id === user.id) || null;
          return { ...user, profile };
        });
        
        setStudents(combined);
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  const stats = [
    { label: "Active Listings", value: MOCK_OPPORTUNITIES.length.toString(), icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Applicants", value: "12", icon: Users, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Available Students", value: students.length.toString(), icon: Eye, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Industry <span className="gradient-text">Dashboard</span></h1>
          <p className="text-muted-foreground mt-1">Manage opportunities and find top talent</p>
        </div>
        <Link href="/industry/post">
          <Button className="bg-gradient-to-r from-primary to-chart-4 text-white hover:opacity-90 shadow-lg shadow-primary/20">
            <PlusCircle className="w-4 h-4 mr-2" /> Post Opportunity
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/50 hover:shadow-lg transition-all">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{loading ? "-" : s.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Posted Opportunities */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" /> Your Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_OPPORTUNITIES.map((opp) => (
                <div key={opp.id} className="p-4 rounded-xl border border-border/50 bg-secondary/10 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm line-clamp-1">{opp.title}</h3>
                    <Badge variant={opp.status === "active" ? "default" : "secondary"} className="text-[10px] capitalize">
                      {opp.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="capitalize">{opp.type}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {opp.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
                      {opp.applicationsCount} Applicants
                    </span>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Available Student Profiles */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" /> Available Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No students found on the platform yet.
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center gap-4 p-3 rounded-xl border border-border/30 hover:border-border transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-chart-4/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{student.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {student.profile?.career_objective || "Student"}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8">
                      View Profile
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {!loading && students.length > 0 && (
              <Button variant="outline" size="sm" className="w-full mt-4">
                View All Candidates <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
