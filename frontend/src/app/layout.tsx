import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { AuthProvider } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'JurisDraft — Enterprise Legal Document Automation & Repository',
  description: 'Institutional SaaS for automated corporate legal agreements, standard contract engineering, fast conversational intake, and tamper-resistant document repositories.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 min-h-0 flex flex-col">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
