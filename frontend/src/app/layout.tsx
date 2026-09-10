import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Pre-Legal — Automated Legal Document Drafting Platform',
  description: 'Enterprise SaaS for automated pre-legal contract drafting using standardized templates, fast AI conversational guidance, and persistent vaults.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-slate-900 font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
