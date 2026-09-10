'use client';

import React from 'react';
import { LegalLayout } from '@/components/LegalLayout';
import { AlertTriangle, Scale, ShieldAlert, BookOpen, CheckCircle, Info } from 'lucide-react';

export default function LegalDisclaimerPage() {
  return (
    <LegalLayout
      title="Legal Practice &amp; Representation Disclaimer"
      subtitle="Mandatory statutory disclosure regarding entity classification, absence of attorney-client privilege, and professional counsel review requirements."
      lastUpdated="September 10, 2026"
      version="Version 1.2"
    >
      <div className="space-y-8 text-slate-700 text-xs sm:text-sm leading-relaxed">
        
        {/* Prominent Disclaimer Alert Box */}
        <div className="p-5 bg-amber-50/80 border-2 border-amber-300 rounded-xl text-amber-950 space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>CRITICAL STATUTORY DISCLOSURE — READ BEFORE USING DOCUMENTS</span>
          </div>
          <p className="font-bold text-sm sm:text-base leading-snug font-serif text-slate-900">
            JurisDraft is a software technology company. JurisDraft is not a law firm, does not provide legal advice, and does not substitute for the professional judgment of licensed legal counsel.
          </p>
          <p className="text-xs text-slate-700 leading-relaxed">
            All legal agreements, contract templates, clause suggestions, and conversational assistance provided through this platform are preliminary drafts generated for commercial workflow convenience only. <strong>No attorney-client relationship is created by your use of this service.</strong>
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif border-b border-slate-200 pb-1.5 flex items-center gap-2">
            <span className="text-[#D4AF37]">1.</span> Entity Classification &amp; Unauthorized Practice of Law (UPL)
          </h2>
          <p>
            In strict compliance with statutory regulations prohibiting the unauthorized practice of law in the United States (including Delaware and California state bar ethics guidelines), the European Union, and international common-law jurisdictions:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 border border-slate-200 rounded-lg bg-slate-50 space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-slate-700" />
                Software Automation Only
              </span>
              <p className="text-slate-600">
                JurisDraft provides programmatic template interpolation, schema validation, and structured document storage.
              </p>
            </div>
            <div className="p-3.5 border border-slate-200 rounded-lg bg-slate-50 space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                No Legal Representation
              </span>
              <p className="text-slate-600">
                JurisDraft does not review drafts for legal sufficiency, draw legal conclusions, or provide strategic legal advice.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif border-b border-slate-200 pb-1.5 flex items-center gap-2">
            <span className="text-[#D4AF37]">2.</span> No Attorney-Client Privilege
          </h2>
          <p>
            Communications between you and JurisDraft (including questions submitted to our conversational AI assistant or customer support) are <strong>not protected by attorney-client privilege</strong> or the work-product doctrine.
          </p>
          <p>
            Although all customer data is encrypted in transit and stored in protected corporate vaults pursuant to our Privacy Policy, it does not constitute privileged legal correspondence.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif border-b border-slate-200 pb-1.5 flex items-center gap-2">
            <span className="text-[#D4AF37]">3.</span> Jurisdictional Differences &amp; Enforceability
          </h2>
          <p>
            The law is dynamic and highly jurisdiction-specific. Contract enforceability, implied covenant interpretations, non-compete validity, and liability limitation caps differ materially across jurisdictions:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2 text-xs sm:text-sm">
            <li><strong>State &amp; National Variances:</strong> What is enforceable in Delaware may be void against public policy in California, New York, or under EU member state directives.</li>
            <li><strong>Industry-Specific Regulations:</strong> Regulated industries (such as financial services, healthcare HIPAA compliance, or government defense contracting) require tailored regulatory clauses.</li>
            <li><strong>Tax &amp; Accounting Implications:</strong> Structuring intellectual property transfers and contractor compensation carries significant tax considerations.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif border-b border-slate-200 pb-1.5 flex items-center gap-2">
            <span className="text-[#D4AF37]">4.</span> Mandatory Pre-Execution Review Protocol
          </h2>
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
            <div className="font-bold text-[#D4AF37] text-xs uppercase tracking-wider">
              Standard Operating Procedure for Corporate Users
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Prior to executing any document generated via JurisDraft:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-xs text-slate-200 pl-1">
              <li>Export or print the complete draft agreement using the platform's PDF or Markdown compiler;</li>
              <li>Submit the complete text to an attorney licensed in the governing jurisdiction specified in Section 6 of the agreement;</li>
              <li>Incorporate counsel's bespoke adjustments using the platform's <strong>Direct Clause Editor</strong>;</li>
              <li>Execute only after receiving formal written legal certification.</li>
            </ol>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 pt-4 border-t border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            5. Inquiries
          </h2>
          <p className="text-xs text-slate-500">
            For questions regarding our regulatory posture or terms of service, contact <a href="mailto:compliance@jurisdraft.io" className="text-slate-900 underline font-semibold">compliance@jurisdraft.io</a>.
          </p>
        </section>

      </div>
    </LegalLayout>
  );
}
