/**
 * Layout Store
 * Zustand store with localStorage persistence for layout mode preference
 * Supports three modes: auto (viewport detection), mobile, desktop (forced)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LayoutMode = 'auto' | 'mobile' | 'desktop';

interface LayoutState {
  /** User's layout mode preference */
  layoutMode: LayoutMode;
  /** Whether the mobile sidebar drawer is open */
  sidebarOpen: boolean;
  /** Set the layout mode preference */
  setLayoutMode: (mode: LayoutMode) => void;
  /** Toggle sidebar open/closed */
  toggleSidebar: () => void;
  /** Set sidebar open state directly */
  setSidebarOpen: (open: boolean) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      layoutMode: 'auto',
      sidebarOpen: false,
      setLayoutMode: (mode) => set({ layoutMode: mode }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'health-tracker-layout',
      // Only persist layoutMode, not sidebar state
      partialize: (state) => ({ layoutMode: state.layoutMode }),
    }
  )
);
