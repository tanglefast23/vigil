/**
 * DashboardHeader Component
 * Sticky header with hamburger menu (mobile only), layout toggle
 * Appears at the top of content area on mobile
 */

'use client';

import { Logo } from '@/components';
import { LayoutModeToggle } from './LayoutModeToggle';
import type { LayoutMode } from '@/stores/layoutStore';

interface DashboardHeaderProps {
  isMobile: boolean;
  layoutMode: LayoutMode;
  onMenuClick: () => void;
  onModeChange: (mode: LayoutMode) => void;
}

export function DashboardHeader({
  isMobile,
  layoutMode,
  onMenuClick,
  onModeChange,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-[var(--bg-page)]/95 backdrop-blur-sm border-b border-[var(--border-subtle)]">
      <div className="flex items-center justify-between px-4 md:px-6 h-14">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {/* Hamburger menu - mobile only */}
          {isMobile && (
            <button
              onClick={onMenuClick}
              className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-interactive)] transition-colors"
              aria-label="Open menu"
            >
              <span className="icon-lucide text-xl">menu</span>
            </button>
          )}

          {/* Logo on mobile */}
          {isMobile && (
            <div className="scale-90 origin-left">
              <Logo />
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <LayoutModeToggle
            currentMode={layoutMode}
            isMobile={isMobile}
            onModeChange={onModeChange}
          />
        </div>
      </div>
    </header>
  );
}
