'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Download,
  FileDown,
  Copy,
  Check,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  PenTool,
  RotateCcw,
  Sparkles,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';

import { LegalDisclaimer } from './LegalDisclaimer';
import { SignatureModal } from './SignatureModal';
import { RichTextToolbar } from './RichTextToolbar';
import { api } from '@/lib/api';

interface DocumentPreviewProps {
  documentTitle: string;
  templateName: string;
  renderedMarkdown: string;
  completionPercentage: number;
  documentId?: string;
  onSaveRequested?: () => void;
  isSaved?: boolean;
  onContentChange?: (newContent: string) => void;
  partyAName?: string;
  partyBName?: string;
  partyASignatory?: string;
  partyBSignatory?: string;
}

// Helper: Convert markdown lines into basic HTML for TipTap
function markdownToHtml(md: string): string {
  const lines = md.split('\n');
  const htmlLines: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (!trimmed) {
      if (inList) {
        htmlLines.push('</ul>');
        inList = false;
      }
      continue;
    }

    // Page Break
    if (trimmed === '<!-- pagebreak -->' || trimmed === '<!-- page-break -->' || trimmed === '<div class="pagebreak"></div>') {
      if (inList) {
        htmlLines.push('</ul>');
        inList = false;
      }
      htmlLines.push('<hr class="page-break" />');
      continue;
    }

    // Headers
    if (trimmed.startsWith('# ')) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<h1>${formatInline(trimmed.replace(/^#\s*/, ''))}</h1>`);
    } else if (trimmed.startsWith('## ')) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<h2>${formatInline(trimmed.replace(/^##\s*/, ''))}</h2>`);
    } else if (trimmed.startsWith('### ')) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<h3>${formatInline(trimmed.replace(/^###\s*/, ''))}</h3>`);
    } else if (trimmed === '---' || trimmed === '***') {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push('<hr />');
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        htmlLines.push('<ul>');
        inList = true;
      }
      htmlLines.push(`<li>${formatInline(trimmed.replace(/^[-*]\s*/, ''))}</li>`);
    } else {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<p>${formatInline(trimmed)}</p>`);
    }
  }

  if (inList) {
    htmlLines.push('</ul>');
  }

  return htmlLines.join('');
}

function formatInline(text: string): string {
  // Bold
  let out = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Pending variable highlights
  out = out.replace(/(\[— Pending:[^\]]+—\])/g, '<span class="doc-var-pending">$1</span>');
  return out;
}

// Convert HTML back to markdown
function htmlToMarkdown(html: string): string {
  let md = html;
  md = md.replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*');
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<\/ul>/gi, '\n');
  md = md.replace(/<ul[^>]*>/gi, '');
  md = md.replace(/<hr class="page-break"[^>]*\/?>/gi, '<!-- pagebreak -->\n\n');
  md = md.replace(/<hr[^>]*\/?>/gi, '---\n\n');
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<span class="doc-var-pending"[^>]*>(.*?)<\/span>/gi, '$1');
  md = md.replace(/<[^>]+>/g, ''); // strip any remaining tags
  md = md.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  return md.trim();
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  documentTitle,
  templateName,
  renderedMarkdown,
  completionPercentage,
  documentId,
  onSaveRequested,
  isSaved = false,
  onContentChange,
  partyAName = 'Party A',
  partyBName = 'Party B',
  partyASignatory = 'Authorized Signatory',
  partyBSignatory = 'Authorized Signatory',
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [zoom, setZoom] = useState<number>(100);
  const [isEditingLive, setIsEditingLive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // E-Signature State
  const [partyASignature, setPartyASignature] = useState<string | null>(null);
  const [partyBSignature, setPartyBSignature] = useState<string | null>(null);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [activeSigningParty, setActiveSigningParty] = useState<'Party A' | 'Party B'>('Party A');

  // TipTap Editor Initialization
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
    ],
    content: markdownToHtml(renderedMarkdown),
    immediatelyRender: false,
    editable: isEditingLive,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const updatedMd = htmlToMarkdown(html);
      if (onContentChange) {
        onContentChange(updatedMd);
      }
    },
  });

  // Keep TipTap in sync if renderedMarkdown changes externally from AI Assistant / Form
  useEffect(() => {
    if (editor && !isEditingLive) {
      const currentHtml = editor.getHTML();
      const newHtml = markdownToHtml(renderedMarkdown);
      if (currentHtml !== newHtml) {
        editor.commands.setContent(newHtml);
      }
    }
  }, [renderedMarkdown, editor, isEditingLive]);

  // Update editor editable property when toggling mode
  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditingLive);
    }
  }, [isEditingLive, editor]);

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Copy raw text handler
  const handleCopy = () => {
    navigator.clipboard.writeText(renderedMarkdown);
    setCopied(true);
    showToast('Contract text copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // Download PDF handler
  const handleDownloadPdf = async () => {
    setDownloading(true);
    showToast('Compiling publication-ready PDF...');
    try {
      if (documentId && !partyASignature && !partyBSignature) {
        await api.downloadDocumentPdf(documentId, documentTitle);
      } else {
        await api.exportDirectPdf(renderedMarkdown, documentTitle, {
          partyA: partyASignature,
          partyB: partyBSignature,
        });
      }
      showToast('✓ PDF download complete');
    } catch (err) {
      alert('Failed to generate PDF. Please verify backend connection.');
    } finally {
      setDownloading(false);
    }
  };

  // Download Markdown handler
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
    showToast('Exported Markdown file');
  };

  // Print handler: Triggers browser print with isolated #printable-document-container
  const handlePrint = () => {
    window.print();
  };

  // Insert Page Break in Live Editor
  const handleInsertPageBreak = () => {
    if (editor && isEditingLive) {
      editor.chain().focus().setHorizontalRule().run();
      const updatedMd = renderedMarkdown + '\n\n<!-- pagebreak -->\n\n';
      if (onContentChange) {
        onContentChange(updatedMd);
      }
      showToast('Inserted Physical Page Break');
    }
  };

  // Intelligent Pagination Engine: Divides text into discrete physical sheets
  const documentPages = useMemo(() => {
    // Check if explicit page breaks exist
    if (renderedMarkdown.includes('<!-- pagebreak -->') || renderedMarkdown.includes('<!-- page-break -->')) {
      const rawPages = renderedMarkdown.split(/<!--\s*page-?break\s*-->/g);
      return rawPages.filter((p) => p.trim().length > 0);
    }

    // Auto-split into logical legal pages
    const lines = renderedMarkdown.split('\n');
    const pages: string[] = [];
    let currentPageLines: string[] = [];
    let currentLength = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const isMajorHeading =
        trimmed.startsWith('### ') ||
        trimmed.startsWith('## ') ||
        trimmed.startsWith('IN WITNESS WHEREOF') ||
        trimmed.startsWith('**IN WITNESS WHEREOF');
      
      // If we have accumulated ~1500 chars and hit a major section boundary, start a new page
      if (currentLength > 1500 && isMajorHeading && currentPageLines.length > 10) {
        pages.push(currentPageLines.join('\n'));
        currentPageLines = [line];
        currentLength = line.length;
      } else {
        currentPageLines.push(line);
        currentLength += line.length + 1;
      }
    }

    if (currentPageLines.length > 0) {
      pages.push(currentPageLines.join('\n'));
    }

    return pages.length > 0 ? pages : [renderedMarkdown];
  }, [renderedMarkdown]);

  // Formatted Paragraph renderer for Standard View Mode
  const renderFormattedLines = (text: string, isFirstPage: boolean) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-3" />;

      if (trimmed.startsWith('# ')) {
        return (
          <div key={idx} className="text-center pb-3 mb-4 border-b border-slate-300">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 font-serif uppercase">
              {trimmed.replace(/^#\s*/, '')}
            </h1>
            <div className="text-[10px] text-slate-500 font-sans mt-1 tracking-widest uppercase font-semibold">
              JURISDRAFT ENTERPRISE REPOSITORY • STANDARD FORM
            </div>
          </div>
        );
      }

      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-xs font-bold text-slate-900 font-sans uppercase tracking-wider mt-4 mb-2 border-b border-slate-200 pb-1">
            {trimmed.replace(/^###\s*/, '')}
          </h3>
        );
      }

      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-sm font-bold text-slate-900 font-sans tracking-tight mt-5 mb-2">
            {trimmed.replace(/^##\s*/, '')}
          </h2>
        );
      }

      if (trimmed === '---' || trimmed === '***') {
        return <hr key={idx} className="my-3 border-slate-200" />;
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={idx} className="ml-5 list-disc text-xs text-slate-800 leading-relaxed mb-1">
            {renderInlineSpans(trimmed.replace(/^[-*]\s*/, ''))}
          </li>
        );
      }

      return (
        <p key={idx} className="text-xs text-slate-800 leading-relaxed mb-2 text-justify">
          {renderInlineSpans(trimmed)}
        </p>
      );
    });
  };

  const renderInlineSpans = (str: string) => {
    const parts = str.split(/(\[— Pending:[^\]]+—\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[— Pending:')) {
        return (
          <span key={i} className="doc-var-pending" title="Parameter Required">
            {part}
          </span>
        );
      }
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((b, j) => {
        if (b.startsWith('**') && b.endsWith('**')) {
          return (
            <strong key={j} className="font-semibold text-slate-950 font-sans">
              {b.slice(2, -2)}
            </strong>
          );
        }
        return b;
      });
    });
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#E8ECEF]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-150 toast-notification">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Action Bar */}
      <div className="px-5 py-2.5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 no-print flex-shrink-0 z-20">
        
        {/* Left Status & Pagination Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 tracking-tight">{documentTitle}</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                completionPercentage >= 95
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {completionPercentage >= 95 ? 'COMPLETE (100%)' : `DRAFT (${completionPercentage}%)`}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-slate-200" />

          {/* Page Count Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200 text-[11px] font-mono font-medium text-slate-600">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>{documentPages.length} {documentPages.length === 1 ? 'Page' : 'Pages'}</span>
          </div>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 border border-slate-200 rounded-md p-0.5 bg-slate-50">
            <button
              onClick={() => setZoom((z) => Math.max(70, z - 10))}
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
            <button
              onClick={() => setZoom(100)}
              className="p-1 hover:bg-slate-200 text-slate-500 rounded text-[10px] transition"
              title="Reset Zoom to 100%"
            >
              100%
            </button>
          </div>
        </div>

        {/* Right Action & Export Buttons */}
        <div className="flex items-center gap-2">
          
          {/* Primary Save to Vault Action */}
          {onSaveRequested && (
            <button
              onClick={() => {
                onSaveRequested();
                showToast('Saving draft to corporate vault...');
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md border transition shadow-2xs ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-900 hover:bg-slate-800 text-white border-transparent'
              }`}
            >
              {isSaved ? '✓ Saved in Vault' : 'Save to Vault'}
            </button>
          )}

          <div className="h-4 w-[1px] bg-slate-200" />

          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition shadow-2xs"
            title="Copy Document Text"
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
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition shadow-2xs flex items-center gap-1"
            title="Print Clean Legal Pages"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="px-3.5 py-1.5 bg-[#0C1838] hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{downloading ? 'Compiling PDF...' : 'Download PDF'}</span>
          </button>
        </div>

      </div>

      {/* TipTap Rich Text Formatting Ribbon */}
      <RichTextToolbar
        editor={editor}
        isEditingEnabled={isEditingLive}
        onToggleEditMode={() => {
          setIsEditingLive(!isEditingLive);
          showToast(!isEditingLive ? 'In-Place Live Editing Enabled' : 'View Mode Active');
        }}
        onInsertPageBreak={handleInsertPageBreak}
        onResetContent={() => {
          if (confirm('Reset document to standard template defaults? Any manual text additions will be reverted.')) {
            if (editor) {
              editor.commands.setContent(markdownToHtml(renderedMarkdown));
            }
            showToast('Document reset to template');
          }
        }}
      />

      {/* Physical Document Canvas Viewport */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-10 flex flex-col items-center document-viewport">
        
        {/* Container for Printable Sheets */}
        <div id="printable-document-container" className="w-full flex flex-col items-center">
          
          {/* Render each physical page */}
          {documentPages.map((pageText, pageIndex) => {
            const isLastPage = pageIndex === documentPages.length - 1;

            return (
              <div
                key={pageIndex}
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                className="document-page-sheet w-full max-w-[816px] min-h-[1056px] bg-white rounded-xs shadow-[0_6px_25px_rgba(0,0,0,0.08)] border border-slate-300/80 p-10 sm:p-16 flex flex-col justify-between mb-8 relative legal-document transition-transform duration-150"
              >
                {/* Top Running Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-6 text-[10px] text-slate-400 font-sans uppercase tracking-wider select-none">
                  <span>JurisDraft Institutional Standard</span>
                  <span className="font-semibold text-slate-600">{templateName}</span>
                </div>

                {/* Page Content Body */}
                <div className="flex-1 space-y-1">
                  
                  {/* Page 1 Mandatory Legal Disclaimer Banner */}
                  {pageIndex === 0 && (
                    <div className="mb-6">
                      <LegalDisclaimer />
                    </div>
                  )}

                  {/* Mode A: In-Place Live Rich Text Editor (Active on Page 1 or undivided) */}
                  {isEditingLive && pageIndex === 0 ? (
                    <div className="tiptap prose max-w-none text-slate-900">
                      <EditorContent editor={editor} />
                    </div>
                  ) : (
                    /* Mode B: Formatted Institutional Typography */
                    <div>
                      {renderFormattedLines(pageText, pageIndex === 0)}
                    </div>
                  )}

                  {/* On the Last Page: Render Digital Execution Block with Signatures */}
                  {isLastPage && (
                    <div className="mt-10 pt-6 border-t border-slate-300 select-none">
                      <div className="text-center font-bold font-sans text-xs tracking-wider uppercase text-slate-800 mb-6">
                        IN WITNESS WHEREOF, the Parties have executed this Agreement
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        
                        {/* PARTY A SIGNATURE BOX */}
                        <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-lg flex flex-col justify-between min-h-[140px]">
                          <div>
                            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                              {partyAName}
                            </div>
                            <div className="text-[10px] text-slate-500 mb-3">Disclosing Party / Provider</div>
                          </div>

                          <div>
                            {partyASignature ? (
                              <div className="border-b border-slate-400 pb-1 mb-1">
                                <img
                                  src={partyASignature}
                                  alt="Party A Signature"
                                  className="h-10 object-contain filter contrast-125"
                                />
                                <div className="text-[9px] text-emerald-700 font-sans flex items-center justify-between mt-1">
                                  <span>✓ Digitally Verified Signature</span>
                                  <button
                                    type="button"
                                    onClick={() => setPartyASignature(null)}
                                    className="text-slate-400 hover:text-red-600 underline no-print"
                                  >
                                    Clear
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="mb-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveSigningParty('Party A');
                                    setSignatureModalOpen(true);
                                  }}
                                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded text-slate-600 hover:text-slate-900 text-xs bg-white transition no-print"
                                >
                                  <PenTool className="w-3.5 h-3.5 text-[#D4AF37]" />
                                  <span>Sign as {partyAName}</span>
                                </button>
                                <div className="h-6 border-b border-slate-300 hidden print:block" />
                              </div>
                            )}

                            <div className="text-[11px] text-slate-600 space-y-0.5">
                              <div><span className="font-semibold">By:</span> {partyASignatory}</div>
                              <div><span className="font-semibold">Date:</span> {new Date().toISOString().split('T')[0]}</div>
                            </div>
                          </div>
                        </div>

                        {/* PARTY B SIGNATURE BOX */}
                        <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-lg flex flex-col justify-between min-h-[140px]">
                          <div>
                            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                              {partyBName}
                            </div>
                            <div className="text-[10px] text-slate-500 mb-3">Receiving Party / Counterparty</div>
                          </div>

                          <div>
                            {partyBSignature ? (
                              <div className="border-b border-slate-400 pb-1 mb-1">
                                <img
                                  src={partyBSignature}
                                  alt="Party B Signature"
                                  className="h-10 object-contain filter contrast-125"
                                />
                                <div className="text-[9px] text-emerald-700 font-sans flex items-center justify-between mt-1">
                                  <span>✓ Digitally Verified Signature</span>
                                  <button
                                    type="button"
                                    onClick={() => setPartyBSignature(null)}
                                    className="text-slate-400 hover:text-red-600 underline no-print"
                                  >
                                    Clear
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="mb-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveSigningParty('Party B');
                                    setSignatureModalOpen(true);
                                  }}
                                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded text-slate-600 hover:text-slate-900 text-xs bg-white transition no-print"
                                >
                                  <PenTool className="w-3.5 h-3.5 text-[#D4AF37]" />
                                  <span>Sign as {partyBName}</span>
                                </button>
                                <div className="h-6 border-b border-slate-300 hidden print:block" />
                              </div>
                            )}

                            <div className="text-[11px] text-slate-600 space-y-0.5">
                              <div><span className="font-semibold">By:</span> {partyBSignatory}</div>
                              <div><span className="font-semibold">Date:</span> {new Date().toISOString().split('T')[0]}</div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                </div>

                {/* Bottom Running Footer on Each Page */}
                <div className="mt-12 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-sans select-none">
                  <div>CONFIDENTIAL &amp; PROPRIETARY</div>
                  <div className="font-mono font-bold text-slate-600">
                    PAGE {pageIndex + 1} OF {documentPages.length}
                  </div>
                  <div>COMPILED BY JURISDRAFT ENTERPRISE</div>
                </div>

              </div>
            );
          })}

        </div>

      </div>

      {/* Signature Studio Modal */}
      <SignatureModal
        isOpen={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        partyLabel={activeSigningParty === 'Party A' ? partyAName : partyBName}
        defaultSignatoryName={activeSigningParty === 'Party A' ? partyASignatory : partyBSignatory}
        onApplySignature={(dataUrl) => {
          if (activeSigningParty === 'Party A') {
            setPartyASignature(dataUrl);
            showToast(`Signature applied for ${partyAName}`);
          } else {
            setPartyBSignature(dataUrl);
            showToast(`Signature applied for ${partyBName}`);
          }
        }}
      />

    </div>
  );
};
