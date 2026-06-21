import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'NovaHire AI - Practice Mock Interviews & Analyze Resumes',
  description: 'An AI-powered interview platform helping students and job seekers master technical, HR, behavioral and system design sessions, track ATS resume performance, and build custom learning roadmaps.',
  keywords: 'NovaHire AI, AI Interview, Mock Interview, Resume ATS Analyzer, Skill Gap Analysis, Learning Roadmaps, Speech-to-Text, SaaS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('theme') || localStorage.getItem('landing_theme') || 'dark';
                if (saved === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen transition-colors duration-200`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
