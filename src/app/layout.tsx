/**
 * Root Layout
 * Provides global styles, fonts, and Supabase context
 */

import { Inter, DM_Mono, Plus_Jakarta_Sans, Instrument_Serif } from 'next/font/google';
import './globals.css';
import { SupabaseProvider } from './components/SupabaseProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-mono',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
});

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-instrument-serif',
});

export const metadata = {
  title: 'Vigil',
  description: 'Careful monitoring of your recovery, sleep, and workouts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/lucide-static@latest/font/lucide.min.css"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} ${dmMono.variable} ${plusJakarta.variable} ${instrumentSerif.variable} font-body h-full`}
      >
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
