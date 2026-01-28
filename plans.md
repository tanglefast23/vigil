# Health Tracker - Project Plans & Notes

## Test Account Credentials

For local development and testing:

| Field | Value |
|-------|-------|
| Email | `testuser@demo.local` |
| Password | `Demo123456` |

**Note:** This account was created in the Supabase project and has sample data loaded.

## Quick Start for Testing

1. Start the dev server: `npm run dev`
2. Go to http://localhost:3000/login
3. Login with the test credentials above
4. The dashboard will show demo data with a yellow "Demo Mode" banner

## Features Status

### Completed
- [x] User authentication (email/password + magic link)
- [x] Dashboard with recovery, workout, and sleep stats
- [x] 30-day recovery trend chart
- [x] Recent workouts list
- [x] Demo mode with sample data seeding
- [x] Test data banner and clear functionality
- [x] Row Level Security on all health tables
- [x] Whoop OAuth flow setup
- [x] Webhook handler for real-time updates

### Pending
- [ ] Whoop API integration (needs real credentials)
- [ ] Background sync cron job testing
- [ ] Sleep detail view
- [ ] Workout detail view
- [ ] Settings page
- [ ] Data export functionality

## Supabase Project

- **Project ID:** `fyoizlhqttpnkgbndkkd`
- **URL:** https://fyoizlhqttpnkgbndkkd.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/fyoizlhqttpnkgbndkkd

## Development Notes

### RLS and Data Access
- Users can only READ their own data via RLS policies
- INSERT/UPDATE/DELETE requires the service role key (supabaseAdmin)
- The seed-test-data API uses admin client to bypass RLS

### Database Constraint Fix
Added 'test_data' as allowed source value:
```sql
-- Updated check constraints to allow demo data
ALTER TABLE health_workouts ADD CONSTRAINT health_workouts_source_check
  CHECK (source = ANY (ARRAY['whoop', 'apple_watch', 'test_data']));
```

### Common Issues Fixed
1. **Data not showing after seeding** - Was using plain Supabase client without cookies, auth.uid() returned null. Fixed by using `createSupabaseServerClient()` in data.ts.

2. **Build errors with Recharts** - Removed explicit type annotation on formatter function to avoid TypeScript issues.

3. **Environment variables at build time** - Used Proxy pattern for lazy initialization to avoid build-time errors.
