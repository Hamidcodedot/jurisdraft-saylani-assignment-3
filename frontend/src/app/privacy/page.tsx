'use client';

import React from 'react';
import { LegalLayout } from '@/components/LegalLayout';
import { Shield, Lock, EyeOff, Server, CheckCircle2, UserCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy &amp; Data Protection"
      subtitle="Our legally binding commitment to corporate confidentiality, zero AI model training, cryptographic vault security, and GDPR/CCPA compliance."
      lastUpdated="September 10, 2026"
      version="Version 1.2"
    >
      <div className="space-y-8 text-slate-700 text-xs sm:text-sm leading-relaxed">
        
        {/* Zero Training Commitment Banner */}
        <div className="p-5 bg-[#0C1838] text-white rounded-xl shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
            <EyeOff className="w-4 h-4" />
            <span>Absolute Enterprise Privacy Guarantee</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold font-serif text-white">
            Zero AI Model Training on Customer Data
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            JurisDraft guarantees that your contract text, uploaded agreements, conversational prompts, counterparty identities, and business parameters are <strong>NEVER used to train, retrain, fine-tune, or align any public or private artificial intelligence models</strong>, whether operated by JurisDraft or any third-party infrastructure provider.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif border-b border-slate-200 pb-1.5 flex items-center gap-2">
            <span className="text-[#D4AF37]">1.</span> Scope &amp; Privacy Philosophy
          </h2>
          <p>
            At JurisDraft, privacy is not a decorative marketing statement—it is a core engineering constraint. We understand that contracts contain your company’s most confidential information: intellectual property disclosures, capitalization terms, proprietary rates, and strategic business relationships.
          </p>
          <p>
            This Privacy Policy governs the processing of personal and corporate data collected when you access the platform, interact with our intake assistant, or store documents in your corporate vault.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif border-b border-slate-200 pb-1.5 flex items-center gap-2">
            <span className="text-[#D4AF37]">2.</span> Information We Collect
          </h2>
          <div className="space-y-3">
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70">
              <div className="font-bold text-slate-900 text-xs mb-1">A. Account Credentials</div>
              <p className="text-xs text-slate-600">
                Full name, corporate email address, encrypted salted password hash (PBKDF2/SHA256), and optional company name.
              </p>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70">
              <div className="font-bold text-slate-900 text-xs mb-1">B. Contract Parameter Data</div>
              <p className="text-xs text-slate-600">
                Contractual variables explicitly submitted during intake interviews or form completion (such as party names, effective dates, governing jurisdiction, and commercial scope).
              </p>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70">
              <div className="font-bold text-slate-900 text-xs mb-1">C. Technical Telemetry (Minimized)</div>
              <p className="text-xs text-slate-600">
                IP address, user agent, and API timestamp metadata strictly necessary for rate limiting, DDoS mitigation, and audit logging. We do not use cross-site tracking cookies.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif border-b border-slate-200 pb-1.5 flex items-center gap-2">
            <span className="text-[#D4AF37]">3.</span> How We Process Your Data
          </h2>
          <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2 text-xs sm:text-sm">
            <li><strong>Live Document Interpolation:</strong> Parameter values are substituted into validated Common Paper markdown frameworks in-memory.</li>
            <li><strong>Conversational Inference:</strong> Stateless prompt transmission to dedicated inference clusters for sub-second field extraction. Prompts are purged immediately post-execution.</li>
            <li><strong>Publication PDF Generation:</strong> Document markdown is compiled into vector PDFs on isolated backend instances and streamed directly to your browser.</li>
            <li><strong>Vault Persistence:</strong> Document drafts are stored in your encrypted cloud vault only when explicitly saved.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif border-b border-slate-200 pb-1.5 flex items-center gap-2">
            <span className="text-[#D4AF37]">4.</span> Data Retention &amp; Permanent Purging Protocol
          </h2>
          <p>
            You maintain full sovereignty over your data lifecycle:
          </p>
          <div className="p-3.5 bg-emerald-50/40 border border-emerald-200 rounded-lg text-xs space-y-1.5 text-slate-700">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Customer-Initiated Data Erasure
            </div>
            <p>
              When you delete a document from your <strong>Corporate Vault</strong>, the document content, metadata, and all associated revisions are immediately and permanently removed from active databases and cannot be recovered.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif border-b border-slate-200 pb-1.5 flex items-center gap-2">
            <span className="text-[#D4AF37]">5.</span> GDPR &amp; CCPA / CPRA Statutory Rights
          </h2>
          <p>
            Under the European General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), you enjoy the following rights:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
              <span className="font-bold text-slate-900 block mb-0.5">Right of Access &amp; Portability</span>
              Export all stored documents in standard Markdown and PDF formats at any time.
            </div>
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
              <span className="font-bold text-slate-900 block mb-0.5">Right of Rectification</span>
              Update, amend, or rewrite any contractual parameter or account credential.
            </div>
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
              <span className="font-bold text-slate-900 block mb-0.5">Right to Erasure ("To Be Forgotten")</span>
              Request permanent account and vault deletion with zero residual archival.
            </div>
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
              <span className="font-bold text-slate-900 block mb-0.5">No Sale of Personal Data</span>
              JurisDraft never sells, rents, or monetizes user data to third parties.
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-3 pt-4 border-t border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            6. Data Protection Officer (DPO) Contact
          </h2>
          <p className="text-xs text-slate-500">
            For statutory privacy inquiries, GDPR data requests, or enterprise DPA execution, contact our Data Protection Officer at <a href="mailto:privacy@jurisdraft.io" className="text-slate-900 underline font-semibold">privacy@jurisdraft.io</a>.
          </p>
        </section>

      </div>
    </LegalLayout>
  );
}
