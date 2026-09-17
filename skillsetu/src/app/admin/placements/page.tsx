import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Building2, TrendingUp, Award, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockPlacements = [
  { id: 1, company: "Google", role: "Software Engineer", students: 15, avgPackage: "24 LPA" },
  { id: 2, company: "Microsoft", role: "SDE 1", students: 22, avgPackage: "22 LPA" },
  { id: 3, company: "Amazon", role: "AWS Engineer", students: 30, avgPackage: "18 LPA" },
  { id: 4, company: "TCS", role: "System Engineer", students: 450, avgPackage: "7.5 LPA" },
  { id: 5, company: "Infosys", role: "Specialist Programmer", students: 210, avgPackage: "8 LPA" },
];

export default function AdminPlacementsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Placement Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Overview of campus placements and industry recruitment metrics.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Placed</CardTitle>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,205</div>
            <p className="text-xs text-muted-foreground mt-1">Students placed this year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Package</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42 LPA</div>
            <p className="text-xs text-muted-foreground mt-1">Highest package offered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Package</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.5 LPA</div>
            <p className="text-xs text-muted-foreground mt-1">Across all branches</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recruiting Companies</CardTitle>
            <Building2 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground mt-1">Participated in drives</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Recruiting Partners</CardTitle>
            <CardDescription>Companies that hired the most students.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPlacements.map((placement, i) => (
                <div key={placement.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                      {placement.company[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{placement.company}</p>
                      <p className="text-xs text-muted-foreground">{placement.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{placement.students} hires</p>
                    <p className="text-xs text-green-600">{placement.avgPackage}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6">View Complete Report</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branch-wise Placements</CardTitle>
            <CardDescription>Percentage of eligible students placed per branch.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { branch: "Computer Science", percentage: 94 },
                { branch: "Information Tech.", percentage: 89 },
                { branch: "Electronics", percentage: 76 },
                { branch: "Mechanical", percentage: 65 },
                { branch: "Civil", percentage: 52 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{item.branch}</span>
                    <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.percentage > 80 ? 'bg-green-500' :
                        item.percentage > 60 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
