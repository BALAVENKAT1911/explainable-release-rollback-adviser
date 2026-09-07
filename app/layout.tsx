import type {Metadata} from 'next';
import './globals.css';
import { AppProvider } from '@/components/AppContext';
import { Navigation } from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Explainable Release Rollback Adviser',
  description: 'An advisory system for regulated enterprises to quantify release risk.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="h-full m-0">
      <body suppressHydrationWarning className="h-full w-full m-0 bg-slate-50 font-sans text-slate-900 flex flex-col overflow-hidden">
        <AppProvider>
          <Navigation />
          <main className="flex-grow overflow-auto p-4">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
