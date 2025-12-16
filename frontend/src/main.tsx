import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./routes/AppRoutes";
import { ThemeProvider } from "./context/theme";
import { AuthRefreshProvider } from "./context/AuthRefreshProvider";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { refreshToken, getAccessToken } from "./lib/apiClient";

export function AuthInit({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Only attempt refresh if user has an access token (was previously logged in)
        if (getAccessToken()) {
          await refreshToken();
        }
      } catch (e) {
        // refresh failed: session cleared in refreshToken; continue to app as logged-out
        if (typeof e === "object" && e && (e as Error).message && window.console) {
          // console.debug("silent refresh failed:", (e as Error).message);
        }
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // render children even if not ready to avoid blocking UI; ready state mainly ensures refresh attempted
  return <>{ready ? children : children}</>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="dulo-theme">
      <BrowserRouter>
        <AuthInit>
          <AuthRefreshProvider>
            <AppRoutes />
          </AuthRefreshProvider>
        </AuthInit>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
