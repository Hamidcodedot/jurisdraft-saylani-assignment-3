'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, FolderGit2, Shield, LogIn, UserPlus, LogOut, User as UserIcon, BookOpen } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isNavActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-serif text-lg font-bold shadow-md group-hover:bg-slate-800 transition">
              §
            </div>
            <div>
              <div className="font-bold text-slate-900 tracking-tight text-base leading-none">
                Pre-Legal
              </div>
              <div className="text-[10px] text-slate-500 font-medium tracking-wide uppercase mt-0.5">
                Contract Drafter &amp; Vault
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600 ml-4">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-md transition ${
                pathname === '/' ? 'text-slate-900 bg-slate-100 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Templates Catalog
            </Link>
            
            <Link
              href="/documents"
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                isNavActive('/documents') ? 'text-slate-900 bg-slate-100 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FolderGit2 className="w-4 h-4 text-slate-500" />
              <span>My Documents</span>
            </Link>
          </nav>
        </div>

        {/* Right Action Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900">{user.full_name}</span>
                <span className="text-[11px] text-slate-500 truncate max-w-[160px]">{user.email}</span>
              </div>
              
              <Link
                href="/documents"
                className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition"
                title="My Vault"
              >
                <UserIcon className="w-4 h-4" />
              </Link>

              <button
                onClick={logout}
                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              
              <Link
                href="/signup"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-sm transition flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
