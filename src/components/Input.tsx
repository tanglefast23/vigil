/**
 * Input Component
 * Labeled input field with optional icon
 * Based on Pencil design: Input/Field
 */

import { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
}

export function Input({
  label,
  icon,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-xs font-medium text-[var(--text-tertiary)]">
          {label}
        </label>
      )}
      <div
        className={`
          flex items-center gap-3
          bg-[var(--bg-surface)]
          border border-[var(--border-default)]
          rounded-[var(--radius-md)]
          px-4 py-3.5
          focus-within:border-[var(--accent)]
          transition-colors
          ${className}
        `}
      >
        {icon && (
          <span className="icon-lucide text-lg text-[var(--text-muted)]">
            {icon}
          </span>
        )}
        <input
          className="
            flex-1 bg-transparent
            text-sm text-[var(--text-primary)]
            placeholder:text-[var(--text-placeholder)]
            outline-none
          "
          {...props}
        />
      </div>
    </div>
  );
}
