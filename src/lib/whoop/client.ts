/**
 * Whoop API Client
 * Handles OAuth flow, token refresh, and data fetching
 */

import { serializeToken, deserializeToken } from '@/lib/crypto';
import { supabaseAdmin } from '@/lib/supabase/client';
import type {
  WhoopTokenResponse,
  WhoopUser,
  WhoopCycle,
  WhoopSleep,
  WhoopRecovery,
  WhoopWorkout,
} from '@/types/health';

const WHOOP_API_BASE = process.env.WHOOP_API_BASE || 'https://api.prod.whoop.com/developer';
const WHOOP_AUTH_URL = 'https://api.prod.whoop.com/oauth/oauth2/auth';
const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';

interface PaginatedResponse<T> {
  records: T[];
  next_token: string | null;
}

export class WhoopClient {
  private accessToken: string;
  private refreshToken: string;
  private userId: string;

  constructor(accessToken: string, refreshToken: string, userId: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.userId = userId;
  }

  /**
   * Generate the OAuth authorization URL
   */
  static getAuthUrl(state: string): string {
    const clientId = process.env.WHOOP_CLIENT_ID;
    const redirectUri = process.env.WHOOP_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      throw new Error('Missing WHOOP_CLIENT_ID or WHOOP_REDIRECT_URI');
    }

    const scopes = [
      'read:profile',
      'read:recovery',
      'read:cycles',
      'read:sleep',
      'read:workout',
      'read:body_measurement',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      state,
    });

    return `${WHOOP_AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  static async exchangeCode(code: string): Promise<WhoopTokenResponse> {
    const clientId = process.env.WHOOP_CLIENT_ID;
    const clientSecret = process.env.WHOOP_CLIENT_SECRET;
    const redirectUri = process.env.WHOOP_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing Whoop OAuth configuration');
    }

    const response = await fetch(WHOOP_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    return response.json();
  }

  /**
   * Refresh an expired access token
   */
  async refreshAccessToken(): Promise<void> {
    const clientId = process.env.WHOOP_CLIENT_ID;
    const clientSecret = process.env.WHOOP_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Missing Whoop OAuth configuration');
    }

    const response = await fetch(WHOOP_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${error}`);
    }

    const tokens: WhoopTokenResponse = await response.json();

    // Update stored tokens
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;

    // Persist new tokens to database
    await supabaseAdmin
      .from('health_oauth_connections')
      .update({
        access_token_encrypted: serializeToken(tokens.access_token),
        refresh_token_encrypted: serializeToken(tokens.refresh_token),
        token_expires_at: new Date(
          Date.now() + tokens.expires_in * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', this.userId)
      .eq('provider', 'whoop');
  }

  /**
   * Make an authenticated API request with automatic token refresh
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const makeRequest = async (): Promise<Response> => {
      return fetch(`${WHOOP_API_BASE}${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    };

    let response = await makeRequest();

    // If unauthorized, try refreshing the token once
    if (response.status === 401) {
      await this.refreshAccessToken();
      response = await makeRequest();
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Whoop API error (${response.status}): ${error}`);
    }

    return response.json();
  }

  /**
   * Get the authenticated user's profile
   */
  async getUser(): Promise<WhoopUser> {
    return this.request<WhoopUser>('/v1/user/profile/basic');
  }

  /**
   * Get physiological cycles (strain data)
   */
  async getCycles(
    startDate?: string,
    endDate?: string,
    nextToken?: string
  ): Promise<PaginatedResponse<WhoopCycle>> {
    const params = new URLSearchParams();
    if (startDate) params.set('start', startDate);
    if (endDate) params.set('end', endDate);
    if (nextToken) params.set('nextToken', nextToken);

    const query = params.toString();
    return this.request<PaginatedResponse<WhoopCycle>>(
      `/v1/cycle${query ? `?${query}` : ''}`
    );
  }

  /**
   * Get sleep data
   */
  async getSleep(
    startDate?: string,
    endDate?: string,
    nextToken?: string
  ): Promise<PaginatedResponse<WhoopSleep>> {
    const params = new URLSearchParams();
    if (startDate) params.set('start', startDate);
    if (endDate) params.set('end', endDate);
    if (nextToken) params.set('nextToken', nextToken);

    const query = params.toString();
    return this.request<PaginatedResponse<WhoopSleep>>(
      `/v1/activity/sleep${query ? `?${query}` : ''}`
    );
  }

  /**
   * Get recovery data
   */
  async getRecovery(
    startDate?: string,
    endDate?: string,
    nextToken?: string
  ): Promise<PaginatedResponse<WhoopRecovery>> {
    const params = new URLSearchParams();
    if (startDate) params.set('start', startDate);
    if (endDate) params.set('end', endDate);
    if (nextToken) params.set('nextToken', nextToken);

    const query = params.toString();
    return this.request<PaginatedResponse<WhoopRecovery>>(
      `/v1/recovery${query ? `?${query}` : ''}`
    );
  }

  /**
   * Get workout data
   */
  async getWorkouts(
    startDate?: string,
    endDate?: string,
    nextToken?: string
  ): Promise<PaginatedResponse<WhoopWorkout>> {
    const params = new URLSearchParams();
    if (startDate) params.set('start', startDate);
    if (endDate) params.set('end', endDate);
    if (nextToken) params.set('nextToken', nextToken);

    const query = params.toString();
    return this.request<PaginatedResponse<WhoopWorkout>>(
      `/v1/activity/workout${query ? `?${query}` : ''}`
    );
  }

  /**
   * Fetch all pages of a paginated endpoint
   */
  async fetchAllPages<T>(
    fetcher: (nextToken?: string) => Promise<PaginatedResponse<T>>,
    maxPages = 10
  ): Promise<T[]> {
    const allRecords: T[] = [];
    let nextToken: string | null = null;
    let pageCount = 0;

    do {
      const response = await fetcher(nextToken ?? undefined);
      allRecords.push(...response.records);
      nextToken = response.next_token;
      pageCount++;
    } while (nextToken && pageCount < maxPages);

    return allRecords;
  }
}

/**
 * Create a WhoopClient from stored credentials
 */
export async function getWhoopClientForUser(
  userId: string
): Promise<WhoopClient | null> {
  const { data: connection, error } = await supabaseAdmin
    .from('health_oauth_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'whoop')
    .single();

  if (error || !connection) {
    return null;
  }

  const accessToken = deserializeToken(connection.access_token_encrypted);
  const refreshToken = connection.refresh_token_encrypted
    ? deserializeToken(connection.refresh_token_encrypted)
    : '';

  return new WhoopClient(accessToken, refreshToken, userId);
}
