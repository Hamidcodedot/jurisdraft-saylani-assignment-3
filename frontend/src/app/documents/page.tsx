'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Download, Trash2, Edit3, Calendar, ShieldCheck, ArrowRight, FolderOpen } from 'lucide-react';
import { api, DocumentItem } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function MyDocumentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      // User is not signed in
      setLoading(false);
      return;
    }

    if (user) {
      api.getMyDocuments()
        .then((docs) => setDocuments(docs))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you wish to delete this document from your vault?')) return;
    setDeletingId(docId);
    try {
      await api.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (e) {
      alert('Failed to delete document.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (doc: DocumentItem) => {
    try {
      await api.downloadDocumentPdf(doc.id, doc.title);
    } catch (e) {
      alert('Download failed.');
    }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is guest/unauthenticated
  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-slate-700">
          <FolderOpen className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 font-serif mb-2">
          Your Document Vault
        </h2>
        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          Sign in or create an account to access previously saved contracts, track versions, and manage executable agreements in one secure institutional vault.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 bg-white border border-slate-300 text-xs font-semibold text-slate-800 rounded-lg hover:bg-slate-50 transition shadow-2xs"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-slate-900 text-xs font-semibold text-white rounded-lg hover:bg-slate-800 transition shadow-sm"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            Cloud Vault
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-serif mt-0.5">
            My Legal Documents
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional contracts drafted and saved by {user.full_name}.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Draft New Contract</span>
        </Link>
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-white rounded-lg border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : documents.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Document Title &amp; Template</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Completeness</th>
                <th className="px-6 py-3.5">Last Updated</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 text-sm font-serif">
                      {doc.title}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Template: {doc.template_id} • ID: {doc.id}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      doc.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {doc.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 max-w-[120px]">
                      <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-slate-900 h-full"
                          style={{ width: `${doc.completion_percentage}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-[11px] text-slate-700">{doc.completion_percentage}%</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-500 text-[11px]">
                    {new Date(doc.updated_at || doc.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>

                  <td className="px-6 py-4 text-right space-x-1.5">
                    <Link
                      href={`/editor/${doc.template_id}`}
                      className="inline-flex p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition"
                      title="Edit in Studio"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDownload(doc)}
                      className="inline-flex p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deletingId === doc.id}
                      className="inline-flex p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300 p-8">
          <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 font-serif">No saved contracts yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Your vault is currently empty. Browse our template catalog to initiate your first contract draft.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition"
          >
            Explore Templates
          </Link>
        </div>
      )}

    </div>
  );
}
