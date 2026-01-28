/**
 * DashboardLayout Component
 * Client component wrapper for all dashboard pages
 * Coordinates sidebar state, header, and content margins
 */

'use client';

import { useLayoutMode } from '@/hooks/useLayoutMode';
import { ResponsiveSidebar } from './ResponsiveSidebar';
import { DashboardHeader } from './DashboardHeader';
import { MobileTabBar } from './MobileTabBar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
}

export function DashboardLayout({ children, userName, userEmail }: DashboardLayoutProps) {
  const {
    isMobile,
    layoutMode,
    setLayoutMode,
    isMounted,
    sidebarOpen,
    toggleSidebar,
    closeSidebar,
  } = useLayoutMode();

  // Render skeleton during SSR/hydration to prevent layout shift
  if (!isMounted) {
    return (
      <div className="flex h-screen bg-[var(--bg-page)]">
        {/* Desktop sidebar placeholder */}
        <div className="hidden md:block w-[var(--sidebar-width)] bg-[var(--bg-surface)] border-r-[3px] border-r-[var(--accent)]" />
        {/* Main content area */}
        <main className="flex-1 ml-0 md:ml-[var(--sidebar-width)]">
          <div className="flex flex-col gap-7 p-6 md:p-8 md:px-10">
            {/* Loading skeleton */}
            <div className="h-8 w-48 bg-[var(--bg-surface)] rounded animate-pulse" />
            <div className="h-32 bg-[var(--bg-surface)] rounded-[var(--radius-lg)] animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--bg-page)]">
      {/* Sidebar */}
      <ResponsiveSidebar
        userName={userName}
        userEmail={userEmail}
        isMobile={isMobile}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main content with offset for desktop sidebar */}
      <main
        className={`flex-1 overflow-auto transition-[margin] duration-300 ${
          isMobile ? 'ml-0' : 'ml-[var(--sidebar-width)]'
        }`}
      >
        {/* Header */}
        <DashboardHeader
          isMobile={isMobile}
          layoutMode={layoutMode}
          onMenuClick={toggleSidebar}
          onModeChange={setLayoutMode}
        />

        {/* Page content with padding for mobile tab bar */}
        <div className={isMobile ? 'pb-tab-bar' : ''}>
          {children}
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      {isMobile && <MobileTabBar />}
    </div>
  );
}
