/**
 * Server Actions for the Dashboard
 * Handle manual sync triggers and other mutations
 */

'use server';

import { supabaseAdmin } from '@/lib/supabase/client';
import { getWhoopClientForUser } from '@/lib/whoop/client';
import { subDays } from 'date-fns';
import { revalidatePath } from 'next/cache';

interface SyncResult {
  success: boolean;
  message: string;
}

export async function triggerManualSync(userId: string): Promise<SyncResult> {
  try {
    const client = await getWhoopClientForUser(userId);
    if (!client) {
      return {
        success: false,
        message: 'No Whoop connection found. Please reconnect your account.',
      };
    }

    // Update sync status to show processing
    await supabaseAdmin.from('health_sync_status').upsert(
      {
        user_id: userId,
        provider: 'whoop',
        last_sync_attempt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,provider' }
    );

    // Fetch last 7 days of data
    const startDate = subDays(new Date(), 7).toISOString();
    const endDate = new Date().toISOString();

    // Sync recovery data
    const recoveryData = await client.fetchAllPages((nextToken) =>
      client.getRecovery(startDate, endDate, nextToken)
    );

    let recoveryCount = 0;
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
      recoveryCount++;
    }

    // Sync sleep data
    const sleepData = await client.fetchAllPages((nextToken) =>
      client.getSleep(startDate, endDate, nextToken)
    );

    let sleepCount = 0;
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
      sleepCount++;
    }

    // Sync workout data
    const workoutData = await client.fetchAllPages((nextToken) =>
      client.getWorkouts(startDate, endDate, nextToken)
    );

    let workoutCount = 0;
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
      workoutCount++;
    }

    // Update sync status
    await supabaseAdmin.from('health_sync_status').upsert(
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

    // Revalidate the dashboard page
    revalidatePath('/dashboard');

    return {
      success: true,
      message: `Synced ${recoveryCount} recovery, ${sleepCount} sleep, and ${workoutCount} workout records.`,
    };
  } catch (err) {
    console.error('Manual sync error:', err);

    // Update sync status with error
    await supabaseAdmin.from('health_sync_status').upsert(
      {
        user_id: userId,
        provider: 'whoop',
        last_sync_attempt: new Date().toISOString(),
        last_error: err instanceof Error ? err.message : 'Unknown error',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,provider' }
    );

    return {
      success: false,
      message:
        err instanceof Error ? err.message : 'Sync failed. Please try again.',
    };
  }
}

export async function disconnectWhoop(userId: string): Promise<SyncResult> {
  try {
    // Delete OAuth connection
    await supabaseAdmin
      .from('health_oauth_connections')
      .delete()
      .eq('user_id', userId)
      .eq('provider', 'whoop');

    // Delete sync status
    await supabaseAdmin
      .from('health_sync_status')
      .delete()
      .eq('user_id', userId)
      .eq('provider', 'whoop');

    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Whoop disconnected successfully.',
    };
  } catch (err) {
    console.error('Disconnect error:', err);
    return {
      success: false,
      message: 'Failed to disconnect. Please try again.',
    };
  }
}
