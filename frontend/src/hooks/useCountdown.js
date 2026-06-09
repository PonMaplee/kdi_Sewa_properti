import { useState, useEffect } from 'react';
import { getTimeRemaining } from '../utils/helpers';

/**
 * Hook untuk countdown timer real-time
 * @param {bigint|number} endTimestamp - Unix timestamp target (detik)
 * @returns {object} { days, hours, minutes, seconds, expired, totalSeconds }
 */
export function useCountdown(endTimestamp) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(endTimestamp));

  useEffect(() => {
    if (!endTimestamp || endTimestamp === 0n) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, totalSeconds: 0 });
      return;
    }

    const timer = setInterval(() => {
      const remaining = getTimeRemaining(endTimestamp);
      setTimeLeft(remaining);

      if (remaining.expired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTimestamp]);

  return timeLeft;
}
