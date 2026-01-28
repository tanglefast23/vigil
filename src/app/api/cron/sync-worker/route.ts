/**
 * Cron Sync Worker
 * Periodically syncs Whoop data for all connected users
 * Configure in Vercel: crons = [{ path = "/api/cron/sync-worker", schedule = "0 */4 * * *" }]
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { getWhoopClientForUser } from '@/lib/whoop/client';
import { subDays } from 'date-fns';

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn('CRON_SECRET not configured');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all users with Whoop connections
    const { data: connections, error: connError } = await supabaseAdmin
      .from('health_oauth_connections')
      .select('user_id')
      .eq('provider', 'whoop');

    if (connError) {
      throw new Error(`Failed to fetch connections: ${connError.message}`);
    }

    const results = {
      total: connections?.length || 0,
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Sync each user
    for (const conn of connections || []) {
      try {
        await syncUserData(conn.user_id);
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push(
          `User ${conn.user_id}: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
      }
    }

    return NextResponse.json({
      message: 'Sync completed',
      ...results,
    });
  } catch (err) {
    console.error('Cron sync error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Sync failed' },
      { status: 500 }
    );
  }
}

async function syncUserData(userId: string): Promise<void> {
  const client = await getWhoopClientForUser(userId);
  if (!client) {
    throw new Error('No Whoop connection found');
  }

  // Fetch last 7 days of data
  const startDate = subDays(new Date(), 7).toISOString();
  const endDate = new Date().toISOString();

  // Sync recovery data
  const recoveryData = await client.fetchAllPages((nextToken) =>
    client.getRecovery(startDate, endDate, nextToken)
  );

  for (const recovery of recoveryData) {
    if (recovery.score_state !== 'SCORED' || !recovery.score) continue;

    await supabaseAdmin.from('health_recovery').upsert(
      {
        user_id: userId,
        source: 'whoop',
        external_id: String(recovery.cycle_id),
        recorded_at: new Date().toISOString(),
        recovery_score: recovery.score.recovery_score,
        hrv_rmssd: recovery.score.hrv_rmssd_milli,
        resting_heart_rate: recovery.score.resting_heart_rate,
        spo2: recovery.score.spo2_percentage,
        skin_temp_celsius: recovery.score.skin_temp_celsius,
        metadata: { raw: recovery },
      },
      { onConflict: 'user_id,external_id' }
    );
  }

  // Sync sleep data
  const sleepData = await client.fetchAllPages((nextToken) =>
    client.getSleep(startDate, endDate, nextToken)
  );

  for (const sleep of sleepData) {
    if (sleep.score_state !== 'SCORED' || !sleep.score) continue;

    const stageSummary = sleep.score.stage_summary;
    await supabaseAdmin.from('health_sleep').upsert(
      {
        user_id: userId,
        source: 'whoop',
        external_id: String(sleep.id),
        started_at: sleep.start,
        ended_at: sleep.end,
        total_sleep_minutes: Math.round(
          (stageSummary.total_in_bed_time_milli -
            stageSummary.total_awake_time_milli) /
            60000
        ),
        rem_minutes: Math.round(
          stageSummary.total_rem_sleep_time_milli / 60000
        ),
        deep_minutes: Math.round(
          stageSummary.total_slow_wave_sleep_time_milli / 60000
        ),
        light_minutes: Math.round(
          stageSummary.total_light_sleep_time_milli / 60000
        ),
        awake_minutes: Math.round(
          stageSummary.total_awake_time_milli / 60000
        ),
        sleep_score: sleep.score.sleep_performance_percentage,
        sleep_efficiency: sleep.score.sleep_efficiency_percentage,
        respiratory_rate: sleep.score.respiratory_rate,
        metadata: { raw: sleep },
      },
      { onConflict: 'user_id,external_id' }
    );
  }

  // Sync workout data
  const workoutData = await client.fetchAllPages((nextToken) =>
    client.getWorkouts(startDate, endDate, nextToken)
  );

  for (const workout of workoutData) {
    if (workout.score_state !== 'SCORED' || !workout.score) continue;

    await supabaseAdmin.from('health_workouts').upsert(
      {
        user_id: userId,
        source: 'whoop',
        external_id: String(workout.id),
        activity_type: String(workout.sport_id),
        started_at: workout.start,
        ended_at: workout.end,
        strain_score: workout.score.strain,
        avg_heart_rate: workout.score.average_heart_rate,
        max_heart_rate: workout.score.max_heart_rate,
        calories_burned: Math.round(workout.score.kilojoule * 0.239006),
        distance_meters: workout.score.distance_meter,
        metadata: { raw: workout },
      },
      { onConflict: 'user_id,external_id' }
    );
  }

  // Update sync status
  await supabaseAdmin
    .from('health_sync_status')
    .upsert(
      {
        user_id: userId,
        provider: 'whoop',
        last_successful_sync: new Date().toISOString(),
        last_sync_attempt: new Date().toISOString(),
        last_error: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,provider' }
    );
}
