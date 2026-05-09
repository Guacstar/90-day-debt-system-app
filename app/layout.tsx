import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Debt Reset Dashboard — 90-Day Debt Reset',
  description: 'A coaching portal for the 90-Day Debt Reset program.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50">{children}</body>
    </html>
  );
}
