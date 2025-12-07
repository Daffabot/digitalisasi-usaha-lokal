import { apiRequest, setAccessToken, BASE_URL } from "../lib/apiClient";

type LoginBody = { users: string; password: string };

function extractMessageFromBody(bodyText: string): string | null {
  if (!bodyText) return null;
  const trimmed = bodyText.trim();
  // try parse JSON
  try {
    const parsed = JSON.parse(trimmed);
    if (!parsed) return null;
    if (typeof parsed === "string") {
      // sometimes body is a JSON string containing JSON
      try {
        const parsed2 = JSON.parse(parsed);
        if (parsed2 && (parsed2.error || parsed2.message))
          return String(parsed2.error || parsed2.message);
      } catch {
        // ignore nested parse error
      }
      return parsed;
    }
    if (typeof parsed === "object") {
      if (parsed.error) return String(parsed.error);
      if (parsed.message) return String(parsed.message);
      // if object has single primitive value, try to find it
      const vals = Object.values(parsed).filter((v) => typeof v === "string");
      if (vals.length === 1) return String(vals[0]);
    }
  } catch {
    // not valid JSON, fallthrough to regex
  }

  // fallback: try regex to extract "error" or "message"
  const m = trimmed.match(/"(?:error|message)"\s*:\s*"([^"]+)"/i);
  if (m && m[1]) return m[1];

  // lastly, if it looks like a JSON object, remove braces
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed.replace(/^{\s*|\s*}$/g, "").trim();
  }

  return trimmed || null;
}

export async function login(users: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ users, password } as LoginBody),
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    const msg = extractMessageFromBody(bodyText || "");
    if (msg) throw new Error(msg);
    throw new Error(`Login failed (${res.status})`);
  }

  const data = await res.json();
  if (data?.access_token) setAccessToken(data.access_token);
  // persist small user profile to avoid repeated profile calls from UI
  try {
    if (data?.user) {
      localStorage.setItem("current_user", JSON.stringify(data.user));
    }
  } catch {
    // ignore storage errors
  }
  return data;
}

export async function register(payload: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    const msg = extractMessageFromBody(bodyText || "");
    if (msg) throw new Error(msg);
    throw new Error(`Register failed (${res.status})`);
  }
  return res.json();
}

export async function logout() {
  try {
    await apiRequest(`/auth/logout`, { method: "POST", credentials: "include" });
  } finally {
    setAccessToken(null);
    try {
      localStorage.removeItem("current_user");
    } catch (err) {
      void err;
    }
  }
}

export function getStoredUser(): {
  id?: number;
  full_name?: string;
  username?: string;
  email?: string;
} | null {
  try {
    const raw = localStorage.getItem("current_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearStoredUser() {
  try {
    localStorage.removeItem("current_user");
  } catch {
    // ignore storage errors
  }
}

export async function resendVerification(email: string) {
  // expects body: { email }
  const res = await apiRequest(`/auth/resend-verification`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res;
}
