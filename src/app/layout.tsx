/**
 * Root Layout
 * Provides global styles and Supabase context
 */

import { Inter } from 'next/font/google';
import './globals.css';
import { SupabaseProvider } from './components/SupabaseProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Health Tracker',
  description: 'Track your Whoop recovery, sleep, and workouts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
