"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Building2, UserPlus, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const mockRecruiters = [
  { id: "REC001", company: "TCS", contactName: "Ananya Singh", email: "hr@tcs.com", activeDrives: 3, status: "Active" },
  { id: "REC002", company: "Infosys", contactName: "Rohan Das", email: "talent@infosys.com", activeDrives: 2, status: "Active" },
  { id: "REC003", company: "Wipro", contactName: "Kavya Menon", email: "careers@wipro.com", activeDrives: 0, status: "Inactive" },
  { id: "REC004", company: "Google India", contactName: "Amit Patel", email: "university@google.com", activeDrives: 1, status: "Active" },
];

export default function AdminRecruitersPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recruiter Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage industry partners and invite new recruiters to the platform.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 border-primary/20 shadow-md">
          <CardHeader className="bg-primary/5 pb-4">
            <CardTitle className="flex items-center text-lg">
              <UserPlus className="w-5 h-5 mr-2 text-primary" />
              Invite Recruiter
            </CardTitle>
            <CardDescription>Send an invitation link to a new industry partner.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" placeholder="e.g. Microsoft" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input id="contactPerson" placeholder="e.g. Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="hr@company.com" />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button className="w-full flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send Invitation
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Active Recruiters</CardTitle>
            <CardDescription>Industry partners currently registered on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search recruiters by company or name..." className="pl-8" />
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <div className="w-full overflow-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 font-medium">Company</th>
                      <th className="px-4 py-3 font-medium">Contact</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Active Drives</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {mockRecruiters.map((recruiter) => (
                      <tr key={recruiter.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-4 font-medium flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          {recruiter.company}
                        </td>
                        <td className="px-4 py-4">{recruiter.contactName}</td>
                        <td className="px-4 py-4 text-muted-foreground">{recruiter.email}</td>
                        <td className="px-4 py-4 text-center">
                          <span className="bg-secondary px-2 py-1 rounded-md text-xs font-medium">
                            {recruiter.activeDrives}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            {recruiter.status === "Active" ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-gray-400 ml-1" />
                            )}
                            <span className={recruiter.status === "Active" ? "text-green-600 font-medium" : "text-gray-500"}>
                              {recruiter.status}
                            </span>
                          </div>
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
    </div>
  );
}
