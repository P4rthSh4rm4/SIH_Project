import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Construction } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Insights and metrics for your listings</p>
      </div>
      <Card className="border-border/50 border-dashed bg-secondary/10">
        <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <BarChart3 className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-lg font-medium text-foreground">Coming Soon</p>
          <p className="text-sm">Detailed analytics and reporting dashboards are currently under development.</p>
        </CardContent>
      </Card>
    </div>
  );
}
