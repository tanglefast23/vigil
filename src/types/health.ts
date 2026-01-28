/**
 * Health Tracker Type Definitions
 * All types for Whoop integration and health metrics
 */

// OAuth connection for health data providers
export interface HealthOAuthConnection {
  id: string;
  user_id: string;
  provider: 'whoop' | 'apple_health';
  access_token_encrypted: string;
  refresh_token_encrypted: string | null;
  token_expires_at: string | null;
  scopes: string[];
  whoop_user_id: string | null;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

// Time-series health metrics
export interface HealthMetric {
  id: string;
  user_id: string;
  source: 'whoop' | 'apple_watch';
  metric_type: MetricType;
  value: number;
  recorded_at: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type MetricType =
  | 'heart_rate'
  | 'hrv'
  | 'rhr'           // resting heart rate
  | 'respiratory_rate'
  | 'spo2'
  | 'skin_temp'
  | 'steps'
  | 'calories'
  | 'strain'
  | 'recovery'
  | 'sleep_score';

// Workout/Activity sessions
export interface HealthWorkout {
  id: string;
  user_id: string;
  source: 'whoop' | 'apple_watch';
  external_id: string;        // Whoop cycle_id or Apple workout ID
  activity_type: string;
  started_at: string;
  ended_at: string | null;
  strain_score: number | null;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
  calories_burned: number | null;
  distance_meters: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Sleep session data
export interface HealthSleep {
  id: string;
  user_id: string;
  source: 'whoop' | 'apple_watch';
  external_id: string;
  started_at: string;
  ended_at: string;
  total_sleep_minutes: number;
  rem_minutes: number | null;
  deep_minutes: number | null;
  light_minutes: number | null;
  awake_minutes: number | null;
  sleep_score: number | null;
  sleep_efficiency: number | null;
  respiratory_rate: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Recovery data (Whoop-specific but abstracted)
export interface HealthRecovery {
  id: string;
  user_id: string;
  source: 'whoop';
  external_id: string;        // Whoop cycle_id
  recorded_at: string;
  recovery_score: number;     // 0-100
  hrv_rmssd: number | null;   // HRV in milliseconds
  resting_heart_rate: number | null;
  spo2: number | null;
  skin_temp_celsius: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Sync status tracking
export interface HealthSyncStatus {
  id: string;
  user_id: string;
  provider: 'whoop' | 'apple_health';
  last_successful_sync: string | null;
  last_sync_attempt: string | null;
  last_error: string | null;
  sync_cursor: string | null;  // For pagination/incremental sync
  created_at: string;
  updated_at: string;
}

// Whoop API response types
export interface WhoopTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface WhoopUser {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface WhoopCycle {
  id: number;
  user_id: number;
  start: string;
  end: string | null;
  timezone_offset: string;
  score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
  score?: {
    strain: number;
    kilojoule: number;
    average_heart_rate: number;
    max_heart_rate: number;
  };
}

export interface WhoopSleep {
  id: number;
  user_id: number;
  start: string;
  end: string;
  timezone_offset: string;
  nap: boolean;
  score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
  score?: {
    stage_summary: {
      total_in_bed_time_milli: number;
      total_awake_time_milli: number;
      total_no_data_time_milli: number;
      total_light_sleep_time_milli: number;
      total_slow_wave_sleep_time_milli: number;
      total_rem_sleep_time_milli: number;
      sleep_cycle_count: number;
      disturbance_count: number;
    };
    sleep_needed: {
      baseline_milli: number;
      need_from_sleep_debt_milli: number;
      need_from_recent_strain_milli: number;
      need_from_recent_nap_milli: number;
    };
    respiratory_rate: number;
    sleep_performance_percentage: number;
    sleep_consistency_percentage: number;
    sleep_efficiency_percentage: number;
  };
}

export interface WhoopRecovery {
  cycle_id: number;
  sleep_id: number;
  user_id: number;
  score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
  score?: {
    user_calibrating: boolean;
    recovery_score: number;
    resting_heart_rate: number;
    hrv_rmssd_milli: number;
    spo2_percentage: number | null;
    skin_temp_celsius: number | null;
  };
}

export interface WhoopWorkout {
  id: number;
  user_id: number;
  start: string;
  end: string;
  timezone_offset: string;
  sport_id: number;
  score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
  score?: {
    strain: number;
    average_heart_rate: number;
    max_heart_rate: number;
    kilojoule: number;
    percent_recorded: number;
    distance_meter: number | null;
    altitude_gain_meter: number | null;
    altitude_change_meter: number | null;
    zone_duration: {
      zone_zero_milli: number;
      zone_one_milli: number;
      zone_two_milli: number;
      zone_three_milli: number;
      zone_four_milli: number;
      zone_five_milli: number;
    };
  };
}

// Dashboard data structures
export interface DashboardData {
  latestRecovery: HealthRecovery | null;
  latestSleep: HealthSleep | null;
  recentWorkouts: HealthWorkout[];
  weeklyMetrics: {
    avgHrv: number | null;
    avgRecovery: number | null;
    avgSleepScore: number | null;
    totalStrain: number;
    workoutCount: number;
  };
  trends: {
    date: string;
    recovery: number | null;
    strain: number | null;
    sleepScore: number | null;
  }[];
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
