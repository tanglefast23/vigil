/**
 * Dashboard Layout
 * Shared layout for all dashboard routes
 * Fetches user data server-side and wraps children with responsive layout
 */

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0];
  const userEmail = user.email;

  return (
    <DashboardLayout userName={userName} userEmail={userEmail}>
      {children}
    </DashboardLayout>
  );
}
