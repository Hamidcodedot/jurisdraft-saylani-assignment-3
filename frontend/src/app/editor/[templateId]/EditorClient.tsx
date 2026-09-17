'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bot,
  SlidersHorizontal,
  CheckCircle,
  Save,
  Download,
  FileText,
  Share2,
  Sparkles,
  FileEdit,
  Building2,
  Scale,
  Calendar,
  Layers,
  Check,
  AlertCircle,
} from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'chat' | 'form' | 'clauses' | 'checklist'>('chat');
  const [loading, setLoading] = useState(true);
  const [documentId, setDocumentId] = useState<string | undefined>(undefined);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [saveModalOpen, setSaveModalOpen] = useState<boolean>(false);
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [presetAppliedNotice, setPresetAppliedNotice] = useState<string | null>(null);

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

  // Handle Direct Clause Text Modification
  const handleClauseContentChange = (newText: string) => {
    setRenderedContent(newText);
    setIsSaved(false);
  };

  // 1-Click Load Enterprise Standard Profile
  const handleLoadEnterprisePreset = () => {
    if (!template) return;

    let preset: Record<string, any> = { ...fieldData };

    if (template.id === 'mutual-nda') {
      preset = {
        reference_number: 'NDA-2026-DEL-04',
        effective_date: new Date().toISOString().split('T')[0],
        governing_jurisdiction: 'State of Delaware, United States',
        dispute_venue: 'Wilmington, Delaware',
        party_a_name: 'Meridian Capital Technologies Inc.',
        party_a_address: '1201 North Market Street, Suite 1800, Wilmington, DE 19801',
        party_a_signatory_name: 'Eleanor Vance',
        party_a_signatory_title: 'Chief Legal Officer & General Counsel',
        party_b_name: 'Stratosphere Analytics Group LLC',
        party_b_address: '350 Fifth Avenue, 54th Floor, New York, NY 10118',
        party_b_signatory_name: 'Dr. Arthur Sterling',
        party_b_signatory_title: 'Chief Executive Officer',
        purpose_description: 'Evaluating mutual technical integration, proprietary API licensing, and enterprise cloud data sharing architectures.',
        term_period: '2 years',
        survival_period_years: '3',
      };
    } else if (template.id === 'cloud-service-agreement') {
      preset = {
        reference_number: 'CSA-2026-ENT-901',
        effective_date: new Date().toISOString().split('T')[0],
        service_name: 'CloudMatrix High-Throughput Cluster Platform',
        subscription_tier: 'Enterprise Mission-Critical Tier',
        sla_uptime_percent: '99.95',
        support_hours: '24/7/365 Dedicated Enterprise SLA Support Desk',
        user_seats_limit: '150 Named Enterprise Seats',
        subscription_fee_amount: '$12,500.00 USD',
        billing_cycle_frequency: 'month',
        payment_due_days: '30',
        initial_term_months: '24',
        non_renewal_notice_days: '60',
        governing_jurisdiction: 'State of Delaware',
        venue_city: 'Wilmington, Delaware',
        provider_company_name: 'CloudMatrix Infrastructure Systems Inc.',
        provider_address: '350 Mission Street, 22nd Floor, San Francisco, CA 94105',
        provider_signatory_name: 'David Vance',
        provider_signatory_title: 'Senior Vice President of Global Operations',
        customer_company_name: 'OmniGlobal Logistics Corp.',
        customer_address: '1000 North Michigan Avenue, Suite 1200, Chicago, IL 60611',
        customer_signatory_name: 'Catherine Morales',
        customer_signatory_title: 'Chief Technology Officer',
      };
    } else {
      template.fields.forEach((f) => {
        if (f.default !== undefined && f.default !== null) {
          preset[f.key] = f.default;
        }
      });
    }

    setFieldData(preset);
    setIsSaved(false);

    api.renderTemplate(template.id, preset).then((r) => {
      setRenderedContent(r.rendered_content);
      setCompletionPercentage(r.completion_percentage);
    });

    setPresetAppliedNotice('Enterprise Corporate Profile Applied (100% Complete)');
    setTimeout(() => setPresetAppliedNotice(null), 3500);
  };

  // Handle Save Action
  const handleSaveClick = async () => {
    if (!user) {
      setSaveModalOpen(true);
      return;
    }

    try {
      if (documentId) {
        const updated = await api.updateDocument(documentId, {
          title: documentTitle,
          field_data: fieldData,
          rendered_content: renderedContent,
        });
        setDocumentId(updated.id);
      } else {
        const created = await api.createDocument({
          template_id: templateId,
          title: documentTitle,
          field_data: fieldData,
          rendered_content: renderedContent,
        });
        setDocumentId(created.id);
      }
      setIsSaved(true);
    } catch (e) {
      alert('Failed to save document. Please verify connection.');
    }
  };

  // Save after successful login from modal
  const handleModalSaveSuccess = async () => {
    try {
      const created = await api.createDocument({
        template_id: templateId,
        title: documentTitle,
        field_data: fieldData,
        rendered_content: renderedContent,
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
          <p className="text-xs font-semibold text-slate-600">Initializing JurisDraft Studio...</p>
        </div>
      </div>
    );
  }

  // Categorize fields logically for legal review
  const partyFields = template.fields.filter(
    (f) =>
      f.key.includes('party') ||
      f.key.includes('provider') ||
      f.key.includes('customer') ||
      f.key.includes('client') ||
      f.key.includes('consultant') ||
      f.key.includes('company')
  );

  const governanceFields = template.fields.filter(
    (f) =>
      f.key.includes('jurisdiction') ||
      f.key.includes('venue') ||
      f.key.includes('governing') ||
      f.key.includes('law')
  );

  const termFields = template.fields.filter(
    (f) =>
      f.key.includes('date') ||
      f.key.includes('term') ||
      f.key.includes('period') ||
      f.key.includes('survival') ||
      f.key.includes('notice') ||
      f.key.includes('days')
  );

  const commercialFields = template.fields.filter(
    (f) =>
      !partyFields.includes(f) &&
      !governanceFields.includes(f) &&
      !termFields.includes(f)
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden bg-slate-50">
      
      {/* Top Studio Control Bar */}
      <div className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 flex-shrink-0 z-20 shadow-2xs no-print">
        
        {/* Left Back & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition flex-shrink-0"
            title="Return to Catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="h-4 w-px bg-slate-200 flex-shrink-0"></div>

          <div className="flex items-center gap-2 min-w-0">
            <input
              id="document-title-input"
              name="documentTitle"
              type="text"
              value={documentTitle}
              onChange={(e) => {
                setDocumentTitle(e.target.value);
                setIsSaved(false);
              }}
              className="text-xs sm:text-sm font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none px-1 py-0.5 max-w-[200px] sm:max-w-xs truncate"
              placeholder="Document Title"
            />
            <span className="hidden xl:inline text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              {template.id}
            </span>
          </div>
        </div>

        {/* Center Progress & Preset Indicator */}
        <div className="flex items-center gap-3">
          {presetAppliedNotice ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-semibold text-emerald-800 animate-fadeIn">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{presetAppliedNotice}</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-28 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
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
          )}

          {/* 1-Click Load Enterprise Preset */}
          <button
            onClick={handleLoadEnterprisePreset}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition"
            title="Populate with standard corporate counterparty preset"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Load Corporate Preset</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Tab Switcher on mobile/compact */}
          <div className="flex lg:hidden bg-slate-100 p-0.5 rounded-lg text-[11px]">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-2 py-1 rounded-md ${activeTab === 'chat' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600'}`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('form')}
              className={`px-2 py-1 rounded-md ${activeTab === 'form' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600'}`}
            >
              Form
            </button>
            <button
              onClick={() => setActiveTab('clauses')}
              className={`px-2 py-1 rounded-md ${activeTab === 'clauses' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600'}`}
            >
              Clauses
            </button>
          </div>

          {/* Vault Sync Status Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold">
            {isSaved ? (
              <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Vault Synced</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Draft Session</span>
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Main Split-Screen Workspace (strictly locked, independent scrolling) */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Pane: Intelligent Legal Studio */}
        <div className="studio-left-pane no-print w-full md:w-[440px] lg:w-[480px] flex flex-col flex-shrink-0 min-h-0 bg-white border-r border-slate-200 overflow-hidden">
          
          {/* Studio Subtabs */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-2 sm:px-3 text-xs font-semibold flex-shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
                activeTab === 'chat'
                  ? 'border-slate-900 text-slate-900 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-slate-700" />
              <span>AI Assistant</span>
            </button>

            <button
              onClick={() => setActiveTab('form')}
              className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
                activeTab === 'form'
                  ? 'border-slate-900 text-slate-900 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-700" />
              <span>Form Fields</span>
            </button>

            <button
              onClick={() => setActiveTab('clauses')}
              className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
                activeTab === 'clauses'
                  ? 'border-slate-900 text-slate-900 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
              title="Direct Clause Text Editor"
            >
              <FileEdit className="w-3.5 h-3.5 text-slate-700" />
              <span>Clause Editor</span>
            </button>

            <button
              onClick={() => setActiveTab('checklist')}
              className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
                activeTab === 'checklist'
                  ? 'border-slate-900 text-slate-900 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5 text-slate-700" />
              <span>Audit</span>
            </button>
          </div>

          {/* Subtab 1: AI Legal Assistant */}
          {activeTab === 'chat' && (
            <div className="flex-1 min-h-0 overflow-hidden">
              <ChatInterface
                templateId={template.id}
                templateName={template.name}
                currentFields={fieldData}
                onFieldsUpdated={handleChatFieldUpdate}
                documentId={documentId}
              />
            </div>
          )}

          {/* Subtab 2: Categorized Form Fields */}
          {activeTab === 'form' && (
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-6">
              
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                Direct field edits automatically synchronize with the document preview and AI conversation state.
              </div>

              {/* Group 1: Counterparty & Signatories */}
              {partyFields.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Parties &amp; Signatories</span>
                  </div>
                  {partyFields.map((f) => (
                    <div key={f.key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor={f.key} className="text-[11px] font-bold text-slate-700">
                          {f.label}
                        </label>
                        {fieldData[f.key] ? (
                          <span className="text-[10px] text-emerald-700 font-semibold">✓ Filled</span>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-semibold">• Required</span>
                        )}
                      </div>
                      <input
                        id={f.key}
                        name={f.key}
                        type="text"
                        value={fieldData[f.key] || ''}
                        onChange={(e) => handleFormFieldChange(f.key, e.target.value)}
                        placeholder={f.placeholder || ''}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Group 2: Governance & Jurisdiction */}
              {governanceFields.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                    <Scale className="w-3.5 h-3.5 text-slate-600" />
                    <span>Governance &amp; Jurisdiction</span>
                  </div>
                  {governanceFields.map((f) => (
                    <div key={f.key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor={f.key} className="text-[11px] font-bold text-slate-700">
                          {f.label}
                        </label>
                        {fieldData[f.key] ? (
                          <span className="text-[10px] text-emerald-700 font-semibold">✓ Filled</span>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-semibold">• Required</span>
                        )}
                      </div>
                      <input
                        id={f.key}
                        name={f.key}
                        type="text"
                        value={fieldData[f.key] || ''}
                        onChange={(e) => handleFormFieldChange(f.key, e.target.value)}
                        placeholder={f.placeholder || ''}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Group 3: Terms & Durations */}
              {termFields.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-600" />
                    <span>Terms &amp; Durations</span>
                  </div>
                  {termFields.map((f) => (
                    <div key={f.key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor={f.key} className="text-[11px] font-bold text-slate-700">
                          {f.label}
                        </label>
                        {fieldData[f.key] ? (
                          <span className="text-[10px] text-emerald-700 font-semibold">✓ Filled</span>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-semibold">• Required</span>
                        )}
                      </div>
                      <input
                        id={f.key}
                        name={f.key}
                        type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                        value={fieldData[f.key] || ''}
                        onChange={(e) => handleFormFieldChange(f.key, e.target.value)}
                        placeholder={f.placeholder || ''}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Group 4: Commercial & Specific Clauses */}
              {commercialFields.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                    <Layers className="w-3.5 h-3.5 text-slate-600" />
                    <span>Commercial Specifics</span>
                  </div>
                  {commercialFields.map((f) => (
                    <div key={f.key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor={f.key} className="text-[11px] font-bold text-slate-700">
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
                          id={f.key}
                          name={f.key}
                          rows={3}
                          value={fieldData[f.key] || ''}
                          onChange={(e) => handleFormFieldChange(f.key, e.target.value)}
                          placeholder={f.placeholder || ''}
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white"
                        />
                      ) : (
                        <input
                          id={f.key}
                          name={f.key}
                          type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                          value={fieldData[f.key] || ''}
                          onChange={(e) => handleFormFieldChange(f.key, e.target.value)}
                          placeholder={f.placeholder || ''}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* Subtab 3: Direct Clause Text Editor */}
          {activeTab === 'clauses' && (
            <div className="flex-1 min-h-0 flex flex-col p-4 bg-slate-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <FileEdit className="w-3.5 h-3.5 text-slate-700" />
                  <span>Raw Clause Text Editor</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Live Markdown Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Edit legal provisions, add custom riders, or adjust clause wording directly. Any modifications will instantly reflect on the document canvas and PDF compiler.
              </p>
              <textarea
                value={renderedContent}
                onChange={(e) => handleClauseContentChange(e.target.value)}
                className="flex-1 min-h-0 w-full font-mono text-xs p-3.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 leading-relaxed resize-none shadow-inner"
                spellCheck={false}
              />
            </div>
          )}

          {/* Subtab 4: Contract Audit Checklist */}
          {activeTab === 'checklist' && (
            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="p-4 bg-slate-900 text-white rounded-xl shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D4AF37]">
                    Contract Health Score
                  </span>
                  <span className="font-mono font-bold text-sm text-white">
                    {completionPercentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      completionPercentage >= 95 ? 'bg-emerald-500' : 'bg-[#D4AF37]'
                    }`}
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-300 mt-2">
                  {completionPercentage >= 95
                    ? 'All critical parameters verified. Document is structurally complete for legal review.'
                    : 'Some mandatory contract parameters remain unpopulated.'}
                </p>
              </div>

              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider pt-2">
                Required Parameters Audit
              </h4>

              <div className="space-y-2">
                {template.fields.map((f) => {
                  const hasVal = fieldData[f.key] && String(fieldData[f.key]).trim() !== '';
                  return (
                    <div
                      key={f.key}
                      className={`p-3 rounded-lg border flex items-start justify-between gap-2 ${
                        hasVal ? 'bg-white border-slate-200' : 'bg-amber-50/60 border-amber-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{f.label}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-[240px]">
                          {hasVal ? String(fieldData[f.key]) : 'Missing value'}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0 ${
                          hasVal
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
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
        <div className="flex-1 min-h-0 overflow-hidden">
          <DocumentPreview
            documentTitle={documentTitle}
            templateName={template.name}
            templateId={templateId}
            renderedMarkdown={renderedContent}
            completionPercentage={completionPercentage}
            documentId={documentId}
            onSaveRequested={handleSaveClick}
            isSaved={isSaved}
            onContentChange={handleClauseContentChange}
            partyAName={
              fieldData.party_a_name ||
              fieldData.provider_company_name ||
              fieldData.licensor_entity_name ||
              fieldData.client_company_name ||
              fieldData.company_legal_name ||
              fieldData.provider_name ||
              'First Party'
            }
            partyBName={
              fieldData.party_b_name ||
              fieldData.customer_company_name ||
              fieldData.licensee_entity_name ||
              fieldData.consultant_name_or_firm ||
              fieldData.customer_name ||
              'Counterparty'
            }
            partyASignatory={
              fieldData.party_a_signatory_name ||
              fieldData.provider_signatory_name ||
              fieldData.licensor_signatory_name ||
              fieldData.client_signatory_name ||
              'Authorized Representative'
            }
            partyBSignatory={
              fieldData.party_b_signatory_name ||
              fieldData.customer_signatory_name ||
              fieldData.licensee_signatory_name ||
              fieldData.consultant_signatory_name ||
              'Authorized Representative'
            }
            partyATitle={
              fieldData.party_a_signatory_title ||
              fieldData.provider_signatory_title ||
              fieldData.licensor_signatory_title ||
              fieldData.client_signatory_title ||
              'Authorized Representative'
            }
            partyBTitle={
              fieldData.party_b_signatory_title ||
              fieldData.customer_signatory_title ||
              fieldData.licensee_signatory_title ||
              fieldData.consultant_signatory_title ||
              'Authorized Representative'
            }
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
