/**
 * Connection Status Badge
 * Shows the current sync status
 */

'use client';

type SyncStatusType = 'pending' | 'processing' | 'completed' | 'failed' | undefined;

interface ConnectionStatusProps {
  status: SyncStatusType;
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800 animate-pulse',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    undefined: 'bg-gray-100 text-gray-800',
  };

  const labels: Record<string, string> = {
    pending: 'Sync Queued',
    processing: 'Syncing...',
    completed: 'Up to Date',
    failed: 'Sync Failed',
    undefined: 'Not Connected',
  };

  const dotStyles: Record<string, string> = {
    pending: 'bg-yellow-600',
    processing: 'bg-blue-600 animate-ping',
    completed: 'bg-green-600',
    failed: 'bg-red-600',
    undefined: 'bg-gray-600',
  };

  const statusKey = status || 'undefined';

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles[statusKey]}`}
    >
      <span className={`w-2 h-2 mr-2 rounded-full ${dotStyles[statusKey]}`} />
      {labels[statusKey]}
    </span>
  );
}
