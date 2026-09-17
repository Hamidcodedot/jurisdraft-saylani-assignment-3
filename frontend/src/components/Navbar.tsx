'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FolderGit2, 
  LogIn, 
  UserPlus, 
  LogOut, 
  FileText, 
  Menu, 
  X, 
  ShieldCheck,
  Building,
  CheckCircle2
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { useAuth } from '@/lib/auth';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Automatically close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isNavActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  // Generate 2-letter uppercase initials from full name or email
  const getUserInitials = (name?: string, email?: string): string => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'JD';
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0C1838]/95 backdrop-blur-md border-b border-slate-800/80 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Crest & Title */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-md">
            <BrandLogo size="md" theme="dark" showText={true} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-300 ml-4">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-md transition duration-150 flex items-center gap-1.5 ${
                isNavActive('/') 
                  ? 'text-[#D4AF37] bg-white/10 font-bold border border-[#D4AF37]/40 shadow-xs' 
                  : 'hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className={`w-3.5 h-3.5 ${isNavActive('/') ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
              <span>Templates Catalog</span>
            </Link>
            
            <Link
              href="/documents"
              className={`px-3 py-1.5 rounded-md transition duration-150 flex items-center gap-1.5 ${
                isNavActive('/documents') 
                  ? 'text-[#D4AF37] bg-white/10 font-bold border border-[#D4AF37]/40 shadow-xs' 
                  : 'hover:text-white hover:bg-white/5'
              }`}
            >
              <FolderGit2 className={`w-3.5 h-3.5 ${isNavActive('/documents') ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
              <span>Corporate Vault</span>
            </Link>
          </nav>
        </div>

        {/* Right Action Section (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700/80 py-1.5 px-3.5 rounded-lg shadow-inner">
              {/* User Avatar Initials with Gold Ring */}
              <div 
                className="w-8 h-8 rounded-full bg-[#0C1838] border border-[#D4AF37] ring-1 ring-[#D4AF37]/40 flex items-center justify-center text-xs font-bold text-[#D4AF37] tracking-wider shadow-xs"
                title={user.full_name || user.email}
              >
                {getUserInitials(user.full_name, user.email)}
              </div>

              {/* User Details */}
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white leading-tight truncate max-w-[150px]">
                    {user.full_name || 'Legal Counsel'}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-[#D4AF37] border border-[#D4AF37]/40 uppercase tracking-widest">
                    Enterprise
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 truncate max-w-[170px]">
                  {user.company_name ? user.company_name : user.email}
                </span>
              </div>

              <div className="h-5 w-px bg-slate-700/70 mx-1" />

              {/* Vault Action */}
              <Link
                href="/documents"
                className={`p-1.5 rounded-md transition flex items-center gap-1.5 text-xs font-medium ${
                  isNavActive('/documents')
                    ? 'text-[#D4AF37] bg-white/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
                title="Open Corporate Vault"
              >
                <FolderGit2 className="w-4 h-4" />
                <span className="text-[11px] font-sans">Vault</span>
              </Link>

              {/* Sign Out Action */}
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-md transition duration-150 flex items-center gap-1"
                title="Sign Out of Session"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[11px] font-sans">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition duration-150 flex items-center gap-1.5 border border-transparent hover:border-slate-700"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-400" />
                <span>Sign In</span>
              </Link>
              
              <Link
                href="/signup"
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#D4AF37] hover:bg-[#c49e29] rounded-lg shadow-sm transition duration-150 flex items-center gap-1.5 active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Enterprise Access</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button (44x44px Touch Target) */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-w-[44px] min-h-[44px] p-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] flex items-center justify-center transition"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Dropdown (< 768px) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0C1838] px-4 py-4 space-y-3 animate-fadeIn">
          {user ? (
            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0C1838] border border-[#D4AF37] flex items-center justify-center text-xs font-bold text-[#D4AF37]">
                  {getUserInitials(user.full_name, user.email)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{user.full_name || 'Legal Counsel'}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-[#D4AF37] border border-[#D4AF37]/40 uppercase tracking-widest">
                      Enterprise
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{user.email}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="min-w-[44px] min-h-[44px] p-2.5 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-md flex items-center justify-center"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1 pb-2">
              <Link
                href="/login"
                className="min-h-[44px] px-3 py-2 text-xs font-semibold text-center text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup"
                className="min-h-[44px] px-3 py-2 text-xs font-bold text-center text-slate-950 bg-[#D4AF37] hover:bg-[#c49e29] rounded-lg flex items-center justify-center gap-1.5 shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </Link>
            </div>
          )}

          <nav className="flex flex-col space-y-1 pt-1 border-t border-slate-800/80 text-xs uppercase tracking-wider font-semibold">
            <Link
              href="/"
              className={`min-h-[44px] px-3 py-2.5 rounded-lg flex items-center gap-2.5 ${
                isNavActive('/') ? 'text-[#D4AF37] bg-white/10 font-bold border border-[#D4AF37]/30' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Templates Catalog</span>
            </Link>

            <Link
              href="/documents"
              className={`min-h-[44px] px-3 py-2.5 rounded-lg flex items-center gap-2.5 ${
                isNavActive('/documents') ? 'text-[#D4AF37] bg-white/10 font-bold border border-[#D4AF37]/30' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <FolderGit2 className="w-4 h-4 text-slate-400" />
              <span>Corporate Vault</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
