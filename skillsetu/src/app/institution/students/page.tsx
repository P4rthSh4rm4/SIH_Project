"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Loader2, Users, Briefcase, GraduationCap, Award, Calendar } from "lucide-react";
import { useInstitutionStudents, type InstitutionStudent } from "@/lib/hooks/useInstitutionStudents";

export default function InstitutionStudentsPage() {
  const { loading, error, students } = useInstitutionStudents();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<InstitutionStudent | null>(null);

  // Client-side filtering
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <p className="text-muted-foreground mt-1">Manage and monitor students in your institution.</p>
      </div>

      <div className="flex items-center space-x-2 w-full max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search students..."
            className="pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Loading student records...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-red-500" />
              </div>
              <p className="font-medium text-red-500">Failed to load students</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-medium">No students found</p>
              <p className="text-sm text-muted-foreground mt-1">There are no students registered under your institution yet.</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No students match your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Student</th>
                    <th className="px-6 py-4 font-medium">Skills</th>
                    <th className="px-6 py-4 font-medium">Applications</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{student.name}</div>
                        <div className="text-xs text-muted-foreground">{student.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        {student.skillCount > 0 ? (
                          <Badge variant="secondary" className="font-normal">{student.skillCount} skills</Badge>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {student.applicationCount > 0 ? (
                          <span className="font-medium">{student.applicationCount}</span>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {student.placementStatus === 'Placed' ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none">Placed</Badge>
                        ) : student.placementStatus === 'In Process' ? (
                          <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-none">In Process</Badge>
                        ) : (
                          <Badge variant="secondary" className="font-normal">Not Placed</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedStudent(student)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6 pt-4">
              {/* Header Info */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500/20 to-emerald-500/20 flex items-center justify-center text-xl font-bold text-amber-600 dark:text-amber-400 shrink-0">
                  {selectedStudent.name.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{selectedStudent.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedStudent.email}</p>
                </div>
              </div>

              {selectedStudent.bio && (
                <div className="text-sm text-foreground/90 bg-muted/30 p-3 rounded-lg border border-border/50">
                  {selectedStudent.bio}
                </div>
              )}

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Skills</div>
                    <div className="font-semibold">{selectedStudent.skillCount}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background">
                  <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-violet-500" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Applications</div>
                    <div className="font-semibold">{selectedStudent.applicationCount}</div>
                  </div>
                </div>
              </div>

              {/* Placement Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Award className="w-4 h-4" /> Placement Status
                </h4>
                {selectedStudent.placementStatus === 'Placed' && selectedStudent.placementDetails ? (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {selectedStudent.placementDetails.company}
                      </span>
                      <Badge className="bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30 border-none shadow-none">
                        {selectedStudent.placementDetails.package}
                      </Badge>
                    </div>
                    <div className="text-sm">{selectedStudent.placementDetails.role}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                      <Calendar className="w-3 h-3" /> Placed on {new Date(selectedStudent.placementDetails.date).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-lg border border-border/50">
                    {selectedStudent.placementStatus === 'Not Placed' ? 'Currently seeking placement.' : 'No placement records found.'}
                  </div>
                )}
              </div>

              {/* Skills Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" /> Top Skills
                </h4>
                {selectedStudent.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.skills.slice(0, 8).map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="font-normal">{skill}</Badge>
                    ))}
                    {selectedStudent.skills.length > 8 && (
                      <Badge variant="outline" className="text-muted-foreground border-dashed border-border/50 font-normal">
                        +{selectedStudent.skills.length - 8} more
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-lg border border-border/50">
                    No skills recorded.
                  </div>
                )}
              </div>
              
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
