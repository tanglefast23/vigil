/**
 * useLayoutMode Hook
 * Combines store preference with viewport detection via matchMedia
 * Breakpoint: 768px (Tailwind's md)
 */

import { useState, useEffect, useCallback } from 'react';
import { useLayoutStore, type LayoutMode } from '@/stores/layoutStore';
import { useIsMounted } from './useIsMounted';

const MOBILE_BREAKPOINT = 768;

interface UseLayoutModeReturn {
  /** Whether the current effective layout is mobile */
  isMobile: boolean;
  /** The user's layout mode preference (auto/mobile/desktop) */
  layoutMode: LayoutMode;
  /** Set the layout mode preference */
  setLayoutMode: (mode: LayoutMode) => void;
  /** Whether the component has mounted (for SSR safety) */
  isMounted: boolean;
  /** Whether the sidebar drawer is open */
  sidebarOpen: boolean;
  /** Toggle the sidebar drawer */
  toggleSidebar: () => void;
  /** Close the sidebar drawer */
  closeSidebar: () => void;
}

export function useLayoutMode(): UseLayoutModeReturn {
  const isMounted = useIsMounted();
  const { layoutMode, setLayoutMode, sidebarOpen, toggleSidebar, setSidebarOpen } = useLayoutStore();

  // Track viewport width for auto mode
  const [isViewportMobile, setIsViewportMobile] = useState(false);

  useEffect(() => {
    if (!isMounted) return;

    // Check initial viewport
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    setIsViewportMobile(mediaQuery.matches);

    // Listen for viewport changes
    const handleChange = (event: MediaQueryListEvent) => {
      setIsViewportMobile(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isMounted]);

  // Close sidebar when switching to desktop mode
  useEffect(() => {
    const effectiveIsMobile = layoutMode === 'auto'
      ? isViewportMobile
      : layoutMode === 'mobile';

    if (!effectiveIsMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [layoutMode, isViewportMobile, sidebarOpen, setSidebarOpen]);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, [setSidebarOpen]);

  // Calculate effective mobile state based on mode
  // Default to desktop during SSR to match server render
  const isMobile = isMounted
    ? layoutMode === 'auto'
      ? isViewportMobile
      : layoutMode === 'mobile'
    : false;

  return {
    isMobile,
    layoutMode,
    setLayoutMode,
    isMounted,
    sidebarOpen,
    toggleSidebar,
    closeSidebar,
  };
}
