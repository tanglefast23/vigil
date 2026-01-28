/**
 * Sidebar Component
 * Main navigation sidebar with logo, nav items, and user profile
 * Based on Pencil design: Sidebar
 */

'use client';

import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { NavItem } from './NavItem';
import { Button } from './Button';

interface SidebarProps {
  userName?: string;
  userEmail?: string;
  onSignOut?: () => void;
}

const navItems = [
  { href: '/dashboard', icon: 'home', label: 'Dashboard' },
  { href: '/dashboard/workouts', icon: 'activity', label: 'Workouts' },
  { href: '/dashboard/sleep', icon: 'moon', label: 'Sleep' },
  { href: '/dashboard/recovery', icon: 'heart', label: 'Recovery' },
  { href: '/settings', icon: 'settings', label: 'Settings' },
];

export function Sidebar({ userName, userEmail, onSignOut }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="
        flex flex-col justify-between
        w-[260px] h-full
        bg-[var(--bg-surface)]
        border-l-[3px] border-l-[var(--accent)]
        px-5 py-6
      "
    >
      {/* Top Section */}
      <div className="flex flex-col gap-8">
        <Logo />

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
            />
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-4">
        {/* Connect Whoop Card */}
        <div
          className="
            flex flex-col gap-3
            gradient-accent
            rounded-[var(--radius-lg)]
            p-4
          "
        >
          <div className="flex items-center gap-2">
            <span className="icon-lucide text-xl text-white">zap</span>
            <span className="text-sm font-semibold text-white">Connect Whoop</span>
          </div>
          <p className="text-xs text-white/80 leading-snug">
            Sync your health data automatically
          </p>
          <Button
            variant="secondary"
            className="!bg-white !text-[var(--bg-surface)] !border-0 text-xs"
          >
            Connect Now
          </Button>
        </div>

        <div className="h-px bg-[var(--border-default)]" />

        {/* User Profile */}
        {(userName || userEmail) && (
          <div className="flex items-center gap-3">
            <div
              className="
                w-9 h-9
                flex items-center justify-center
                bg-[var(--bg-interactive)]
                rounded-full
                text-sm font-medium text-white
              "
            >
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
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="icon-lucide text-base text-[var(--text-muted)] hover:text-white transition-colors"
              >
                chevron-down
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
