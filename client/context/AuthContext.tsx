import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  authFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ACCESS_KEY = "devnovate_access_token";

async function json<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error((data as any)?.error || "Request failed");
  return data as T;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem(ACCESS_KEY));
  const [loading, setLoading] = useState(true);

  const setAccess = useCallback((token: string | null) => {
    setAccessToken(token);
    if (token) localStorage.setItem(ACCESS_KEY, token);
    else localStorage.removeItem(ACCESS_KEY);
  }, []);

  const refresh = useCallback(async () => {
    // Uses refresh cookie; include credentials
    const res = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
    const data = await json<{ accessToken: string }>(res);
    setAccess(data.accessToken);
  }, [setAccess]);

  const fetchMe = useCallback(async (token: string | null) => {
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      const data = await json<{ user: User | null }>(res);
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (!accessToken) {
          // try refresh silently
          try {
            await refresh();
          } catch {
            // ignore
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []); // mount only

  useEffect(() => {
    fetchMe(accessToken);
  }, [accessToken, fetchMe]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await json<{ accessToken: string; user: User }>(res);
    setAccess(data.accessToken);
    setUser(data.user);
  }, [setAccess]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password }),
    });
    const data = await json<{ accessToken: string; user: User }>(res);
    setAccess(data.accessToken);
    setUser(data.user);
  }, [setAccess]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    setAccess(null);
  }, [setAccess]);

  const authFetch = useCallback(
    async (input: RequestInfo, init?: RequestInit) => {
      const doFetch = (token?: string | null) =>
        fetch(input, {
          ...(init || {}),
          headers: { ...(init?.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });

      let res = await doFetch(accessToken);
      if (res.status === 401) {
        try {
          await refresh();
          res = await doFetch(localStorage.getItem(ACCESS_KEY));
        } catch {
          // ignore; return original response
        }
      }
      return res;
    },
    [accessToken, refresh]
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, accessToken, loading, login, signup, logout, refresh, authFetch }),
    [user, accessToken, loading, login, signup, logout, refresh, authFetch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
