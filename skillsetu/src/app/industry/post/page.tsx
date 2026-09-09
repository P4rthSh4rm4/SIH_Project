"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { OpportunityType } from "@/lib/types";

export default function PostOpportunity() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "internship" as OpportunityType,
    location: "",
    stipend: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to post an opportunity");
        return;
      }

      const { error } = await supabase
        .from("opportunities")
        .insert({
          industry_id: user.id,
          title: formData.title,
          type: formData.type,
          location: formData.location,
          stipend: formData.stipend,
          description: formData.description,
          status: "active", // The lifecycle status
          verification_status: "pending", // Always set to pending for Faculty verification
        });

      if (error) throw error;
      
      toast.success("Opportunity submitted for verification!");
      router.push("/industry/dashboard");
      router.refresh();
      
    } catch (err) {
      console.error("Supabase insert error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to post opportunity: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/industry/dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Post Opportunity</h1>
          <p className="text-muted-foreground mt-1">
            Submit a new listing. It will be verified by faculty before becoming active.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-xl">Opportunity Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input 
                required 
                placeholder="e.g. Software Engineer Intern"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select 
                  value={formData.type} 
                  onValueChange={(val) => setFormData({ ...formData, type: val as OpportunityType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="job">Full-time Job</SelectItem>
                    <SelectItem value="micro-internship">Micro-Internship</SelectItem>
                    <SelectItem value="bounty">Bounty/Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input 
                  placeholder="e.g. Remote, Bangalore"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Stipend / Salary</label>
              <Input 
                placeholder="e.g. ₹20,000/month or Unpaid"
                value={formData.stipend}
                onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                required
                className="min-h-[150px]"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 flex justify-end border-t border-border/30 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Submit for Verification
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
