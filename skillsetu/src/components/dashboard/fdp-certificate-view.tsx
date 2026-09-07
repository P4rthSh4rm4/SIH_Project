import React, { forwardRef } from "react";
import { BookOpen, QrCode } from "lucide-react";

export interface FDPCertificateViewProps {
  facultyName: string;
  workshopTitle: string;
  collegeName?: string;
  completionDate: string | Date;
  certificateId: string;
}

export const FDPCertificateView = forwardRef<HTMLDivElement, FDPCertificateViewProps>(
  ({ facultyName, workshopTitle, collegeName = "SkillSetu University", completionDate, certificateId }, ref) => {
    const formattedDate = new Date(completionDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <div 
        ref={ref}
        style={{
          width: '800px', height: '565px', backgroundColor: '#fdfbf7', color: '#1a1f36',
          overflow: 'hidden', position: 'relative', margin: '0 auto', display: 'flex',
          flexDirection: 'column', padding: '3rem', flexShrink: 0, userSelect: 'none',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          fontFamily: 'serif' // Classic academic look
        }}
      >
        {/* Formal Bordering */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: '16px solid #1e3a8a', pointerEvents: 'none', opacity: 1 }}></div>
        <div style={{ position: 'absolute', top: '16px', left: '16px', width: 'calc(100% - 32px)', height: 'calc(100% - 32px)', border: '2px solid #fbbf24', pointerEvents: 'none', opacity: 1 }}></div>

        {/* Content Container */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', zIndex: 10, gap: '1.5rem', paddingTop: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <BookOpen style={{ width: '2.5rem', height: '2.5rem', color: '#1e3a8a' }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '0.05em', color: '#1e3a8a', textTransform: 'uppercase', margin: 0, fontFamily: 'sans-serif' }}>
              {collegeName}
            </h1>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '2.5rem', color: '#1a1f36', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0, fontWeight: 600 }}>Certificate of Participation</h2>
            <p style={{ color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.875rem', fontWeight: 600, marginTop: '0.5rem', marginBottom: 0, fontFamily: 'sans-serif' }}>
              This certifies that
            </p>
          </div>

          <div style={{ padding: '0.5rem 0', borderBottom: '2px solid #1e3a8a', width: '80%', maxWidth: '36rem', display: 'flex', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '3rem', color: '#1e3a8a', fontStyle: 'italic', fontWeight: 600, margin: 0, lineHeight: 1.2 }}>
              {facultyName}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ color: '#475569', margin: 0, fontSize: '1.125rem', fontFamily: 'sans-serif' }}>
              has successfully participated and completed the Faculty Development Program on
            </p>
            <h4 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#b45309', maxWidth: '46rem', padding: '0 2rem', lineHeight: 1.25, margin: 0 }}>
              {workshopTitle}
            </h4>
          </div>
        </div>

        {/* Footer Signatures */}
        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 10, padding: '0 3rem' }}>
          
          <div style={{ textAlign: 'center', width: '12rem' }}>
            <div style={{ borderBottom: '1px solid #1e3a8a', marginBottom: '0.5rem', paddingBottom: '0.25rem' }}>
              <span style={{ fontFamily: 'cursive', fontSize: '1.875rem', color: '#1e3a8a', fontStyle: 'italic', display: 'block' }}>Dr. R. K. Singh</span>
            </div>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', fontWeight: 700, margin: 0, fontFamily: 'sans-serif' }}>Program Coordinator</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
             <div style={{ width: '4.5rem', height: '4.5rem', backgroundColor: '#ffffff', border: '2px solid #fbbf24', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <QrCode style={{ width: '3.5rem', height: '3.5rem', color: '#1e3a8a' }} />
             </div>
          </div>

          <div style={{ textAlign: 'center', width: '12rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ borderBottom: '1px solid #1e3a8a', marginBottom: '0.5rem', paddingBottom: '0.25rem', width: '100%' }}>
               <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1a1f36', display: 'inline-block', marginTop: '0.5rem', marginBottom: '0.25rem', fontFamily: 'sans-serif' }}>
                 {formattedDate}
               </p>
            </div>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', fontWeight: 700, margin: 0, fontFamily: 'sans-serif' }}>Date of Issue</p>
            <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '0.75rem', fontFamily: 'monospace', margin: 0 }}>ID: {certificateId}</p>
          </div>
        </div>
      </div>
    );
  }
);
FDPCertificateView.displayName = "FDPCertificateView";
