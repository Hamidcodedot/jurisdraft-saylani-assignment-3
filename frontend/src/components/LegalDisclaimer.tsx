import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface LegalDisclaimerProps {
  compact?: boolean;
}

export const LegalDisclaimer: React.FC<LegalDisclaimerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50/80 border border-amber-200/80 rounded-md text-[11px] text-amber-900">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
        <span>
          <strong>Draft Document:</strong> Subject to formal review and verification by licensed legal counsel before execution.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4 shadow-sm text-slate-800">
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-amber-100 rounded-md text-amber-700 flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="text-xs leading-relaxed space-y-1">
          <p className="font-semibold text-amber-900 tracking-tight">
            MANDATORY LEGAL PRACTICE DISCLAIMER
          </p>
          <p className="text-slate-700">
            This agreement is a non-binding preliminary draft compiled using automated template interpolation and conversational AI assistance. 
            Pre-Legal is a software platform, not a law firm, and does not provide legal representation, statutory advice, or attorney-client privileged counsel.
          </p>
          <p className="text-slate-600">
            Users must have this document formally evaluated, adapted, and approved by qualified legal counsel licensed in the governing jurisdiction prior to execution.
          </p>
        </div>
      </div>
    </div>
  );
};
