-- Health Tracker Schema
-- All tables prefixed with 'health_' to avoid conflicts with existing tables

-- OAuth connections for health data providers
CREATE TABLE IF NOT EXISTS health_oauth_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('whoop', 'apple_health')),
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    scopes TEXT[] DEFAULT '{}',
    whoop_user_id TEXT,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- Time-series health metrics
CREATE TABLE IF NOT EXISTS health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source TEXT NOT NULL CHECK (source IN ('whoop', 'apple_watch')),
    metric_type TEXT NOT NULL CHECK (metric_type IN (
        'heart_rate', 'hrv', 'rhr', 'respiratory_rate',
        'spo2', 'skin_temp', 'steps', 'calories', 'strain',
        'recovery', 'sleep_score'
    )),
    value DOUBLE PRECISION NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout/Activity sessions
CREATE TABLE IF NOT EXISTS health_workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source TEXT NOT NULL CHECK (source IN ('whoop', 'apple_watch')),
    external_id TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    strain_score DOUBLE PRECISION,
    avg_heart_rate INTEGER,
    max_heart_rate INTEGER,
    calories_burned INTEGER,
    distance_meters DOUBLE PRECISION,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, external_id)
);

-- Sleep session data
CREATE TABLE IF NOT EXISTS health_sleep (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source TEXT NOT NULL CHECK (source IN ('whoop', 'apple_watch')),
    external_id TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ NOT NULL,
    total_sleep_minutes INTEGER,
    rem_minutes INTEGER,
    deep_minutes INTEGER,
    light_minutes INTEGER,
    awake_minutes INTEGER,
    sleep_score DOUBLE PRECISION,
    sleep_efficiency DOUBLE PRECISION,
    respiratory_rate DOUBLE PRECISION,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, external_id)
);

-- Recovery data
CREATE TABLE IF NOT EXISTS health_recovery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source TEXT NOT NULL DEFAULT 'whoop',
    external_id TEXT NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    recovery_score DOUBLE PRECISION NOT NULL,
    hrv_rmssd DOUBLE PRECISION,
    resting_heart_rate INTEGER,
    spo2 DOUBLE PRECISION,
    skin_temp_celsius DOUBLE PRECISION,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, external_id)
);

-- Sync status tracking
CREATE TABLE IF NOT EXISTS health_sync_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('whoop', 'apple_health')),
    last_successful_sync TIMESTAMPTZ,
    last_sync_attempt TIMESTAMPTZ,
    last_error TEXT,
    sync_cursor TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_time
    ON health_metrics (user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_metrics_type
    ON health_metrics (user_id, metric_type, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_workouts_user_time
    ON health_workouts (user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_sleep_user_time
    ON health_sleep (user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_recovery_user_time
    ON health_recovery (user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_oauth_whoop_user
    ON health_oauth_connections (whoop_user_id) WHERE provider = 'whoop';

-- Row Level Security
ALTER TABLE health_oauth_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_sleep ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_recovery ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_sync_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only access their own data
CREATE POLICY "Users can view own oauth connections"
    ON health_oauth_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own metrics"
    ON health_metrics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own workouts"
    ON health_workouts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sleep"
    ON health_sleep FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own recovery"
    ON health_recovery FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sync status"
    ON health_sync_status FOR SELECT
    USING (auth.uid() = user_id);

-- Service role policies for API routes (bypasses RLS)
-- These are handled by using supabaseAdmin with service role key

-- Enable realtime for sync status updates
ALTER PUBLICATION supabase_realtime ADD TABLE health_sync_status;
