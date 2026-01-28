/**
 * Button Component
 * Variants: primary (gradient), secondary (dark), ghost (transparent)
 * Based on Pencil design: Button/Primary, Button/Secondary, Button/Ghost
 */

import { type ReactNode, type ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: string;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'gradient-accent text-white hover:opacity-90',
  secondary:
    'bg-[var(--bg-elevated)] text-white border border-[var(--border-default)] hover:bg-[var(--bg-interactive)]',
  ghost:
    'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]',
};

const iconColors: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-[var(--text-tertiary)]',
  ghost: 'text-[var(--text-tertiary)]',
};

export function Button({
  variant = 'primary',
  icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        rounded-[var(--radius-md)] px-5 py-3
        text-sm font-medium
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {icon && (
        <span className={`icon-lucide text-lg ${iconColors[variant]}`}>
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}
