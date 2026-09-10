'use client';

import React from 'react';
import { LegalLayout } from '@/components/LegalLayout';
import { Lock, ShieldCheck, Server, KeyRound, Cpu, CheckCircle2 } from 'lucide-react';

export default function SecurityArchitecturePage() {
  return (
    <LegalLayout
      title="Enterprise Security Architecture"
      subtitle="Comprehensive technical documentation regarding encryption standards, multi-tenant vault isolation, stateless AI processing, and infrastructure resilience."
      lastUpdated="September 10, 2026"
      version="Version 1.2"
    >
      <div className="space-y-8 text-slate-700 text-xs sm:text-sm leading-relaxed">
        
        {/* Security Posture Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <Lock className="w-5 h-5 text-slate-900" />
            <div className="font-bold text-slate-900 text-xs">AES-256 &amp; TLS 1.3</div>
            <p className="text-[11px] text-slate-500">Bank-grade encryption for all data at rest and in transit.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <Cpu className="w-5 h-5 text-slate-900" />
            <div className="font-bold text-slate-900 text-xs">Stateless Inference</div>
            <p className="text-[11px] text-slate-500">Sub-second inference with instantaneous in-memory prompt purge.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <KeyRound className="w-5 h-5 text-slate-900" />
            <div className="font-bold text-slate-900 text-xs">Cryptographic Vaults</div>
            <p className="text-[11px] text-slate-500">Strict multi-tenant tenant-ID segregation on every query.</p>
          </div>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif border-b border-slate-200 pb-1.5 flex items-center gap-2">
            <span className="text-[#D4AF37]">1.</span> Encryption Standards
          </h2>
          <div className="space-y-3">
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70">
              <span className="font-bold text-slate-900 text-xs block mb-1">Data in Transit</span>
              <p className="text-xs text-slate-600">
                All client-to-server and inter-service communications enforce modern Transport Layer Security (TLS 1.3) with perfect forward secrecy (PFS). Insecure cipher suites and HTTP fallback are strictly rejected with HTTP Strict Transport Security (HSTS) headers.
              </p>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70">
              <span className="font-bold text-slate-900 text-xs block mb-1">Data at Rest</span>
              <p className="text-xs text-slate-600">
                All cloud vault databases, document snapshots, and user credentials are encrypted using industry-standard Advanced Encryption Standard with 256-bit keys (AES-256). User passwords are treated with PBKDF2/SHA256 with per-user cryptographic salts.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif border-b border-slate-200 pb-1.5 flex items-center gap-2">
            <span className="text-[#D4AF37]">2.</span> Multi-Tenant Data Isolation
          </h2>
          <p>
            JurisDraft implements strict tenant data partitioning:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2 text-xs sm:text-sm">
            <li><strong>Row-Level Tenant Authorization:</strong> Every database query, mutation, and PDF retrieval enforces non-bypassable ownership filters keyed to the authenticated user’s cryptographically signed JWT token.</li>
            <li><strong>Guest Draft Isolation:</strong> Unauthenticated freemium drafting sessions reside strictly in client-side ephemeral state and are never committed to permanent vault storage until the user explicitly authenticates.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif border-b border-slate-200 pb-1.5 flex items-center gap-2">
            <span className="text-[#D4AF37]">3.</span> Sub-Second AI Pipeline Security
          </h2>
          <p>
            Our conversational intake assistant leverages high-throughput Cerebras fast inference through secure, isolated API gateways:
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
            <div className="font-bold text-slate-900">Zero Model Training &amp; Zero Log Retention:</div>
            <p className="text-slate-600">
              Contract variable extraction requests are processed via non-retained endpoints. Prompts are never cached in persistent disks by the inference engine and are strictly purged upon token delivery.
            </p>
            <div className="font-bold text-slate-900 pt-1">Deterministic Local Rule-Engine Fallback:</div>
            <p className="text-slate-600">
              In situations where external network access is restricted or disabled, JurisDraft automatically switches to an in-process deterministic regex and rule-based paralegal engine, ensuring 100% operational autonomy without external data egress.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif border-b border-slate-200 pb-1.5 flex items-center gap-2">
            <span className="text-[#D4AF37]">4.</span> Vulnerability Management &amp; Container Hardening
          </h2>
          <p>
            The JurisDraft deployment stack utilizes hardened, minimal multi-stage Docker containers (`node:20-slim` and `python:3.12-slim`), running with unprivileged system users, stripped compiler dependencies, and strict read-only filesystems wherever applicable.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 pt-4 border-t border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            5. Responsible Disclosure Program
          </h2>
          <p className="text-xs text-slate-500">
            Security researchers and enterprise compliance auditors can report findings directly to <a href="mailto:security@jurisdraft.io" className="text-slate-900 underline font-semibold">security@jurisdraft.io</a>. We acknowledge all reports within 24 hours.
          </p>
        </section>

      </div>
    </LegalLayout>
  );
}
