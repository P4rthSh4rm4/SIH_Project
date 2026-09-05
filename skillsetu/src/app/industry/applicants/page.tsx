import { Card, CardContent } from "@/components/ui/card";
import { Kanban, Construction } from "lucide-react";

export default function ApplicantsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Applicants</h1>
        <p className="text-muted-foreground mt-1">Manage and track opportunity applications</p>
      </div>
      <Card className="border-border/50 border-dashed bg-secondary/10">
        <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Kanban className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-lg font-medium text-foreground">Coming Soon</p>
          <p className="text-sm">The applicant tracking board (Kanban) is currently under development.</p>
        </CardContent>
      </Card>
    </div>
  );
}
