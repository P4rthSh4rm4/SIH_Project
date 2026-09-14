"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Loader2, 
  FileCheck, 
  FileText,
  AlertCircle,
  ExternalLink,
  Calendar,
  Building,
  GraduationCap
} from "lucide-react";
import { useInstitutionVerification, type InstitutionCertification } from "@/lib/hooks/useInstitutionVerification";

export default function InstitutionVerificationPage() {
  const { loading, error, certifications } = useInstitutionVerification();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedCert, setSelectedCert] = useState<InstitutionCertification | null>(null);

  // Client-side filtering
  const filteredCerts = certifications.filter(cert => {
    const searchLower = searchQuery.toLowerCase();
    const name = cert.student_name || '';
    const email = cert.student_email || '';
    const title = cert.title || '';
    const issuer = cert.issuer || '';

    const matchesSearch = name.toLowerCase().includes(searchLower) || 
                          email.toLowerCase().includes(searchLower) ||
                          title.toLowerCase().includes(searchLower) ||
                          issuer.toLowerCase().includes(searchLower);
    
    if (!matchesSearch) return false;
    
    if (statusFilter === "all") return true;

    const actualStatus = (cert.verification_status || (cert.verified ? 'verified' : 'pending')).toLowerCase();
    return actualStatus === statusFilter;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Verification</h1>
        <p className="text-muted-foreground mt-1">Review and verify student certifications and documents.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search student or certificate..."
            className="pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'all')}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Documents</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Loading verification records...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <p className="font-medium text-red-500">Failed to load records</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          ) : certifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-medium">No records found</p>
              <p className="text-sm text-muted-foreground mt-1">There are no certifications recorded for your students yet.</p>
            </div>
          ) : filteredCerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No records match your search and filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Student</th>
                    <th className="px-6 py-4 font-medium">Certificate Title</th>
                    <th className="px-6 py-4 font-medium">Issuer</th>
                    <th className="px-6 py-4 font-medium">Issue Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCerts.map((cert) => (
                    <tr key={cert.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{cert.student_name}</div>
                        <div className="text-xs text-muted-foreground">{cert.student_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-violet-500 shrink-0" />
                          <span className="font-medium">{cert.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {cert.issuer}
                      </td>
                      <td className="px-6 py-4">
                        {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : '--'}
                      </td>
                      <td className="px-6 py-4">
                        {cert.verification_status === 'verified' || cert.verified ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none">Verified</Badge>
                        ) : cert.verification_status === 'rejected' ? (
                          <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-none">Rejected</Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-none">Pending</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedCert(cert)}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedCert} onOpenChange={(open) => !open && setSelectedCert(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Document Review</DialogTitle>
            <DialogDescription>
              View the details of the submitted certificate. Administrative permissions are required to modify verification statuses.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCert && (
            <div className="space-y-6 pt-4">
              
              {/* Student Info */}
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/20">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">{selectedCert.student_name}</div>
                  <div className="text-xs text-muted-foreground">{selectedCert.student_email}</div>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-violet-500" /> Document Information
                  </h4>
                  <div className="bg-background border border-border/50 rounded-xl p-4 space-y-3 shadow-sm">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Title</div>
                      <div className="font-medium">{selectedCert.title}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Building className="w-3 h-3" /> Issuer
                        </div>
                        <div className="text-sm">{selectedCert.issuer}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Issue Date
                        </div>
                        <div className="text-sm">{selectedCert.issued_at ? new Date(selectedCert.issued_at).toLocaleDateString() : 'Not provided'}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Credential ID</div>
                      <div className="text-sm font-mono bg-muted/50 px-2 py-1 rounded inline-block">
                        {selectedCert.credential_id || 'Not provided'}
                      </div>
                    </div>

                    {selectedCert.certificate_url && (
                      <div className="pt-2">
                        <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                          <a 
                            href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/certificates/${selectedCert.certificate_url}`}
                            target="_blank" 
                            rel="noreferrer"
                          >
                            <ExternalLink className="w-4 h-4" /> View Original Document
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <div>
                  <div className="text-sm font-medium text-amber-700 dark:text-amber-500">Current Status</div>
                  <div className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-0.5">
                    {selectedCert.verification_status === 'verified' || selectedCert.verified ? 'Document verified' : 
                     selectedCert.verification_status === 'rejected' ? 'Document rejected' : 
                     'Awaiting verification'}
                  </div>
                </div>
                {selectedCert.verification_status === 'verified' || selectedCert.verified ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-none px-3 py-1 text-sm">Verified</Badge>
                ) : selectedCert.verification_status === 'rejected' ? (
                  <Badge className="bg-red-500/10 text-red-600 border-none px-3 py-1 text-sm">Rejected</Badge>
                ) : (
                  <Badge className="bg-amber-500/10 text-amber-600 border-none px-3 py-1 text-sm">Pending</Badge>
                )}
              </div>
              
              <div className="text-xs text-center text-muted-foreground italic">
                Read-only view. The current security policy requires SuperAdmin privileges to alter document states.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
