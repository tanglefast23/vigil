/**
 * Whoop OAuth Initiation Route
 * Redirects user to Whoop authorization page
 */

import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { WhoopClient } from '@/lib/whoop/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json(
      { error: 'user_id is required' },
      { status: 400 }
    );
  }

  // Generate state token for CSRF protection
  // In production, store this in a session/cookie and validate on callback
  const state = Buffer.from(
    JSON.stringify({
      user_id: userId,
      nonce: randomBytes(16).toString('hex'),
    })
  ).toString('base64url');

  const authUrl = WhoopClient.getAuthUrl(state);

  return NextResponse.redirect(authUrl);
}
