import React, { createContext, useContext, useEffect, useRef } from "react";
import { refreshToken, getAccessToken, shouldRefreshToken } from "../lib/apiClient";

const AuthRefreshContext = createContext<{ triggerRefresh: () => Promise<void> }>({
  triggerRefresh: async () => {},
});

export const useAuthRefresh = () => useContext(AuthRefreshContext);

export const AuthRefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const intervalRef = useRef<number | null>(null);

  const triggerRefresh = async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      if (shouldRefreshToken()) {
        // console.debug("[AuthRefresh] Triggering token refresh");
        await refreshToken();
        // console.debug("[AuthRefresh] Token refreshed successfully");
      }
    } catch (err) {
      // console.error("[AuthRefresh] Failed to refresh token:", err);
    }
  };

  useEffect(() => {
    // Check token every 2 minutes
    const checkInterval = 2 * 60 * 1000;

    const startRefreshInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = window.setInterval(() => {
        triggerRefresh();
      }, checkInterval);
    };

    // Initial check
    triggerRefresh();
    
    // Start interval
    startRefreshInterval();

    // Also refresh on visibility change (when user comes back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // console.debug("[AuthRefresh] Tab visible, checking token");
        triggerRefresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <AuthRefreshContext.Provider value={{ triggerRefresh }}>
      {children}
    </AuthRefreshContext.Provider>
  );
};
