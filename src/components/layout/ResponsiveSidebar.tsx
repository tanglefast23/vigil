/**
 * ResponsiveSidebar Component
 * Desktop: Fixed sidebar (always visible)
 * Mobile: Slide-in drawer with dark overlay
 * Handles close on navigation, escape key, overlay click
 */

'use client';

import { useEffect, useCallback } from 'react';
import { SidebarContent } from './SidebarContent';

interface ResponsiveSidebarProps {
  userName?: string;
  userEmail?: string;
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function ResponsiveSidebar({
  userName,
  userEmail,
  isMobile,
  isOpen,
  onClose,
}: ResponsiveSidebarProps) {
  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }

    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isMobile, isOpen]);

  // Add escape key listener
  useEffect(() => {
    if (isMobile) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isMobile, handleKeyDown]);

  // Desktop: Fixed sidebar
  if (!isMobile) {
    return (
      <aside className="fixed top-0 left-0 h-screen w-[var(--sidebar-width)] bg-[var(--bg-surface)] border-r-[3px] border-r-[var(--accent)] z-40">
        <SidebarContent userName={userName} userEmail={userEmail} />
      </aside>
    );
  }

  // Mobile: Slide-in drawer with overlay
  return (
    <>
      {/* Overlay */}
      <div
        className={`
          fixed inset-0 bg-black/60 z-40
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-[var(--sidebar-width)]
          bg-[var(--bg-surface)] border-r-[3px] border-r-[var(--accent)]
          z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-interactive)] transition-colors z-10"
          aria-label="Close menu"
        >
          <span className="icon-lucide text-lg">x</span>
        </button>

        <SidebarContent
          userName={userName}
          userEmail={userEmail}
          onNavigate={onClose}
        />
      </aside>
    </>
  );
}
