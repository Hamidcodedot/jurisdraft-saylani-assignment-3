'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  Shield,
  AlertTriangle,
  Lock,
  ArrowLeft,
  Printer,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  version: string;
  children: React.ReactNode;
}

const navItems = [
  { href: '/terms', label: 'Terms of Service', icon: FileText },
  { href: '/privacy', label: 'Privacy Policy', icon: Shield },
  { href: '/disclaimer', label: 'Legal Practice Disclaimer', icon: AlertTriangle },
  { href: '/security', label: 'Security Architecture', icon: Lock },
];

export const LegalLayout: React.FC<LegalLayoutProps> = ({
  title,
  subtitle,
  lastUpdated,
  version,
  children,
}) => {
  const pathname = usePathname();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      
      {/* Top Breadcrumb & Document Header Banner */}
      <div className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
              <Link href="/" className="hover:text-slate-900 transition flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Catalog</span>
              </Link>
              <span>/</span>
              <span className="text-slate-700">Legal &amp; Regulatory Compliance</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-right">
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                {version} • Effective
              </div>
              <div className="text-xs font-bold text-slate-800 font-mono">
                {lastUpdated}
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition flex items-center gap-1.5 text-xs font-semibold"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Document</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 flex flex-col md:flex-row gap-8">
        
        {/* Left Sticky Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-20 bg-white rounded-xl border border-slate-200 shadow-2xs p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-1">
              Legal Repository
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-3 mt-3 border-t border-slate-100 px-3">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                <div className="font-bold text-slate-800 mb-0.5">Need Legal Support?</div>
                For enterprise Master Services Agreements or custom DPA addenda, contact compliance@jurisdraft.io.
              </div>
            </div>
          </div>
        </aside>

        {/* Right Document Content */}
        <main className="flex-1 min-w-0 bg-white rounded-xl border border-slate-200 shadow-2xs p-6 sm:p-12 legal-content">
          {children}
        </main>

      </div>

    </div>
  );
};
