/// const IS_LOCAL =
///  typeof window !== "undefined" && window.location.hostname === "localhost";
// Use Vite dev flag to route requests to the local dev proxy (`/api`) during development.
// This covers localhost and other local dev hosts when running `npm run dev`.
const isDev = typeof window !== "undefined" && !!((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV);
const ENV_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = isDev ? "/api" : ENV_BASE_URL;

function getAccessToken(): string | null {
  return localStorage.getItem("access_token");
}

function setAccessToken(token: string | null) {
  if (token) {
    localStorage.setItem("access_token", token);
    // Store token timestamp for auto-refresh logic
    localStorage.setItem("access_token_timestamp", Date.now().toString());
  } else {
    localStorage.removeItem("access_token");
    localStorage.removeItem("access_token_timestamp");
  }
}

// Mutex to prevent multiple simultaneous refresh attempts
let refreshPromise: Promise<string | null> | null = null;

async function refreshToken(): Promise<string | null> {
  // If a refresh is already in progress, return the existing promise
  if (refreshPromise) {
    if (isDev) console.debug("refreshToken: reusing existing refresh promise");
    return refreshPromise;
  }

  // Create new refresh promise
  refreshPromise = (async () => {
    try {
      // refresh-token is stored in cookie by server; include credentials
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
      });
      const text = await res.text().catch(() => "");
      let parsed: Record<string, unknown> | null = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch (e) {
        if (isDev) console.debug("refreshToken: failed to parse response body as JSON", e);
        parsed = null;
      }

      if (!res.ok) {
        const message = (parsed && (parsed.error || parsed.message)) || text || `Refresh failed (${res.status})`;
        // clear local session on refresh failure
        setAccessToken(null);
        try {
          localStorage.removeItem("current_user");
        } catch (e) {
          if (isDev) console.debug("refreshToken: failed to remove current_user", e);
        }
        if (isDev) console.debug("refreshToken failed", { status: res.status, message, body: text });
        // throw so callers know refresh failed explicitly
        throw new Error(String(message));
      }

      const data = parsed || (text ? JSON.parse(text) : null) || {};
      const token = data?.access_token || null;
      setAccessToken(token);
      return token;
    } finally {
      // Clear the promise after completion (success or failure)
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Check if token needs refresh (4 minutes since last refresh, giving 1 min buffer before 5 min expiry)
function shouldRefreshToken(): boolean {
  const timestamp = localStorage.getItem("access_token_timestamp");
  if (!timestamp) return false;
  const elapsed = Date.now() - parseInt(timestamp, 10);
  const fourMinutes = 4 * 60 * 1000;
  return elapsed >= fourMinutes;
}

type RequestOpts = RequestInit & { retry?: boolean };

export async function apiRequest(path: string, opts: RequestOpts = {}) {
  // Auto-refresh token if needed before making request
  if (shouldRefreshToken() && getAccessToken()) {
    try {
      if (isDev) console.debug("apiRequest: auto-refreshing token before request");
      await refreshToken();
    } catch (e) {
      if (isDev) console.debug("apiRequest: auto-refresh failed", e);
      // Continue with request anyway, 401 handler will catch it
    }
  }

  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const token = getAccessToken();
  const headers = new Headers(opts.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const options: RequestOpts = {
    // Include credentials by default to ensure cookies (refresh token) are sent
    credentials: (opts.credentials as RequestCredentials) ?? "include",
    ...opts,
    headers,
  };

  let res = await fetch(url, options);

  if (res.status === 401 && !opts.retry) {
    // try refresh once
    const newToken = await refreshToken();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      // mark that we've retried to avoid retry loops
      opts.retry = true;
      // omit the internal `retry` flag when calling fetch
      const { ...fetchOptions } = options;
      res = await fetch(url, { ...fetchOptions, headers });
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // try to extract readable message from JSON or fallback to raw text
    let message = "";
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (parsed && (parsed.error || parsed.message)) message = parsed.error || parsed.message;
        else if (typeof parsed === "string") message = parsed;
        else message = text;
      } catch {
        message = text;
      }
    }
    if (!message) message = `HTTP ${res.status} ${res.statusText}`;
    type ErrorWithBody = Error & { status?: number; body?: string };
    const err = new Error(String(message)) as ErrorWithBody;
    err.status = res.status;
    err.body = text;
    if (isDev) console.debug("apiRequest error", { url, status: res.status, message: err.message, body: text });
    throw err;
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return res;
}

export { BASE_URL, getAccessToken, setAccessToken, refreshToken, shouldRefreshToken };
