/**
 * Supabase Provider Component
 * Provides Supabase client context to the application
 * Note: With @supabase/ssr, we create clients directly in components
 * This provider is kept for future extensibility
 */

'use client';

interface SupabaseProviderProps {
  children: React.ReactNode;
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  // With @supabase/ssr, we create clients directly where needed
  // using createSupabaseBrowserClient() from @/lib/supabase/browser
  return <>{children}</>;
}
