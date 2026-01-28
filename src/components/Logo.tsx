/**
 * Logo Component
 * HealthTrack brand logo with icon and text
 * Based on Pencil design: Logo
 */

import Link from 'next/link';

interface LogoProps {
  href?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { icon: 'w-6 h-6', iconFont: 'text-sm', text: 'text-sm' },
  md: { icon: 'w-8 h-8', iconFont: 'text-lg', text: 'text-lg' },
  lg: { icon: 'w-10 h-10', iconFont: 'text-xl', text: 'text-xl' },
};

export function Logo({ href = '/', showText = true, size = 'md' }: LogoProps) {
  const s = sizes[size];

  const content = (
    <div className="flex items-center gap-2.5">
      <div
        className={`
          ${s.icon}
          gradient-accent
          rounded-[var(--radius-md)]
          flex items-center justify-center
        `}
      >
        <span className={`icon-lucide ${s.iconFont} text-white`}>
          heart-pulse
        </span>
      </div>
      {showText && (
        <span
          className={`font-mono font-semibold ${s.text} text-white tracking-wide`}
        >
          HealthTrack
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
