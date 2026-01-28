/**
 * Whoop OAuth Callback Handler
 * Exchanges authorization code for tokens and stores them securely
 */

import { NextResponse } from 'next/server';
import { WhoopClient } from '@/lib/whoop/client';
import { serializeToken } from '@/lib/crypto';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    console.error('Whoop OAuth error:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=oauth_denied', request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/dashboard?error=missing_params', request.url)
    );
  }

  try {
    // Decode state to get user_id
    const stateData = JSON.parse(
      Buffer.from(state, 'base64url').toString('utf-8')
    );
    const userId = stateData.user_id;

    if (!userId) {
      throw new Error('Invalid state: missing user_id');
    }

    // Exchange code for tokens
    const tokens = await WhoopClient.exchangeCode(code);

    // Create a temporary client to fetch user profile
    const client = new WhoopClient(tokens.access_token, tokens.refresh_token, userId);
    const whoopUser = await client.getUser();

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Upsert OAuth connection
    const { error: dbError } = await supabaseAdmin
      .from('health_oauth_connections')
      .upsert(
        {
          user_id: userId,
          provider: 'whoop',
          access_token_encrypted: serializeToken(tokens.access_token),
          refresh_token_encrypted: serializeToken(tokens.refresh_token),
          token_expires_at: expiresAt.toISOString(),
          scopes: tokens.scope.split(' '),
          whoop_user_id: String(whoopUser.user_id),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,provider',
        }
      );

    if (dbError) {
      console.error('Database error storing tokens:', dbError);
      throw new Error('Failed to store tokens');
    }

    // Initialize sync status
    await supabaseAdmin.from('health_sync_status').upsert(
      {
        user_id: userId,
        provider: 'whoop',
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,provider',
      }
    );

    // Redirect to dashboard with success
    return NextResponse.redirect(
      new URL('/dashboard?connected=whoop', request.url)
    );
  } catch (err) {
    console.error('Whoop OAuth callback error:', err);
    return NextResponse.redirect(
      new URL('/dashboard?error=oauth_failed', request.url)
    );
  }
}
