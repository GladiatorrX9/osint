"use client";

import { useEffect, useRef, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";

interface SessionTimeoutProps {
  timeoutMinutes?: number;
  warningMinutes?: number;
}

export function SessionTimeout({
  timeoutMinutes = 2, // 2 minutes default
  warningMinutes = 0.5, // 30 seconds warning
}: SessionTimeoutProps) {
  const { data: session } = useSession();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);

  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = warningMinutes * 60 * 1000;

  const handleLogout = useCallback(() => {
    console.log("⏰ Session timeout - logging out due to inactivity");
    toast.error("Session expired due to inactivity", {
      duration: 3000,
    });
    signOut({ callbackUrl: "/login?timeout=true" });
  }, []);

  const showWarning = useCallback(() => {
    if (!warningShownRef.current) {
      console.log("⚠️ Inactivity warning - 30 seconds until logout");
      toast.warning(
        `You will be logged out in ${
          warningMinutes * 60
        } seconds due to inactivity`,
        {
          duration: warningMs,
          action: {
            label: "I'm here",
            onClick: () => {
              console.log("👆 User acknowledged warning");
              resetTimer();
            },
          },
        }
      );
      warningShownRef.current = true;
    }
  }, [warningMinutes, warningMs]);

  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    // Reset warning flag
    warningShownRef.current = false;

    // Set warning timer (timeout - warning time)
    warningRef.current = setTimeout(() => {
      showWarning();
    }, timeoutMs - warningMs);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, timeoutMs);

    console.log(
      `🔄 Activity detected - timer reset (${timeoutMinutes} min until logout)`
    );
  }, [timeoutMs, warningMs, timeoutMinutes, handleLogout, showWarning]);

  useEffect(() => {
    // Only activate if user is logged in
    if (!session) {
      return;
    }

    console.log(
      `⏱️ Session timeout active: ${timeoutMinutes} minutes of inactivity`
    );

    // Events that indicate user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Reset timer on any user activity
    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    // Start the initial timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
    };
  }, [session, resetTimer, timeoutMinutes]);

  return null; // This component doesn't render anything
}
