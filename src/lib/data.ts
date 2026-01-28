/**
 * Data fetching utilities for the health dashboard
 * Uses React cache for request deduplication
 */

import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export const getRecentWorkouts = cache(async (userId: string, limit = 10) => {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from('health_workouts')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);
  return data || [];
});

export const getRecoveryData = cache(async (userId: string, days = 30) => {
  const supabase = getSupabaseClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data } = await supabase
    .from('health_recovery')
    .select('*')
    .eq('user_id', userId)
    .gte('recorded_at', startDate.toISOString())
    .order('recorded_at', { ascending: true });
  return data || [];
});

export const getSleepData = cache(async (userId: string, days = 30) => {
  const supabase = getSupabaseClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data } = await supabase
    .from('health_sleep')
    .select('*')
    .eq('user_id', userId)
    .gte('started_at', startDate.toISOString())
    .order('started_at', { ascending: true });
  return data || [];
});

export const getSyncStatus = cache(async (userId: string) => {
  const supabase = getSupabaseClient();

  const { data: syncStatus } = await supabase
    .from('health_sync_status')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'whoop')
    .single();

  const { data: connection } = await supabase
    .from('health_oauth_connections')
    .select('updated_at, whoop_user_id')
    .eq('user_id', userId)
    .eq('provider', 'whoop')
    .single();

  return { syncStatus, connection };
});

export const getLatestRecovery = cache(async (userId: string) => {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from('health_recovery')
    .select('*')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();
  return data;
});

export const getLatestSleep = cache(async (userId: string) => {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from('health_sleep')
    .select('*')
    .eq('user_id', userId)
    .order('ended_at', { ascending: false })
    .limit(1)
    .single();
  return data;
});

export const getWeeklyStats = cache(async (userId: string) => {
  const supabase = getSupabaseClient();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [workoutsRes, recoveryRes, sleepRes] = await Promise.all([
    supabase
      .from('health_workouts')
      .select('strain_score, calories_burned')
      .eq('user_id', userId)
      .gte('started_at', weekAgo.toISOString()),
    supabase
      .from('health_recovery')
      .select('recovery_score, hrv_rmssd')
      .eq('user_id', userId)
      .gte('recorded_at', weekAgo.toISOString()),
    supabase
      .from('health_sleep')
      .select('sleep_score, total_sleep_minutes')
      .eq('user_id', userId)
      .gte('started_at', weekAgo.toISOString()),
  ]);

  const workouts = workoutsRes.data || [];
  const recoveries = recoveryRes.data || [];
  const sleeps = sleepRes.data || [];

  return {
    workoutCount: workouts.length,
    totalStrain: workouts.reduce((sum, w) => sum + (w.strain_score || 0), 0),
    totalCalories: workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0),
    avgRecovery:
      recoveries.length > 0
        ? Math.round(
            recoveries.reduce((sum, r) => sum + (r.recovery_score || 0), 0) /
              recoveries.length
          )
        : null,
    avgHrv:
      recoveries.length > 0
        ? Math.round(
            recoveries.reduce((sum, r) => sum + (r.hrv_rmssd || 0), 0) /
              recoveries.length
          )
        : null,
    avgSleepScore:
      sleeps.length > 0
        ? Math.round(
            sleeps.reduce((sum, s) => sum + (s.sleep_score || 0), 0) /
              sleeps.length
          )
        : null,
    avgSleepHours:
      sleeps.length > 0
        ? (
            sleeps.reduce((sum, s) => sum + (s.total_sleep_minutes || 0), 0) /
            sleeps.length /
            60
          ).toFixed(1)
        : null,
  };
});
