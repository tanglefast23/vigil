# Health Tracker

A modern health metrics dashboard that integrates with Whoop to track your recovery, workouts, and sleep patterns. Built with Next.js 16, Supabase, and Recharts.

![Dashboard Demo](dashboard-demo.png)

## Features

- **Recovery Tracking** - Monitor your daily recovery score, HRV, and resting heart rate
- **Workout Analytics** - View workout history with strain scores, heart rate data, and calories burned
- **Sleep Insights** - Track sleep duration, efficiency, and sleep stages (REM, deep, light)
- **30-Day Trends** - Interactive charts showing your recovery patterns over time
- **Demo Mode** - Try the app with realistic sample data before connecting your Whoop
- **Real-time Sync** - Automatic data synchronization with your Whoop account
- **Secure Authentication** - Email/password auth with magic link support via Supabase

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org/) | React framework with App Router |
| [React 19](https://react.dev/) | UI library |
| [Supabase](https://supabase.com/) | Auth, database, and real-time subscriptions |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling |
| [Recharts](https://recharts.org/) | Data visualization |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│    Supabase      │◀────│   Whoop API     │
│   (Frontend)    │     │  (Auth + DB)     │     │   (Webhooks)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │
        ▼                        ▼
┌─────────────────┐     ┌──────────────────┐
│  Server Actions │     │   Row Level      │
│  & API Routes   │     │   Security       │
└─────────────────┘     └──────────────────┘
```

### Key Components

- **Server Components** - Data fetching happens on the server with React cache for deduplication
- **Row Level Security (RLS)** - Users can only access their own health data
- **OAuth Integration** - Secure token storage with encryption for Whoop API
- **Webhook Handlers** - Real-time data updates from Whoop

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- (Optional) Whoop developer account for API integration

### 1. Clone and Install

```bash
git clone https://github.com/tanglefast23/health-tracker.git
cd health-tracker
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Whoop OAuth (optional - for real data)
WHOOP_CLIENT_ID=your_whoop_client_id
WHOOP_CLIENT_SECRET=your_whoop_client_secret

# Security
ENCRYPTION_KEY=generate_a_32_byte_hex_key
CRON_SECRET=generate_a_random_secret
```

### 3. Set Up Database

Run the database migration in your Supabase SQL editor:

```bash
# Copy contents of supabase/migrations/001_health_tracker_schema.sql
# and run it in Supabase Dashboard > SQL Editor
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Demo Mode

Don't have a Whoop account? No problem! The app includes a demo mode with realistic sample data.

1. Create an account or log in
2. On the empty dashboard, click **"Load Sample Data (Demo Mode)"**
3. Explore the dashboard with 30 days of generated health data
4. Clear the data anytime with **"Clear sample data"** in the banner

Demo data includes:
- Recovery scores with HRV and resting heart rate
- 15 workout sessions of various types
- 30 days of sleep tracking data

## Database Schema

The app uses these Supabase tables:

| Table | Description |
|-------|-------------|
| `health_oauth_connections` | OAuth tokens for Whoop integration |
| `health_metrics` | Time-series health measurements |
| `health_workouts` | Workout/activity sessions |
| `health_sleep` | Sleep session data |
| `health_recovery` | Daily recovery scores |
| `health_sync_status` | Sync tracking per provider |

All tables have Row Level Security enabled - users can only see their own data.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/whoop/          # Whoop OAuth flow
│   │   ├── cron/sync-worker/    # Background sync job
│   │   ├── seed-test-data/      # Demo data seeding
│   │   └── webhooks/whoop/      # Whoop webhook handler
│   ├── dashboard/
│   │   ├── components/          # Dashboard UI components
│   │   ├── actions.ts           # Server actions
│   │   └── page.tsx             # Main dashboard page
│   ├── login/                   # Login page
│   └── signup/                  # Signup page
├── lib/
│   ├── supabase/
│   │   ├── server.ts            # Server client (with cookies)
│   │   ├── client.ts            # Admin client (service role)
│   │   └── browser.ts           # Browser client
│   ├── whoop/
│   │   └── client.ts            # Whoop API client
│   ├── crypto.ts                # Token encryption
│   └── data.ts                  # Data fetching utilities
├── hooks/
│   └── useRealtimeSync.ts       # Real-time sync status hook
└── types/
    └── health.ts                # TypeScript types
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set all environment variables in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `WHOOP_CLIENT_ID` (if using Whoop)
- `WHOOP_CLIENT_SECRET` (if using Whoop)
- `ENCRYPTION_KEY`
- `CRON_SECRET`

## Whoop Integration

To connect real Whoop data:

1. Create a Whoop developer account at [developer.whoop.com](https://developer.whoop.com)
2. Register your application
3. Add your Client ID and Secret to environment variables
4. Configure the callback URL: `https://your-domain.com/api/auth/whoop/callback`
5. Users can then connect their Whoop from the dashboard

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License - feel free to use this project for your own health tracking needs.
