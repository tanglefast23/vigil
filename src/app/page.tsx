/**
 * Home Page
 * Landing page with links to login/signup
 */

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Track Your Health
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Connect your Whoop to visualize recovery trends, monitor sleep
            quality, and optimize your training load.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/signup"
              className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700"
            >
              Sign in <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <FeatureCard
            title="Recovery Tracking"
            description="See your daily recovery score and HRV trends to know when to push hard or rest."
            icon="💚"
          />
          <FeatureCard
            title="Sleep Analysis"
            description="Understand your sleep stages, consistency, and how it impacts your performance."
            icon="🌙"
          />
          <FeatureCard
            title="Strain Monitoring"
            description="Track workout strain and correlate it with recovery for optimal training."
            icon="🔥"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}
