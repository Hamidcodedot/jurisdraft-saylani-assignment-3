'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, FolderGit2, Shield, LogIn, UserPlus, LogOut, User as UserIcon, BookOpen } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { useAuth } from '@/lib/auth';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isNavActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0C1838]/95 backdrop-blur-md border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <BrandLogo size="md" theme="dark" showText={true} />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-300 ml-4">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-md transition ${
                pathname === '/' ? 'text-[#D4AF37] bg-white/10 font-bold' : 'hover:text-white hover:bg-white/5'
              }`}
            >
              Templates Catalog
            </Link>
            
            <Link
              href="/documents"
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                isNavActive('/documents') ? 'text-[#D4AF37] bg-white/10 font-bold' : 'hover:text-white hover:bg-white/5'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Corporate Vault</span>
            </Link>
          </nav>
        </div>

        {/* Right Action Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-white">{user.full_name}</span>
                <span className="text-[11px] text-slate-400 truncate max-w-[160px]">{user.email}</span>
              </div>
              
              <Link
                href="/documents"
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 hover:bg-slate-700 transition"
                title="My Vault"
              >
                <UserIcon className="w-4 h-4" />
              </Link>

              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-md transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-400" />
                <span>Sign In</span>
              </Link>
              
              <Link
                href="/signup"
                className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-[#D4AF37] hover:bg-[#c49e29] rounded-md shadow-sm transition flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Enterprise Access</span>
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
