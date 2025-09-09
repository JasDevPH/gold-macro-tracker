import { useEffect, useRef } from "react";

interface UseAutoRefreshOptions {
  onRefresh: () => void;
  interval?: number; // in milliseconds
  scheduledTimes?: string[]; // HH:MM format in EST
  enabled?: boolean;
}

export function useAutoRefresh({
  onRefresh,
  interval,
  scheduledTimes,
  enabled = true,
}: UseAutoRefreshOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const scheduledRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Handle interval-based refresh (Yahoo, News)
    if (interval) {
      intervalRef.current = setInterval(() => {
        onRefresh();
      }, interval);
    }

    // Handle scheduled refresh (FRED, BLS)
    if (scheduledTimes) {
      const checkScheduledTime = () => {
        const now = new Date();
        const est = new Date(
          now.toLocaleString("en-US", { timeZone: "America/New_York" })
        );
        const currentTime = `${est.getHours().toString().padStart(2, "0")}:${est
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;

        if (scheduledTimes.includes(currentTime)) {
          onRefresh();
        }
      };

      // Check every minute for scheduled times
      scheduledRef.current = setInterval(checkScheduledTime, 60000);

      // Check immediately in case we're already at scheduled time
      checkScheduledTime();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (scheduledRef.current) clearInterval(scheduledRef.current);
    };
  }, [onRefresh, interval, scheduledTimes, enabled]);
}
