/**
 * Test Data Banner Component
 * Shows a notice when viewing sample/demo data
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function TestDataBanner() {
  const [isClearing, setIsClearing] = useState(false);
  const router = useRouter();

  const clearTestData = async () => {
    if (!confirm('Are you sure you want to clear all sample data?')) {
      return;
    }

    setIsClearing(true);
    try {
      await fetch('/api/seed-test-data', { method: 'DELETE' });
      router.refresh();
    } catch (error) {
      console.error('Failed to clear test data:', error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800">
            Demo Mode - Viewing Sample Data
          </h3>
          <p className="mt-1 text-sm text-amber-700">
            You&apos;re viewing randomly generated sample data. Connect your Whoop
            account to see your real health metrics.
          </p>
        </div>
        <button
          onClick={clearTestData}
          disabled={isClearing}
          className="flex-shrink-0 text-sm text-amber-800 hover:text-amber-900 underline disabled:opacity-50"
        >
          {isClearing ? 'Clearing...' : 'Clear sample data'}
        </button>
      </div>
    </div>
  );
}
