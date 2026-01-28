/**
 * FeatureCard Component
 * Feature showcase card with icon, title, and description
 * Based on Pencil design: Card/Feature
 */

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  iconColor?: string;
  iconBgColor?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  iconColor = 'var(--accent)',
  iconBgColor = 'var(--accent-tint)',
}: FeatureCardProps) {
  return (
    <div
      className="
        flex flex-col gap-4
        bg-[var(--bg-surface)]
        border border-[var(--border-subtle)]
        rounded-[var(--radius-xl)]
        p-6
        flex-1
      "
    >
      <div
        className="
          w-12 h-12
          flex items-center justify-center
          rounded-[var(--radius-lg)]
        "
        style={{ backgroundColor: iconBgColor }}
      >
        <span className="icon-lucide text-2xl" style={{ color: iconColor }}>
          {icon}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
