import { useState, useEffect } from "react";
import { timeAgo } from "@/lib/utils";

export function useTimeAgo(dateString: string | undefined) {
  const [timeAgoText, setTimeAgoText] = useState("");

  useEffect(() => {
    if (!dateString) return;

    const updateTimeAgo = () => {
      setTimeAgoText(timeAgo(dateString));
    };

    // Initial update
    updateTimeAgo();

    // Update every 30 seconds
    const interval = setInterval(updateTimeAgo, 30000);

    return () => clearInterval(interval);
  }, [dateString]);

  return timeAgoText;
}
