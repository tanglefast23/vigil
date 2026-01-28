/**
 * Seed Test Data API
 * Creates dummy health data for the logged-in user
 * All test data is marked with source='test_data' and metadata.is_test_data=true
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Generate 30 days of recovery data
    const recoveryData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        user_id: userId,
        source: 'test_data',
        external_id: `test_recovery_${i}_${Date.now()}`,
        recorded_at: date.toISOString(),
        recovery_score: Math.floor(40 + Math.random() * 55),
        hrv_rmssd: Math.floor(30 + Math.random() * 50),
        resting_heart_rate: Math.floor(48 + Math.random() * 17),
        spo2: Number((95 + Math.random() * 4).toFixed(1)),
        skin_temp_celsius: Number((35.5 + Math.random() * 2).toFixed(1)),
        metadata: { is_test_data: true },
      };
    });

    // Generate ~15 workouts over 30 days
    const activityTypes = ['Running', 'Cycling', 'Strength', 'HIIT', 'Yoga', 'Swimming'];
    const workoutData = Array.from({ length: 15 }, (_, i) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (i * 2));
      startDate.setHours(startDate.getHours() - Math.floor(Math.random() * 8));

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + 30 + Math.floor(Math.random() * 60));

      return {
        user_id: userId,
        source: 'test_data',
        external_id: `test_workout_${i}_${Date.now()}`,
        activity_type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
        started_at: startDate.toISOString(),
        ended_at: endDate.toISOString(),
        strain_score: Number((8 + Math.random() * 10).toFixed(1)),
        avg_heart_rate: Math.floor(120 + Math.random() * 45),
        max_heart_rate: Math.floor(160 + Math.random() * 35),
        calories_burned: Math.floor(200 + Math.random() * 600),
        distance_meters: Math.floor(Math.random() * 15000),
        metadata: { is_test_data: true },
      };
    });

    // Generate 30 days of sleep data
    const sleepData = Array.from({ length: 30 }, (_, i) => {
      const sleepStart = new Date();
      sleepStart.setDate(sleepStart.getDate() - i);
      sleepStart.setHours(22, 30 - Math.floor(Math.random() * 60), 0);

      const sleepEnd = new Date(sleepStart);
      sleepEnd.setDate(sleepEnd.getDate() + 1);
      sleepEnd.setHours(6, 30 + Math.floor(Math.random() * 60), 0);

      return {
        user_id: userId,
        source: 'test_data',
        external_id: `test_sleep_${i}_${Date.now()}`,
        started_at: sleepStart.toISOString(),
        ended_at: sleepEnd.toISOString(),
        total_sleep_minutes: Math.floor(360 + Math.random() * 120),
        rem_minutes: Math.floor(60 + Math.random() * 60),
        deep_minutes: Math.floor(60 + Math.random() * 60),
        light_minutes: Math.floor(180 + Math.random() * 60),
        awake_minutes: Math.floor(10 + Math.random() * 30),
        sleep_score: Math.floor(60 + Math.random() * 35),
        sleep_efficiency: Number((80 + Math.random() * 18).toFixed(1)),
        respiratory_rate: Number((12 + Math.random() * 6).toFixed(1)),
        metadata: { is_test_data: true },
      };
    });

    // Insert all test data
    const { error: recoveryError } = await supabase
      .from('health_recovery')
      .upsert(recoveryData, { onConflict: 'user_id,external_id' });

    if (recoveryError) {
      console.error('Recovery insert error:', recoveryError);
    }

    const { error: workoutError } = await supabase
      .from('health_workouts')
      .upsert(workoutData, { onConflict: 'user_id,external_id' });

    if (workoutError) {
      console.error('Workout insert error:', workoutError);
    }

    const { error: sleepError } = await supabase
      .from('health_sleep')
      .upsert(sleepData, { onConflict: 'user_id,external_id' });

    if (sleepError) {
      console.error('Sleep insert error:', sleepError);
    }

    // Update sync status
    await supabase.from('health_sync_status').upsert({
      user_id: userId,
      provider: 'test_data',
      last_successful_sync: new Date().toISOString(),
      last_sync_attempt: new Date().toISOString(),
      last_error: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,provider' });

    return NextResponse.json({
      success: true,
      message: 'Test data seeded successfully',
      counts: {
        recovery: recoveryData.length,
        workouts: workoutData.length,
        sleep: sleepData.length,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to seed data' },
      { status: 500 }
    );
  }
}

// Also support DELETE to clear test data
export async function DELETE() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Delete all test data for this user
    await supabase.from('health_recovery').delete().eq('user_id', userId).eq('source', 'test_data');
    await supabase.from('health_workouts').delete().eq('user_id', userId).eq('source', 'test_data');
    await supabase.from('health_sleep').delete().eq('user_id', userId).eq('source', 'test_data');
    await supabase.from('health_sync_status').delete().eq('user_id', userId).eq('provider', 'test_data');

    return NextResponse.json({
      success: true,
      message: 'Test data cleared successfully',
    });
  } catch (error) {
    console.error('Clear error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clear data' },
      { status: 500 }
    );
  }
}
