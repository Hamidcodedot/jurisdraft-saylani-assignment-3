'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Bot, SlidersHorizontal, CheckCircle, Save, Download, FileText, Share2, Sparkles } from 'lucide-react';
import { ChatInterface } from '@/components/ChatInterface';
import { DocumentPreview } from '@/components/DocumentPreview';
import { SaveDraftModal } from '@/components/SaveDraftModal';
import { api, TemplateDetail } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function ContractEditorPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.templateId as string;
  const { user } = useAuth();

  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [fieldData, setFieldData] = useState<Record<string, any>>({});
  const [renderedContent, setRenderedContent] = useState<string>('');
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'chat' | 'form' | 'checklist'>('chat');
  const [loading, setLoading] = useState(true);
  const [documentId, setDocumentId] = useState<string | undefined>(undefined);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [saveModalOpen, setSaveModalOpen] = useState<boolean>(false);
  const [documentTitle, setDocumentTitle] = useState<string>('');

  // 1. Initial Load of Template
  useEffect(() => {
    if (!templateId) return;

    api.getTemplate(templateId)
      .then((t) => {
        setTemplate(t);
        setDocumentTitle(t.name);

        // Populate initial field defaults
        const defaults: Record<string, any> = {};
        t.fields.forEach((f) => {
          if (f.default !== undefined && f.default !== null) {
            defaults[f.key] = f.default;
          }
        });
        setFieldData(defaults);

        // Initial render
        return api.renderTemplate(templateId, defaults);
      })
      .then((res) => {
        if (res) {
          setRenderedContent(res.rendered_content);
          setCompletionPercentage(res.completion_percentage);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [templateId]);

  // Handle Updates from Chat
  const handleChatFieldUpdate = (newFields: Record<string, any>, newRendered?: string) => {
    setFieldData(newFields);
    setIsSaved(false);
    if (newRendered) {
      setRenderedContent(newRendered);
      if (template) {
        const total = template.fields.length;
        const filled = Object.values(newFields).filter((v) => v !== null && String(v).trim() !== '').length;
        setCompletionPercentage(Math.round((filled / total) * 100));
      }
    } else if (template) {
      api.renderTemplate(template.id, newFields).then((r) => {
        setRenderedContent(r.rendered_content);
        setCompletionPercentage(r.completion_percentage);
      });
    }
  };

  // Handle Manual Form Input Changes
  const handleFormFieldChange = (key: string, value: any) => {
    const updated = { ...fieldData, [key]: value };
    setFieldData(updated);
    setIsSaved(false);

    if (template) {
      api.renderTemplate(template.id, updated).then((r) => {
        setRenderedContent(r.rendered_content);
        setCompletionPercentage(r.completion_percentage);
      });
    }
  };

  // Handle Save Action
  const handleSaveClick = async () => {
    if (!user) {
      // Freemium: prompt login/signup modal
      setSaveModalOpen(true);
      return;
    }

    try {
      if (documentId) {
        const updated = await api.updateDocument(documentId, {
          title: documentTitle,
          field_data: fieldData,
        });
        setDocumentId(updated.id);
      } else {
        const created = await api.createDocument({
          template_id: templateId,
          title: documentTitle,
          field_data: fieldData,
        });
        setDocumentId(created.id);
      }
      setIsSaved(true);
    } catch (e) {
      alert('Failed to save document. Please check network connection.');
    }
  };

  // Save after successful login from modal
  const handleModalSaveSuccess = async () => {
    try {
      const created = await api.createDocument({
        template_id: templateId,
        title: documentTitle,
        field_data: fieldData,
      });
      setDocumentId(created.id);
      setIsSaved(true);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !template) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-600">Initializing Contract Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Top Studio Control Bar */}
      <div className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between gap-4 flex-shrink-0 z-10">
        
        {/* Left Back & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
            title="Back to Catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="h-4 w-px bg-slate-200"></div>

          <div className="flex items-center gap-2 min-w-0">
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => { setDocumentTitle(e.target.value); setIsSaved(false); }}
              className="text-xs sm:text-sm font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none px-1 py-0.5 max-w-[200px] sm:max-w-xs truncate"
              placeholder="Document Title"
            />
            <span className="hidden lg:inline text-[10px] text-slate-400 font-mono">
              ({template.id})
            </span>
          </div>
        </div>

        {/* Center Progress Meter */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all duration-300 ${
                completionPercentage >= 95 ? 'bg-emerald-600' : 'bg-amber-500'
              }`}
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <span className="text-[11px] font-semibold text-slate-600 font-mono">
            {completionPercentage}% Complete
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Tab Switcher on mobile/compact */}
          <div className="flex md:hidden bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-2 py-1 rounded-md ${activeTab === 'chat' ? 'bg-white font-bold text-slate-900' : 'text-slate-600'}`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('form')}
              className={`px-2 py-1 rounded-md ${activeTab === 'form' ? 'bg-white font-bold text-slate-900' : 'text-slate-600'}`}
            >
              Form
            </button>
          </div>

          <button
            onClick={handleSaveClick}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              isSaved
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Saved to Vault' : 'Save to Cloud'}</span>
          </button>
        </div>

      </div>

      {/* Main Split-Screen Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Pane: Intelligent Drafting Studio */}
        <div className="w-full md:w-[420px] lg:w-[480px] flex flex-col flex-shrink-0 bg-white border-r border-slate-200">
          
          {/* Studio Subtabs */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50/70 px-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
                activeTab === 'chat'
                  ? 'border-slate-900 text-slate-900 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Legal Assistant</span>
            </button>

            <button
              onClick={() => setActiveTab('form')}
              className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
                activeTab === 'form'
                  ? 'border-slate-900 text-slate-900 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Form Fields</span>
            </button>

            <button
              onClick={() => setActiveTab('checklist')}
              className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
                activeTab === 'checklist'
                  ? 'border-slate-900 text-slate-900 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Audit Checklist</span>
            </button>
          </div>

          {/* Tab 1: AI Chat Assistant */}
          {activeTab === 'chat' && (
            <div className="flex-1 overflow-hidden">
              <ChatInterface
                templateId={template.id}
                templateName={template.name}
                currentFields={fieldData}
                onFieldsUpdated={handleChatFieldUpdate}
                documentId={documentId}
              />
            </div>
          )}

          {/* Tab 2: Structured Form Inputs */}
          {activeTab === 'form' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-xs text-slate-500 mb-2">
                All edits made here synchronize live with the legal agreement preview and conversational context.
              </div>

              {template.fields.map((f) => (
                <div key={f.key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                      {f.label}
                    </label>
                    {fieldData[f.key] ? (
                      <span className="text-[10px] text-emerald-700 font-semibold">✓ Filled</span>
                    ) : (
                      <span className="text-[10px] text-amber-700 font-semibold">• Required</span>
                    )}
                  </div>

                  {f.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={fieldData[f.key] || ''}
                      onChange={(e) => handleFormFieldChange(f.key, e.target.value)}
                      placeholder={f.placeholder || ''}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    />
                  ) : (
                    <input
                      type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                      value={fieldData[f.key] || ''}
                      onChange={(e) => handleFormFieldChange(f.key, e.target.value)}
                      placeholder={f.placeholder || ''}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    />
                  )}

                  {f.description && (
                    <p className="text-[10px] text-slate-400">{f.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Audit Checklist */}
          {activeTab === 'checklist' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-bold text-slate-900 text-sm mb-1">Contract Health Score</div>
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-900 h-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{completionPercentage}%</span>
                </div>
              </div>

              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider pt-2">
                Clause Parameters Status
              </h4>

              <div className="space-y-2">
                {template.fields.map((f) => {
                  const hasVal = fieldData[f.key] && String(fieldData[f.key]).trim() !== '';
                  return (
                    <div
                      key={f.key}
                      className={`p-3 rounded-lg border flex items-start justify-between gap-2 ${
                        hasVal ? 'bg-white border-slate-200' : 'bg-red-50/50 border-red-200'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{f.label}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-[260px]">
                          {hasVal ? String(fieldData[f.key]) : 'Missing value'}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        hasVal ? 'bg-emerald-50 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {hasVal ? 'READY' : 'PENDING'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right Pane: Live Parchment Document Preview */}
        <div className="flex-1 overflow-hidden">
          <DocumentPreview
            documentTitle={documentTitle}
            templateName={template.name}
            renderedMarkdown={renderedContent}
            completionPercentage={completionPercentage}
            documentId={documentId}
            onSaveRequested={handleSaveClick}
            isSaved={isSaved}
          />
        </div>

      </div>

      {/* Freemium Save Draft Modal */}
      <SaveDraftModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onSuccess={handleModalSaveSuccess}
        currentTitle={documentTitle}
      />

    </div>
  );
}
