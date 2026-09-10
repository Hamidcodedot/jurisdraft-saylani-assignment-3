'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { saveAuthToken, saveCurrentUser } from '@/lib/auth';

import { BrandLogo } from './BrandLogo';

interface SaveDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedDocId: string) => void;
  currentTitle: string;
}

export const SaveDraftModal: React.FC<SaveDraftModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentTitle,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const res = await api.signup({
          email,
          password,
          full_name: fullName,
          company_name: companyName || undefined,
        });
        saveAuthToken(res.access_token);
        saveCurrentUser(res.user);
      } else {
        const res = await api.login(email, password);
        saveAuthToken(res.access_token);
        saveCurrentUser(res.user);
      }
      onSuccess('');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-[#0C1838] text-white">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" theme="dark" showText={false} />
            <div>
              <h3 className="font-bold text-white text-sm">Save to JurisDraft Vault</h3>
              <p className="text-[11px] text-slate-300">Secure cloud repository for your legal agreements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Freemium Value Notice */}
        <div className="px-6 pt-5 pb-3">
          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg text-xs text-blue-900 mb-4 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Document: </span>
              <span className="italic">{currentTitle}</span>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Sign in to save this contract, manage revisions, and access it anytime across devices.
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-semibold mb-4">
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-1.5 rounded-md transition ${
                mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-1.5 rounded-md transition ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Company / Organization (Optional)
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Innovations LLC"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Corporate Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <span>Connecting to Vault...</span>
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Create Vault Account & Save' : 'Sign In & Save Draft'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500">
            By signing up, you acknowledge that JurisDraft is an automated documentation drafting platform and not formal legal counsel.
          </p>
        </div>

      </div>
    </div>
  );
};
