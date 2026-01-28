/**
 * MobileTabBar Component
 * Bottom navigation for mobile view
 * Based on Pencil design: Mobile/TabBar component
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TabItem {
  href: string;
  icon: string;
  label: string;
}

const tabs: TabItem[] = [
  { href: '/dashboard', icon: 'home', label: 'Home' },
  { href: '/dashboard/workouts', icon: 'activity', label: 'Activity' },
  { href: '/dashboard/sleep', icon: 'moon', label: 'Sleep' },
  { href: '/dashboard/recovery', icon: 'heart', label: 'Recovery' },
  { href: '/settings', icon: 'settings', label: 'Settings' },
];

export function MobileTabBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                flex flex-col items-center justify-center gap-1
                w-16 h-12 rounded-xl
                transition-colors
                ${active ? 'text-white' : 'text-[var(--text-muted)]'}
              `}
            >
              <span
                className={`icon-lucide text-xl ${
                  active ? 'text-[var(--accent)]' : ''
                }`}
              >
                {tab.icon}
              </span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
