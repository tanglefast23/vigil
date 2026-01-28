# HealthTrack

A modern health metrics dashboard that integrates with Whoop to track your recovery, workouts, and sleep patterns. Built with Next.js 16, Supabase, and a custom dark-themed design system.

![Dashboard Demo](dashboard-demo.png)

## Features

- **Recovery Tracking** - Monitor your daily recovery score, HRV, and resting heart rate with color-coded indicators
- **Workout Analytics** - View workout history with strain scores, heart rate data, and calories burned
- **Sleep Insights** - Track sleep duration, efficiency, and sleep stages
- **30-Day Trends** - Interactive charts showing your recovery patterns over time
- **Demo Mode** - Try the app with realistic sample data before connecting your Whoop
- **Real-time Sync** - Automatic data synchronization with your Whoop account
- **Secure Authentication** - Email/password auth with magic link support via Supabase

## Design System

The app features a professional dark theme with a comprehensive design token system:

| Token Category | Examples |
|----------------|----------|
| **Backgrounds** | `--bg-page` (#0A0A0B), `--bg-surface` (#111113), `--bg-elevated` (#1A1A1D) |
| **Text** | `--text-primary` (white), `--text-secondary`, `--text-muted` |
| **Accents** | `--accent` (#10B981 emerald), `--accent-blue`, `--warning`, `--error` |
| **Recovery** | `--recovery-high` (green), `--recovery-medium` (yellow), `--recovery-low` (red) |

### Typography

- **Display**: Instrument Serif - elegant headings
- **Body**: Inter - clean, readable text
- **Mono**: DM Mono - metrics and data values
- **Icons**: Lucide icon font

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org/) | React framework with App Router |
| [React 19](https://react.dev/) | UI library |
| [Supabase](https://supabase.com/) | Auth, database, and real-time subscriptions |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling with CSS variables |
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

## Screenshots

### Landing Page
Dark-themed landing page with hero section, dashboard preview, and feature highlights.

### Dashboard
Full-width dashboard with sidebar navigation, stat cards showing recovery/HRV/strain/sleep metrics, recovery trend chart, and recent workouts list.

### Authentication
Split-panel auth pages with form on left and visual marketing content on right. Login uses green accent gradient, signup uses purple.

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

## UI Components

The app includes a reusable component library in `/src/components/`:

| Component | Description |
|-----------|-------------|
| `Button` | Primary (gradient), Secondary (dark), Ghost variants |
| `Input` | Labeled input field with optional icon |
| `Logo` | HealthTrack brand mark with icon |
| `NavItem` | Sidebar navigation item with active states |
| `StatCard` | Metric display with label, value, trend indicator |
| `FeatureCard` | Feature showcase with icon, title, description |
| `WorkoutCard` | Workout row with activity, strain, HR, calories |
| `Sidebar` | Dashboard navigation with user profile |

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
│   │   ├── components/          # Dashboard-specific components
│   │   │   ├── DashboardSidebar.tsx
│   │   │   ├── RecoveryChart.tsx
│   │   │   ├── WorkoutList.tsx
│   │   │   └── ...
│   │   ├── actions.ts           # Server actions
│   │   └── page.tsx             # Main dashboard page
│   ├── login/                   # Login page with split layout
│   ├── signup/                  # Signup page with split layout
│   ├── globals.css              # Design tokens & base styles
│   ├── layout.tsx               # Root layout with fonts
│   └── page.tsx                 # Landing page
├── components/                  # Shared UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Logo.tsx
│   ├── NavItem.tsx
│   ├── StatCard.tsx
│   ├── FeatureCard.tsx
│   ├── WorkoutCard.tsx
│   ├── Sidebar.tsx
│   └── index.ts                 # Barrel export
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
5. Users can then connect their Whoop from the dashboard sidebar

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License - feel free to use this project for your own health tracking needs.
