/**
 * Sync Button Component
 * Triggers manual data sync with Whoop
 */

'use client';

import { useState } from 'react';
import { triggerManualSync } from '../actions';
import { useRouter } from 'next/navigation';

interface SyncButtonProps {
  userId: string;
}

export function SyncButton({ userId }: SyncButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleSync() {
    setIsPending(true);
    setMessage(null);

    try {
      const result = await triggerManualSync(userId);

      if (result.success) {
        setMessage(result.message);
        // Refresh the page data
        router.refresh();
      } else {
        setMessage(result.message);
      }
    } catch {
      setMessage('Sync failed. Please try again.');
    } finally {
      setIsPending(false);
      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleSync}
        disabled={isPending}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Syncing...
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Sync Now
          </>
        )}
      </button>

      {message && (
        <div className="absolute top-full mt-2 right-0 bg-white shadow-lg rounded-lg p-3 text-sm max-w-xs z-10 border border-gray-200">
          {message}
        </div>
      )}
    </div>
  );
}
