"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Loader2, 
  Users, 
  Briefcase, 
  Activity, 
  XCircle,
  FileCheck,
  Building,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { useInstitutionStudents } from "@/lib/hooks/useInstitutionStudents";
import { useInstitutionVerification } from "@/lib/hooks/useInstitutionVerification";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

const COLORS = {
  placed: '#10b981', // emerald-500
  inProcess: '#f59e0b', // amber-500
  notPlaced: '#ef4444' // red-500
};

export default function InstitutionReportsPage() {
  const { students, loading: studentsLoading, error: studentsError } = useInstitutionStudents();
  const { certifications, loading: certsLoading, error: certsError } = useInstitutionVerification();
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const loading = studentsLoading || certsLoading;
  const error = studentsError || certsError;

  // KPIs
  const totalStudents = students.length;
  const placedStudents = students.filter(s => s.placementStatus === 'Placed');
  const inProcessStudents = students.filter(s => s.placementStatus === 'In Process');
  const notPlacedStudents = students.filter(s => s.placementStatus === 'Not Placed');
  
  const placementRate = totalStudents > 0 
    ? ((placedStudents.length / totalStudents) * 100).toFixed(1) 
    : '0.0';

  // Average Package Parsing (reusing Analytics logic)
  let parsedPackages: number[] = [];
  placedStudents.forEach(s => {
    const pkgStr = s.placementDetails?.package;
    if (pkgStr && typeof pkgStr === 'string') {
      const upper = pkgStr.toUpperCase();
      if (upper.includes('LPA')) {
        const num = parseFloat(pkgStr.replace(/[^0-9.]/g, ''));
        if (!isNaN(num) && num > 0 && num < 100) {
          parsedPackages.push(num);
        }
      } else if (upper.includes('/MONTH') || upper.includes('PM') || pkgStr.includes('₹')) {
        const numStr = pkgStr.replace(/[^0-9.]/g, '');
        const num = parseFloat(numStr);
        if (!isNaN(num) && num > 0) {
          const lpa = (num * 12) / 100000;
          if (lpa > 0 && lpa < 100) {
            parsedPackages.push(lpa);
          }
        }
      }
    }
  });
  
  const avgPackage = parsedPackages.length > 0 
    ? (parsedPackages.reduce((a, b) => a + b, 0) / parsedPackages.length).toFixed(1) + ' LPA'
    : 'Not enough data';

  // Skill Insights
  const skillCounts: Record<string, number> = {};
  placedStudents.forEach(s => {
    s.skills.forEach(skill => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
  });
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);

  // Active Applications
  const activeApps = students.reduce((acc, s) => acc + s.applicationCount, 0);

  // Verification Summary
  let pendingVerifications = 0;
  let verifiedCerts = 0;
  certifications.forEach(c => {
    const status = (c.verification_status || (c.verified ? 'verified' : 'pending')).toLowerCase();
    if (status === 'verified') verifiedCerts++;
    else if (status === 'pending') pendingVerifications++;
  });

  // Pie Chart Data
  const statusData = [
    { name: 'Placed', value: placedStudents.length, color: COLORS.placed },
    { name: 'In Process', value: inProcessStudents.length, color: COLORS.inProcess },
    { name: 'Not Placed', value: notPlacedStudents.length, color: COLORS.notPlaced },
  ].filter(d => d.value > 0);

  // Download Handler
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(reportRef.current, { 
        scale: 2, 
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save("institution-placement-report.pdf");
      toast.success("Report downloaded successfully");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF report");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">Generating report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <p className="font-medium text-red-500">Failed to load report data</p>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">Institution-wide placement and student performance reports</p>
        </div>
        <Button 
          onClick={handleDownloadPDF} 
          disabled={downloading || totalStudents === 0}
          className="gap-2 shrink-0"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download Report
        </Button>
      </div>

      {totalStudents === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="font-medium">No Data Available</p>
            <p className="text-sm text-muted-foreground mt-1">There are no students in this institution to generate a report for.</p>
          </CardContent>
        </Card>
      ) : (
        /* Report Container (Used for PDF Export) */
        <div ref={reportRef} className="space-y-8 bg-background p-4 sm:p-0 rounded-xl">
          
          {/* 1. Placement Summary KPIs */}
          <div>
            <h2 className="text-lg font-semibold mb-4">1. Placement Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Users className="w-4 h-4" /> Total Students
                    </span>
                    <span className="text-2xl font-bold">{totalStudents}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-500 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Placed
                    </span>
                    <span className="text-2xl font-bold">{placedStudents.length}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-amber-600 dark:text-amber-500 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> In Process
                    </span>
                    <span className="text-2xl font-bold">{inProcessStudents.length}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-red-600 dark:text-red-500 flex items-center gap-2">
                      <XCircle className="w-4 h-4" /> Not Placed
                    </span>
                    <span className="text-2xl font-bold">{notPlacedStudents.length}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-primary flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Placement Rate
                    </span>
                    <span className="text-2xl font-bold">{placementRate}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 2. Placement Overview Chart */}
            <Card className="lg:col-span-1 shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">2. Placement Overview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
                {statusData.length > 0 ? (
                  <div className="w-full h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No placement data</p>
                )}
              </CardContent>
            </Card>

            {/* 4 & 5. Insights & Verification */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">4. Skill & Placement Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Top Placed Skills</div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {topSkills.length > 0 ? (
                          topSkills.map((skill, i) => (
                            <Badge key={i} variant="secondary">{skill}</Badge>
                          ))
                        ) : (
                          <span className="text-sm font-medium">Not enough data</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Average Verified Package</div>
                      <div className="text-xl font-semibold">{avgPackage}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Students in Pipeline</div>
                      <div className="text-xl font-semibold">{inProcessStudents.length}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Total Active Applications</div>
                      <div className="text-xl font-semibold">{activeApps}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-violet-500" /> 5. Verification Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-8">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">Pending Verifications</span>
                      <span className="text-2xl font-bold text-amber-600 dark:text-amber-500">{pendingVerifications}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">Verified Certifications</span>
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{verifiedCerts}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 3. Placement Details Table */}
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-500" /> 3. Placement Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {placedStudents.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No placement records available yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border/50">
                      <tr>
                        <th className="px-6 py-4 font-medium">Student Name</th>
                        <th className="px-6 py-4 font-medium">Company</th>
                        <th className="px-6 py-4 font-medium">Job Role</th>
                        <th className="px-6 py-4 font-medium">Package</th>
                        <th className="px-6 py-4 font-medium">Placement Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {placedStudents.map((student) => {
                        // Fetch the company name from the placement details
                        let comp = student.placementDetails?.company || 'Company not specified';
                        
                        return (
                          <tr key={student.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4 font-medium text-foreground">{student.name}</td>
                            <td className="px-6 py-4">{comp}</td>
                            <td className="px-6 py-4">{student.placementDetails?.role || '--'}</td>
                            <td className="px-6 py-4">{student.placementDetails?.package || '--'}</td>
                            <td className="px-6 py-4">
                              {student.placementDetails?.date ? new Date(student.placementDetails.date).toLocaleDateString() : '--'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}
