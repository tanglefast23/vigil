/**
 * useIsMounted Hook
 * Detects client-side hydration to prevent SSR/client mismatch
 * Returns false during SSR and initial render, true after hydration
 */

import { useState, useEffect } from 'react';

export function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}
