import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { GraduationCap, BookOpen, Users, Clock, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockPrograms = [
  { id: 1, title: "Next-Gen Web Development", type: "Student Training", duration: "8 Weeks", enrolled: 1250, completed: 840, instructor: "CodeAcademy" },
  { id: 2, title: "Cloud Architecture Fundamentals", type: "Student Training", duration: "6 Weeks", enrolled: 890, completed: 420, instructor: "AWS Educate" },
  { id: 3, title: "Effective AI Pedagogy", type: "FDP", duration: "2 Weeks", enrolled: 145, completed: 145, instructor: "Dr. A. Sharma" },
  { id: 4, title: "Cybersecurity Bootcamp", type: "Student Training", duration: "10 Weeks", enrolled: 2100, completed: 1100, instructor: "Cisco Networking Academy" },
];

export default function AdminTrainingPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Training & FDPs</h1>
          <p className="text-muted-foreground mt-2">
            Monitor ongoing student training and Faculty Development Programs.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Create New Program
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockPrograms.map((program) => (
          <Card key={program.id} className="flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  program.type === 'FDP' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {program.type}
                </span>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  {program.duration}
                </div>
              </div>
              <CardTitle className="text-xl line-clamp-2">{program.title}</CardTitle>
              <CardDescription>Instructor: {program.instructor}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    Enrolled
                  </div>
                  <span className="font-medium">{program.enrolled.toLocaleString()}</span>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Completion Rate</span>
                    <span className="font-medium">{Math.round((program.completed / program.enrolled) * 100)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(program.completed / program.enrolled) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t">
              <Button variant="ghost" className="w-full flex items-center justify-center text-primary">
                <PlayCircle className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
