import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'TaskFlow — Collaborative Task Management',
    template: '%s | TaskFlow'
  },
  description: 'Manage, assign and track tasks with your team. Real-time collaboration with Google login and email notifications.',
  keywords: ['task management', 'team collaboration', 'productivity', 'project management'],
  authors: [{ name: 'TaskFlow' }],
  creator: 'TaskFlow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: 'TaskFlow — Collaborative Task Management',
    description: 'Manage, assign and track tasks with your team.',
    siteName: 'TaskFlow',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TaskFlow',
    description: 'Collaborative task management with Google login',
    images: ['/og-image.png']
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geist.variable} h-full antialiased`}>
      <body className="min-h-full font-sans bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'dark:bg-slate-900 dark:text-white dark:border dark:border-slate-800 font-semibold text-sm rounded-xl px-4 py-3 shadow-md',
              duration: 4000,
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
