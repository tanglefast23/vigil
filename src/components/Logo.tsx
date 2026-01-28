/**
 * Logo Component
 * Rdy Vigil brand logo with eye icon and split-color text
 * Based on Pencil design: Logo/Primary
 */

import Link from 'next/link';

interface LogoProps {
  href?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { icon: 'w-6 h-6', iconFont: 'text-sm', text: 'text-sm', gap: 'gap-2' },
  md: { icon: 'w-8 h-8', iconFont: 'text-lg', text: 'text-lg', gap: 'gap-2.5' },
  lg: { icon: 'w-10 h-10', iconFont: 'text-xl', text: 'text-xl', gap: 'gap-3' },
};

export function Logo({ href = '/', showText = true, size = 'md' }: LogoProps) {
  const s = sizes[size];

  const content = (
    <div className={`flex items-center ${s.gap}`}>
      <div
        className={`
          ${s.icon}
          gradient-accent
          rounded-[var(--radius-md)]
          flex items-center justify-center
        `}
      >
        <span className={`icon-lucide ${s.iconFont} text-white`}>
          eye
        </span>
      </div>
      {showText && (
        <span className={`font-mono font-semibold ${s.text} tracking-wide`}>
          <span className="text-white">Rdy</span>
          <span className="text-[var(--accent)]">Vigil</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
