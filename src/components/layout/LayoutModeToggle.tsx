/**
 * LayoutModeToggle Component
 * Dropdown with three options: Auto-detect, Mobile view, Desktop view
 * Shows current mode with icons (Monitor/Smartphone)
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import type { LayoutMode } from '@/stores/layoutStore';

interface LayoutModeToggleProps {
  currentMode: LayoutMode;
  isMobile: boolean;
  onModeChange: (mode: LayoutMode) => void;
}

const modeOptions: { value: LayoutMode; label: string; icon: string; description: string }[] = [
  {
    value: 'auto',
    label: 'Auto-detect',
    icon: 'monitor-smartphone',
    description: 'Adapts to your screen size',
  },
  {
    value: 'mobile',
    label: 'Mobile view',
    icon: 'smartphone',
    description: 'Always show mobile layout',
  },
  {
    value: 'desktop',
    label: 'Desktop view',
    icon: 'monitor',
    description: 'Always show desktop layout',
  },
];

export function LayoutModeToggle({ currentMode, isMobile, onModeChange }: LayoutModeToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const currentOption = modeOptions.find((opt) => opt.value === currentMode) || modeOptions[0];
  const effectiveIcon = isMobile ? 'smartphone' : 'monitor';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-secondary)] hover:text-white hover:border-[var(--border-default)] transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="icon-lucide text-base">{effectiveIcon}</span>
        <span className="hidden sm:inline">{currentOption.label}</span>
        <span className="icon-lucide text-xs text-[var(--text-muted)]">
          {isOpen ? 'chevron-up' : 'chevron-down'}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-56 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] shadow-lg overflow-hidden z-50"
          role="listbox"
        >
          {modeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onModeChange(option.value);
                setIsOpen(false);
              }}
              className={`
                w-full px-4 py-3 text-left flex items-start gap-3
                hover:bg-[var(--bg-interactive)] transition-colors
                ${currentMode === option.value ? 'bg-[var(--bg-interactive)]' : ''}
              `}
              role="option"
              aria-selected={currentMode === option.value}
            >
              <span
                className={`icon-lucide text-lg mt-0.5 ${
                  currentMode === option.value ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
                }`}
              >
                {option.icon}
              </span>
              <div>
                <div
                  className={`text-sm font-medium ${
                    currentMode === option.value ? 'text-white' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {option.label}
                </div>
                <div className="text-xs text-[var(--text-muted)]">{option.description}</div>
              </div>
              {currentMode === option.value && (
                <span className="icon-lucide text-[var(--accent)] ml-auto">check</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
