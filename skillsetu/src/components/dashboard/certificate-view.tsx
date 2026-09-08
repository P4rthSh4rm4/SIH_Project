import React, { forwardRef } from "react";
import { Award, ShieldCheck, QrCode } from "lucide-react";

export interface CertificateViewProps {
  studentName: string;
  courseTitle: string;
  provider: string;
  completionDate: string | Date;
  certificateId: string;
  score?: number;
}

export const CertificateView = forwardRef<HTMLDivElement, CertificateViewProps>(
  ({ studentName, courseTitle, provider, completionDate, certificateId, score }, ref) => {
    const formattedDate = new Date(completionDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <div 
        ref={ref}
        style={{
          width: '800px', height: '565px', backgroundColor: '#ffffff', color: '#0f172a',
          overflow: 'hidden', position: 'relative', margin: '0 auto', display: 'flex',
          flexDirection: 'column', padding: '3rem', flexShrink: 0, userSelect: 'none',
          background: 'linear-gradient(to bottom right, #ffffff, #f1f5f9)',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          fontFamily: 'sans-serif'
        }}
      >
        {/* Ornaments */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1rem', background: 'linear-gradient(to right, #059669, #14b8a6, #2563eb)' }}></div>
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', width: '768px', height: '533px', border: '4px double #e2e8f0', pointerEvents: 'none', borderRadius: '0.25rem', opacity: 0.8 }}></div>
        <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', width: '752px', height: '517px', border: '1px solid #e2e8f0', pointerEvents: 'none', borderRadius: '0.25rem', opacity: 0.5 }}></div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', zIndex: 10, gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Award style={{ width: '2.5rem', height: '2.5rem', color: '#059669' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#0f172a', textTransform: 'uppercase', margin: 0 }}>SkillSetu</h1>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontFamily: 'serif', color: '#1e293b', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Certificate of Completion</h2>
            <p style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.875rem', fontWeight: 600, marginTop: '0.5rem', marginBottom: 0 }}>This is to certify that</p>
          </div>

          <div style={{ padding: '1rem 0', borderBottom: '2px solid #cbd5e1', width: '75%', maxWidth: '32rem', display: 'flex', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '2.25rem', fontFamily: 'serif', color: '#0f172a', fontStyle: 'italic', fontWeight: 500, margin: 0 }}>{studentName}</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ color: '#64748b', margin: 0 }}>has successfully completed the program</p>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#047857', maxWidth: '42rem', padding: '0 2rem', lineHeight: 1.25, margin: 0 }}>
              {courseTitle}
            </h4>
            <p style={{ color: '#64748b', fontWeight: 500, paddingTop: '0.25rem', margin: 0 }}>
              provided by <span style={{ color: '#1e293b', fontWeight: 600 }}>{provider}</span>
            </p>
            {score !== undefined && (
              <p style={{ color: '#047857', fontWeight: 700, paddingTop: '0.75rem', fontSize: '0.875rem', margin: 0 }}>
                Assessment Score: {score}%
              </p>
            )}
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 10, padding: '0 2rem' }}>
          <div style={{ textAlign: 'left', width: '12rem' }}>
            <div style={{ borderBottom: '1px solid #94a3b8', marginBottom: '0.5rem', paddingBottom: '0.25rem', textAlign: 'center' }}>
              <span style={{ fontFamily: 'cursive', fontSize: '1.875rem', color: '#334155', fontStyle: 'italic', display: 'block' }}>SkillSetu</span>
            </div>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700, textAlign: 'center', margin: 0 }}>Authorized Signature</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
             <div style={{ width: '5rem', height: '5rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.25rem' }}>
               <QrCode style={{ width: '4rem', height: '4rem', color: '#1e293b' }} />
             </div>
          </div>

          <div style={{ textAlign: 'right', width: '12rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ borderBottom: '1px solid #94a3b8', marginBottom: '0.5rem', paddingBottom: '0.25rem', textAlign: 'center', width: '100%' }}>
               <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', display: 'inline-block', marginTop: '0.5rem', marginBottom: '0.25rem' }}>{formattedDate}</p>
            </div>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700, margin: 0 }}>Date of Completion</p>
            <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '0.75rem', fontFamily: 'monospace', margin: 0 }}>ID: {certificateId}</p>
          </div>
        </div>
      </div>
    );
  }
);
CertificateView.displayName = "CertificateView";
