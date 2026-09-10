'use client';

import React, { useState } from 'react';
import { Download, FileDown, Copy, Check, Printer, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { LegalDisclaimer } from './LegalDisclaimer';
import { api } from '@/lib/api';

interface DocumentPreviewProps {
  documentTitle: string;
  templateName: string;
  renderedMarkdown: string;
  completionPercentage: number;
  documentId?: string;
  onSaveRequested?: () => void;
  isSaved?: boolean;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  documentTitle,
  templateName,
  renderedMarkdown,
  completionPercentage,
  documentId,
  onSaveRequested,
  isSaved = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [zoom, setZoom] = useState<number>(100);

  const handleCopy = () => {
    navigator.clipboard.writeText(renderedMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      if (documentId) {
        await api.downloadDocumentPdf(documentId, documentTitle);
      } else {
        await api.exportDirectPdf(renderedMarkdown, documentTitle);
      }
    } catch (err) {
      alert('Failed to generate PDF. Please verify backend connection.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([renderedMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // Convert raw markdown into high-end legal formatted paragraphs with inline variable highlights
  const renderFormattedLegalContent = (md: string) => {
    const lines = md.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-3" />;
      }

      // Title H1
      if (trimmed.startsWith('# ')) {
        return (
          <div key={idx} className="text-center pb-4 mb-4 border-b border-slate-300">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 font-serif uppercase">
              {trimmed.replace(/^#\s*/, '')}
            </h1>
            <div className="text-[11px] text-slate-500 font-sans mt-1 tracking-widest uppercase font-semibold">
              PRE-LEGAL STANDARD FORM • PRELIMINARY DRAFT
            </div>
          </div>
        );
      }

      // Section H3
      if (trimmed.startsWith('### ')) {
        return (
          <h3
            key={idx}
            className="text-sm font-bold text-slate-900 font-sans uppercase tracking-wider mt-5 mb-2 border-b border-slate-200 pb-1"
          >
            {trimmed.replace(/^###\s*/, '')}
          </h3>
        );
      }

      // Section H2
      if (trimmed.startsWith('## ')) {
        return (
          <h2
            key={idx}
            className="text-base font-bold text-slate-900 font-sans tracking-tight mt-6 mb-2"
          >
            {trimmed.replace(/^##\s*/, '')}
          </h2>
        );
      }

      // Divider ---
      if (trimmed === '---' || trimmed === '***') {
        return <hr key={idx} className="my-4 border-slate-200" />;
      }

      // Bullets
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const text = trimmed.replace(/^[-*]\s*/, '');
        return (
          <li key={idx} className="ml-5 list-disc text-xs text-slate-800 leading-relaxed mb-1.5">
            {formatInlineText(text)}
          </li>
        );
      }

      // Regular clause / paragraph
      return (
        <p key={idx} className="text-xs text-slate-800 leading-relaxed mb-2.5 text-justify">
          {formatInlineText(trimmed)}
        </p>
      );
    });
  };

  // Helper to style pending placeholders vs filled values
  const formatInlineText = (text: string) => {
    // Look for [— Pending: X —]
    const parts = text.split(/(\[— Pending:[^\]]+—\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[— Pending:')) {
        return (
          <span key={i} className="doc-var-pending" title="Clause parameter required">
            {part}
          </span>
        );
      }

      // Parse bold **text**
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bPart, j) => {
        if (bPart.startsWith('**') && bPart.endsWith('**')) {
          return (
            <strong key={j} className="font-semibold text-slate-950 font-sans">
              {bPart.slice(2, -2)}
            </strong>
          );
        }
        return bPart;
      });
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-100/70">
      
      {/* Action Bar */}
      <div className="px-5 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 no-print">
        
        {/* Left Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 tracking-tight">{documentTitle}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              completionPercentage >= 95
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {completionPercentage >= 95 ? 'COMPLETE (100%)' : `DRAFT (${completionPercentage}%)`}
            </span>
          </div>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 border border-slate-200 rounded-md p-0.5 bg-slate-50">
            <button
              onClick={() => setZoom((z) => Math.max(75, z - 10))}
              className="p-1 hover:bg-slate-200 text-slate-600 rounded text-xs transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-slate-600 px-1 font-mono font-medium">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(130, z + 10))}
              className="p-1 hover:bg-slate-200 text-slate-600 rounded text-xs transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Export Buttons */}
        <div className="flex items-center gap-2">
          {onSaveRequested && (
            <button
              onClick={onSaveRequested}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {isSaved ? '✓ Saved to Cloud' : 'Save to Vault'}
            </button>
          )}

          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition shadow-2xs"
            title="Copy Raw Text"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition shadow-2xs"
            title="Export as Markdown (.md)"
          >
            <FileDown className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrint}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition shadow-2xs"
            title="Print Agreement"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Compiling PDF...' : 'Download PDF'}</span>
          </button>
        </div>

      </div>

      {/* Parchment Document Canvas Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
        
        {/* Physical Paper Sheet Representation */}
        <div
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          className="w-full max-w-3xl bg-white rounded-sm border border-slate-300 shadow-paper-lg p-8 sm:p-14 legal-document transition-transform duration-150 relative"
        >
          
          {/* Top Running Header Rule */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-6 text-[10px] text-slate-400 font-sans uppercase tracking-wider">
            <span>Pre-Legal Template Standard</span>
            <span className="font-semibold text-slate-500">{templateName}</span>
          </div>

          {/* Mandatory Legal Disclaimer Banner */}
          <div className="mb-6">
            <LegalDisclaimer />
          </div>

          {/* Rendered Clauses & Content */}
          <div className="space-y-1">
            {renderFormattedLegalContent(renderedMarkdown)}
          </div>

          {/* Bottom Execution & Certification Footer */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-sans">
            <div>CONFIDENTIAL &amp; PROPRIETARY</div>
            <div>COMPILED BY PRE-LEGAL AI PLATFORM</div>
          </div>

        </div>

      </div>

    </div>
  );
};
