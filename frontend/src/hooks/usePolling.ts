import { useState, useEffect, useCallback, useRef } from 'react';

interface PollingConfig {
  interval: number;
  enabled?: boolean;
  backoffFactor?: number;
  maxBackoff?: number;
}

export const usePolling = (
  callback: () => Promise<void>,
  config: PollingConfig
) => {
  const [isPolling, setIsPolling] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const currentIntervalRef = useRef(config.interval);
  const { enabled = true, backoffFactor = 2, maxBackoff = 300000 } = config;

  const startPolling = useCallback(() => {
    setIsPolling(true);
  }, []);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (!isPolling || !enabled) {
      return;
    }

    const poll = async () => {
      try {
        await callback();
        // Reset interval on success
        currentIntervalRef.current = config.interval;
      } catch (error) {
        // Increase interval on error using backoff
        currentIntervalRef.current = Math.min(
          currentIntervalRef.current * backoffFactor,
          maxBackoff
        );
      } finally {
        if (isPolling && enabled) {
          timeoutRef.current = setTimeout(poll, currentIntervalRef.current);
        }
      }
    };

    poll();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [callback, isPolling, enabled, config.interval, backoffFactor, maxBackoff]);

  return {
    isPolling,
    startPolling,
    stopPolling,
  };
}; 