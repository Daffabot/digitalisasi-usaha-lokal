import React, { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getStoredUser } from "../services/authService";
import { getAccessToken, refreshToken } from "../lib/apiClient";

function isAuthenticated() {
  return Boolean(getStoredUser() || getAccessToken());
}

export const Protected: React.FC = () => {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // First check if already authenticated
      if (isAuthenticated()) {
        if (mounted) {
          setAuthenticated(true);
          setChecking(false);
        }
        return;
      }

      // Try to refresh token before redirecting to login
      try {
        const token = await refreshToken();
        if (mounted) {
          setAuthenticated(Boolean(token));
        }
      } catch (err) {
        // console.debug("[RouteGuard] Token refresh failed, redirecting to login");
        if (mounted) {
          setAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setChecking(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-neutral-950">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export const Public: React.FC = () => {
  if (isAuthenticated()) return <Navigate to="/home" replace />;
  return <Outlet />;
};

export default { Protected, Public };
