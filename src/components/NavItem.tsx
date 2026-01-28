/**
 * NavItem Component
 * Sidebar navigation item with active/inactive states
 * Based on Pencil design: Nav/Item, Nav/ItemActive
 */

import Link from 'next/link';

interface NavItemProps {
  href: string;
  icon: string;
  label: string;
  isActive?: boolean;
}

export function NavItem({ href, icon, label, isActive = false }: NavItemProps) {
  return (
    <Link
      href={href}
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
        {icon}
      </span>
      <span className={`text-sm ${isActive ? 'font-medium' : 'font-normal'}`}>
        {label}
      </span>
    </Link>
  );
}
