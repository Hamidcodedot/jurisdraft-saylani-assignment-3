'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { saveAuthToken, saveCurrentUser } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(email, password);
      saveAuthToken(res.access_token);
      saveCurrentUser(res.user);
      router.push('/documents');
    } catch (err: any) {
      setError(err.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-[#F8FAFC]">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-paper p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-serif text-xl font-bold mx-auto mb-3 shadow-md">
            §
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-serif tracking-tight">
            Sign In to Pre-Legal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your secure institutional contract repository
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Corporate Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="counsel@firm.com"
                className="w-full text-xs pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Vault</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          Don&apos;t have an account yet?{' '}
          <Link href="/signup" className="font-semibold text-slate-900 hover:underline">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
}
