import { useState, useCallback } from 'react';

/**
 * Sakhi Bazaar - Production Action Debounce Hook
 * Prevents rapid double-clicks, duplicate API submissions, and state race conditions.
 */
export const useDebounceAction = (actionCallback, delay = 1000) => {
  const [isDebouncing, setIsDebouncing] = useState(false);

  const debouncedExecute = useCallback(
    async (...args) => {
      if (isDebouncing) return;
      setIsDebouncing(true);
      try {
        await actionCallback(...args);
      } finally {
        setTimeout(() => {
          setIsDebouncing(false);
        }, delay);
      }
    },
    [actionCallback, delay, isDebouncing]
  );

  return [debouncedExecute, isDebouncing];
};

export default useDebounceAction;
