/**
 * Whoop Webhook Handler
 * Receives real-time updates when Whoop data changes
 */

import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/client';
import { getWhoopClientForUser } from '@/lib/whoop/client';

// Verify Whoop webhook signature
function verifyWebhookSignature(
  payload: string,
  signature: string | null
): boolean {
  const secret = process.env.WHOOP_WEBHOOK_SECRET;
  if (!secret || !signature) {
    return false;
  }

  const expectedSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}

interface WhoopWebhookPayload {
  type: string;
  user_id: number;
  id: number;
  trace_id: string;
}

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-whoop-signature');

    // Verify signature in production
    if (process.env.NODE_ENV === 'production') {
      if (!verifyWebhookSignature(payload, signature)) {
        console.warn('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const data: WhoopWebhookPayload = JSON.parse(payload);

    // Find user by Whoop user_id
    const { data: connection, error: connError } = await supabaseAdmin
      .from('health_oauth_connections')
      .select('user_id')
      .eq('whoop_user_id', String(data.user_id))
      .eq('provider', 'whoop')
      .single();

    if (connError || !connection) {
      console.warn(`No user found for Whoop user_id: ${data.user_id}`);
      return NextResponse.json({ received: true });
    }

    const userId = connection.user_id;

    // Handle different event types
    switch (data.type) {
      case 'recovery.updated':
      case 'recovery.created':
        await handleRecoveryUpdate(userId, data.id);
        break;

      case 'sleep.updated':
      case 'sleep.created':
        await handleSleepUpdate(userId, data.id);
        break;

      case 'workout.updated':
      case 'workout.created':
        await handleWorkoutUpdate(userId, data.id);
        break;

      case 'cycle.updated':
      case 'cycle.created':
        await handleCycleUpdate(userId, data.id);
        break;

      default:
        console.log(`Unhandled webhook type: ${data.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}

async function handleRecoveryUpdate(
  userId: string,
  cycleId: number
): Promise<void> {
  const client = await getWhoopClientForUser(userId);
  if (!client) return;

  const response = await client.getRecovery();
  const recovery = response.records.find((r) => r.cycle_id === cycleId);

  if (!recovery || recovery.score_state !== 'SCORED' || !recovery.score) {
    return;
  }

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

async function handleSleepUpdate(
  userId: string,
  sleepId: number
): Promise<void> {
  const client = await getWhoopClientForUser(userId);
  if (!client) return;

  const response = await client.getSleep();
  const sleep = response.records.find((s) => s.id === sleepId);

  if (!sleep || sleep.score_state !== 'SCORED' || !sleep.score) {
    return;
  }

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
      rem_minutes: Math.round(stageSummary.total_rem_sleep_time_milli / 60000),
      deep_minutes: Math.round(
        stageSummary.total_slow_wave_sleep_time_milli / 60000
      ),
      light_minutes: Math.round(
        stageSummary.total_light_sleep_time_milli / 60000
      ),
      awake_minutes: Math.round(stageSummary.total_awake_time_milli / 60000),
      sleep_score: sleep.score.sleep_performance_percentage,
      sleep_efficiency: sleep.score.sleep_efficiency_percentage,
      respiratory_rate: sleep.score.respiratory_rate,
      metadata: { raw: sleep },
    },
    { onConflict: 'user_id,external_id' }
  );
}

async function handleWorkoutUpdate(
  userId: string,
  workoutId: number
): Promise<void> {
  const client = await getWhoopClientForUser(userId);
  if (!client) return;

  const response = await client.getWorkouts();
  const workout = response.records.find((w) => w.id === workoutId);

  if (!workout || workout.score_state !== 'SCORED' || !workout.score) {
    return;
  }

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

async function handleCycleUpdate(
  userId: string,
  cycleId: number
): Promise<void> {
  const client = await getWhoopClientForUser(userId);
  if (!client) return;

  const response = await client.getCycles();
  const cycle = response.records.find((c) => c.id === cycleId);

  if (!cycle || cycle.score_state !== 'SCORED' || !cycle.score) {
    return;
  }

  // Store cycle data as health metrics
  await supabaseAdmin.from('health_metrics').insert([
    {
      user_id: userId,
      source: 'whoop',
      metric_type: 'strain',
      value: cycle.score.strain,
      recorded_at: cycle.start,
      metadata: { cycle_id: cycle.id },
    },
  ]);
}
