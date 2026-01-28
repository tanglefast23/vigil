/**
 * Supabase Admin Client
 * Uses service role key for server-side operations (full database access)
 * Only use in API routes and server actions - NEVER expose to client
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseAdminInstance: SupabaseClient | null = null;

/**
 * Get the admin Supabase client (lazy initialization)
 * This prevents build-time errors when env vars aren't available
 */
function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables for admin client');
  }

  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdminInstance;
}

/**
 * Server-side Supabase client with service role privileges
 * Lazily initialized to avoid build-time errors
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient];
  },
});

