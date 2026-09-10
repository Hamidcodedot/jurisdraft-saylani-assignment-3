'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Shield, FileCheck, Zap, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { TemplateCard } from '@/components/TemplateCard';
import { api, TemplateSummary } from '@/lib/api';

export default function HomePage() {
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    api.getTemplates()
      .then((data) => setTemplates(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(templates.map((t) => t.category)))];

  const filteredTemplates = templates.filter((t) => {
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col">
      
      {/* Executive Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="max-w-3xl">
            {/* Top Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white border border-slate-700 text-[11px] font-semibold tracking-wide uppercase mb-6 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
              <span className="text-[#D4AF37] font-bold">JurisDraft</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300">Enterprise Contract Automation Suite</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-serif leading-[1.15] mb-6">
              Institutional Legal Agreements, Engineered for Global Enterprise.
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl font-normal">
              Draft bilateral NDAs, Cloud Master Services Agreements, and enterprise software licenses using vetted institutional standards. Powered by conversational paralegal intake, interactive clause editing, and encrypted multi-tenant vaults.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#catalog"
                className="px-5 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition flex items-center gap-2"
              >
                <span>Browse Standard Templates</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <Link
                href="/editor/mutual-nda"
                className="px-5 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-sm transition"
              >
                Quick Draft: Mutual NDA
              </Link>
            </div>

            {/* Trust Metrics Pill Row */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Common Paper Standards</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Sub-Second Cerebras Inference</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>Client-Side &amp; Vault Privacy</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Catalog & Search Section */}
      <section id="catalog" className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">
              Standard Agreements Catalog
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select a template to initiate live drafting with our conversational legal intake assistant.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contracts or clauses..."
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 placeholder:text-slate-400 shadow-2xs"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-xl border border-slate-200 p-6 h-64 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-4/5"></div>
              </div>
            ))}
          </div>
        ) : filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300 p-8">
            <Shield className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No matching templates found</h4>
            <p className="text-xs text-slate-500 mt-1">Try a different search term or select another category filter.</p>
          </div>
        )}

      </section>

      {/* Corporate Methodology Section */}
      <section className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Methodology</span>
            <h2 className="text-2xl font-bold text-slate-900 font-serif mt-1">
              Engineering Disciplined Legal Operations
            </h2>
            <p className="text-xs text-slate-600 mt-2">
              How JurisDraft merges standardized transactional law with autonomous AI engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2 font-serif">Curated Open Standards</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We utilize open-standard frameworks authored by veteran technology transactional attorneys under Creative Commons licenses, eliminating arbitrary clause hallucinations.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2 font-serif">Conversational Intake</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rather than filling tedious hundred-field questionnaires, our assistant conducts an articulate legal intake interview, extracting required parameters and drafting in real-time.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2 font-serif">Publication-Ready Exports</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate clean, publication-grade PDFs complete with executive signature blocks, running page numbers, and standard review disclaimer headers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A1128] text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg font-bold text-[#D4AF37]">JurisDraft</span>
            <span>•</span>
            <span>Enterprise Legal Document Automation</span>
          </div>

          <div>
            Templates curated under Creative Commons Attribution 4.0 International (CC BY 4.0).
          </div>
        </div>
      </footer>

    </div>
  );
}
