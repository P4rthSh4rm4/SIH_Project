import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockStudents = [
  { id: "STU001", name: "Rahul Sharma", email: "rahul.s@example.com", institution: "IIT Delhi", year: "4th Year", status: "Active" },
  { id: "STU002", name: "Priya Patel", email: "priya.p@example.com", institution: "NIT Trichy", year: "3rd Year", status: "Active" },
  { id: "STU003", name: "Amit Kumar", email: "amit.k@example.com", institution: "BITS Pilani", year: "4th Year", status: "Placed" },
  { id: "STU004", name: "Neha Gupta", email: "neha.g@example.com", institution: "VIT Vellore", year: "2nd Year", status: "Active" },
  { id: "STU005", name: "Vikram Singh", email: "vikram.s@example.com", institution: "IIT Bombay", year: "Alumni", status: "Placed" },
];

export default function AdminStudentsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all registered students and their demographics.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </div>

      {/* Demographics Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Year Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { year: "1st Year", count: "3,200", percent: 22 },
                { year: "2nd Year", count: "3,800", percent: 27 },
                { year: "3rd Year", count: "4,100", percent: 29 },
                { year: "4th Year", count: "3,131", percent: 22 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{item.year}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Branches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { branch: "Computer Science", count: "5,400", percent: 38 },
                { branch: "Electronics", count: "3,200", percent: 22 },
                { branch: "Mechanical", count: "2,100", percent: 15 },
                { branch: "Civil", count: "1,500", percent: 11 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{item.branch}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gender Ratio</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[120px]">
            <div className="flex w-full h-8 rounded-md overflow-hidden">
              <div className="bg-blue-500 h-full flex items-center justify-center text-xs text-white font-medium" style={{ width: "62%" }}>
                62% M
              </div>
              <div className="bg-pink-500 h-full flex items-center justify-center text-xs text-white font-medium" style={{ width: "38%" }}>
                38% F
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Logged-in Students</CardTitle>
          <CardDescription>A complete directory of active students.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search students..." className="pl-8" />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="w-full overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Institution</th>
                    <th className="px-4 py-3 font-medium">Year</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mockStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{student.id}</td>
                      <td className="px-4 py-3">{student.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{student.email}</td>
                      <td className="px-4 py-3">{student.institution}</td>
                      <td className="px-4 py-3">{student.year}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.status === "Active" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                          student.status === "Placed" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        }`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
