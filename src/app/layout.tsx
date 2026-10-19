import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import { QuestionPracticeProvider } from '@/components/ContributionPopup';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GATE-openmentor | Free GATE Preparation Portal',
  description:
    'Practise previous year questions, master every topic, and challenge yourself with mock tests — all in one place.',
  icons: {
    icon: '/openmentor-logo.webp',
    shortcut: '/openmentor-logo.webp',
    apple: '/openmentor-logo.webp',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white dark:bg-black text-black dark:text-white antialiased transition-colors">
        <ThemeProvider>
          <AnalyticsTracker />
          <QuestionPracticeProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </QuestionPracticeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
