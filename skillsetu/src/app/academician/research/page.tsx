import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical, Search, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResearchPage() {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FlaskConical className="w-8 h-8 text-emerald-500" />
            Research & Publications
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Track your ongoing research, published papers, and active grant applications.
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <PlusCircle className="w-4 h-4 mr-2" /> New Project
        </Button>
      </div>

      <Card className="border-dashed border-2 border-border/60 bg-muted/10">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center h-64">
          <Search className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No Research Projects Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Get started by adding your first publication or research grant. Keep track of co-authors and milestones here.
          </p>
          <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
            Add Publication
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
