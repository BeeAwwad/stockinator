import { useState, useEffect, useRef } from "react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const delayRef = useRef(2000);
  const maxDelay = 30000;
  const timeoutMs = 3000;

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const checkConnection = async () => {
      const controller = new AbortController();
      const abortTimeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        await fetch("/ping.txt", {
          signal: controller.signal,
          cache: "no-store",
        });

        clearTimeout(abortTimeout);

        if (!isOnline) setIsOnline(true);

        delayRef.current = 2000;
      } catch (err) {
        clearTimeout(abortTimeout);
        console.error("Connection check failed:", err);
        if (isOnline) setIsOnline(false);

        delayRef.current = Math.min(delayRef.current * 2, maxDelay);
      }

      timeoutId = setTimeout(checkConnection, delayRef.current);
    };

    checkConnection();

    return () => clearTimeout(timeoutId);
  }, []);

  return isOnline;
}
