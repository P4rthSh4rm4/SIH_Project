import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mockAcademicians = [
  { id: "ACD001", name: "Dr. Sunita Sharma", email: "sunita.s@iitd.ac.in", institution: "IIT Delhi", role: "Professor", department: "Computer Science" },
  { id: "ACD002", name: "Prof. Rajesh Kumar", email: "rajesh.k@nitt.edu", institution: "NIT Trichy", role: "HOD", department: "Electronics" },
  { id: "ACD003", name: "Dr. Anil Desai", email: "anil.d@bits.edu", institution: "BITS Pilani", role: "Assistant Professor", department: "Mechanical" },
  { id: "ACD004", name: "Dr. Meena Gupta", email: "meena.g@vit.ac.in", institution: "VIT Vellore", role: "Associate Professor", department: "Civil" },
  { id: "ACD005", name: "Prof. Vikram Reddy", email: "vikram.r@iitb.ac.in", institution: "IIT Bombay", role: "Professor", department: "Computer Science" },
];

export default function AdminAcademiciansPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academicians Directory</h1>
          <p className="text-muted-foreground mt-2">
            View all logged-in faculty members and academicians across institutions.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Academicians</CardTitle>
          <CardDescription>A comprehensive list of faculty members.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search academicians by name, institution, or department..." className="pl-8" />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockAcademicians.map((academician) => (
              <Card key={academician.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {academician.name.split(" ").map(n => n[0]).join("").substring(0, 2).replace(/[^A-Z]/g, '') || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-base">{academician.name}</h3>
                          <p className="text-sm text-muted-foreground">{academician.role}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Institution</span>
                        <span className="font-medium text-right">{academician.institution}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Department</span>
                        <span className="font-medium text-right">{academician.department}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-muted-foreground text-xs truncate max-w-[150px]">{academician.email}</span>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10">
                          <Mail className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
