/**
 * Settings Page
 * User settings and account management
 */

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { DashboardSidebar } from '../dashboard/components/DashboardSidebar';
import { getSyncStatus } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { connection } = await getSyncStatus(user.id);

  return (
    <div className="flex h-screen bg-[var(--bg-page)]">
      <DashboardSidebar
        userName={user.user_metadata?.full_name || user.email?.split('@')[0]}
        userEmail={user.email}
      />

      <main className="flex-1 overflow-auto">
        <div className="flex flex-col gap-7 p-8 px-10 max-w-3xl">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="font-display-serif text-3xl text-white tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-[var(--text-tertiary)]">
              Manage your account and preferences
            </p>
          </div>

          {/* Profile Section */}
          <SettingsSection title="Profile">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-blue)] flex items-center justify-center">
                <span className="text-2xl font-semibold text-white">
                  {(user.email?.[0] || 'U').toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-white">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </h3>
                <p className="text-sm text-[var(--text-tertiary)]">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SettingsField
                label="Email"
                value={user.email || ''}
                disabled
              />
              <SettingsField
                label="Member Since"
                value={new Date(user.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
                disabled
              />
            </div>
          </SettingsSection>

          {/* Connected Devices */}
          <SettingsSection title="Connected Devices">
            <div className="space-y-4">
              <DeviceConnection
                name="Whoop"
                icon="activity"
                connected={!!connection}
                lastSync={connection?.updated_at}
              />
              <DeviceConnection
                name="Apple Health"
                icon="apple"
                connected={false}
                comingSoon
              />
              <DeviceConnection
                name="Garmin"
                icon="watch"
                connected={false}
                comingSoon
              />
            </div>
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection title="Notifications">
            <div className="space-y-4">
              <ToggleSetting
                label="Daily Recovery Summary"
                description="Receive a notification with your recovery score each morning"
                defaultChecked={true}
              />
              <ToggleSetting
                label="Workout Reminders"
                description="Get reminded to log workouts if you haven't trained"
                defaultChecked={false}
              />
              <ToggleSetting
                label="Weekly Progress Report"
                description="Summary of your weekly health metrics"
                defaultChecked={true}
              />
            </div>
          </SettingsSection>

          {/* Privacy */}
          <SettingsSection title="Privacy & Data">
            <div className="space-y-4">
              <ToggleSetting
                label="Share Anonymous Data"
                description="Help improve HealthTrack by sharing anonymous usage data"
                defaultChecked={false}
              />
              <div className="pt-4 border-t border-[var(--border-subtle)]">
                <button className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
                  Download my data
                </button>
              </div>
              <div>
                <button className="text-sm text-[var(--error)] hover:text-[var(--error)] hover:opacity-80 transition-opacity">
                  Delete my account
                </button>
              </div>
            </div>
          </SettingsSection>

          {/* Danger Zone */}
          <SettingsSection title="Account Actions">
            <div className="flex gap-4">
              <SignOutButton />
            </div>
          </SettingsSection>
        </div>
      </main>
    </div>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6">
      <h2 className="text-base font-semibold text-white mb-5">{title}</h2>
      {children}
    </div>
  );
}

function SettingsField({
  label,
  value,
  disabled,
}: {
  label: string;
  value: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-[var(--text-muted)]">
        {label}
      </label>
      <input
        type="text"
        value={value}
        disabled={disabled}
        className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-[var(--text-primary)] disabled:opacity-60"
        readOnly
      />
    </div>
  );
}

function DeviceConnection({
  name,
  icon,
  connected,
  lastSync,
  comingSoon,
}: {
  name: string;
  icon: string;
  connected: boolean;
  lastSync?: string;
  comingSoon?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-[var(--bg-elevated)] rounded-[var(--radius-md)]">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          connected ? 'bg-[var(--success-tint)]' : 'bg-[var(--bg-surface)]'
        }`}>
          <span className={`icon-lucide ${connected ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}>
            {icon}
          </span>
        </div>
        <div>
          <h4 className="font-medium text-white">{name}</h4>
          {connected && lastSync && (
            <p className="text-xs text-[var(--text-tertiary)]">
              Last synced: {new Date(lastSync).toLocaleDateString()}
            </p>
          )}
          {comingSoon && (
            <p className="text-xs text-[var(--text-muted)]">Coming soon</p>
          )}
        </div>
      </div>

      {!comingSoon && (
        <button
          className={`px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-colors ${
            connected
              ? 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-page)]'
              : 'gradient-accent text-white hover:opacity-90'
          }`}
        >
          {connected ? 'Disconnect' : 'Connect'}
        </button>
      )}
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-medium text-white">{label}</h4>
        <p className="text-sm text-[var(--text-tertiary)]">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          defaultChecked={defaultChecked}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-[var(--bg-elevated)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
      </label>
    </div>
  );
}

function SignOutButton() {
  return (
    <form action="/api/auth/signout" method="POST">
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium text-[var(--error)] bg-[var(--error-tint)] rounded-[var(--radius-md)] hover:bg-[var(--error)] hover:text-white transition-colors"
      >
        Sign Out
      </button>
    </form>
  );
}
