/**
 * Dashboard Sidebar Component
 * Navigation sidebar for the dashboard with logo, nav items, and user profile
 * Based on Pencil design: Dashboard > Sidebar
 */

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

interface DashboardSidebarProps {
  userName?: string;
  userEmail?: string;
}

const navItems = [
  { href: '/dashboard', icon: 'home', label: 'Dashboard' },
  { href: '/dashboard/workouts', icon: 'activity', label: 'Workouts' },
  { href: '/dashboard/sleep', icon: 'moon', label: 'Sleep' },
  { href: '/dashboard/recovery', icon: 'heart', label: 'Recovery' },
  { href: '/settings', icon: 'settings', label: 'Settings' },
];

export function DashboardSidebar({ userName, userEmail }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="flex flex-col justify-between w-[260px] h-full bg-[var(--bg-surface)] border-l-[3px] border-l-[var(--accent)] px-5 py-6">
      {/* Top Section */}
      <div className="flex flex-col gap-8">
        <Logo />

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3
                  w-full px-4 py-3
                  rounded-[var(--radius-md)]
                  transition-colors
                  ${
                    isActive
                      ? 'bg-[var(--bg-elevated)] text-white'
                      : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-secondary)]'
                  }
                `}
              >
                <span
                  className={`icon-lucide text-xl ${
                    isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-sm ${isActive ? 'font-medium' : 'font-normal'}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-4">
        {/* Connect Whoop Card */}
        <div className="flex flex-col gap-3 gradient-accent rounded-[var(--radius-lg)] p-4">
          <div className="flex items-center gap-2">
            <span className="icon-lucide text-xl text-white">zap</span>
            <span className="text-sm font-semibold text-white">
              Connect Whoop
            </span>
          </div>
          <p className="text-xs text-white/80 leading-snug">
            Sync your health data automatically
          </p>
          <Link
            href="/api/auth/whoop"
            className="flex justify-center bg-white text-[var(--bg-surface)] rounded-[6px] py-2.5 text-xs font-semibold hover:bg-white/90 transition-colors"
          >
            Connect Now
          </Link>
        </div>

        <div className="h-px bg-[var(--border-default)]" />

        {/* User Profile */}
        {(userName || userEmail) && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center bg-[var(--bg-interactive)] rounded-full text-sm font-medium text-white">
              {userName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              {userName && (
                <p className="text-sm font-medium text-white truncate">
                  {userName}
                </p>
              )}
              {userEmail && (
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {userEmail}
                </p>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="icon-lucide text-base text-[var(--text-muted)] hover:text-white transition-colors"
              title="Sign out"
            >
              log-out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
