import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse, Role } from "@/lib/api/schema";

interface AuthUser {
  id: number;
  email: string;
  roles: Role[];
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  /** True when the user clicked "Đăng xuất" — suppresses duplicate toasts. */
  loggingOut: boolean;
  setSession: (response: AuthResponse) => void;
  clear: () => void;
  logout: () => void;
  hasRole: (role: Role) => boolean;
  isAuthenticated: boolean;
}

const AUTH_COOKIE_NAME = "jobhub_authed";
const AUTH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

function setAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; max-age=${AUTH_COOKIE_MAX_AGE}`;
}

function removeAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
}

/**
 * NOTE (Security/XSS risk): This store persists tokens to localStorage
 * for MVP simplicity. This is vulnerable to XSS token theft. Production
 * should migrate to httpOnly cookies set by a BFF layer, or at minimum
 * add strict CSP + sanitization to mitigate XSS surface.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      loggingOut: false,
      setSession: (response) => {
        set({
          accessToken: response.accessToken,
          isAuthenticated: true,
          loggingOut: false,
          refreshToken: response.refreshToken,
          user: {
            id: response.userId,
            email: response.email,
            roles: response.roles,
          },
        });
        setAuthCookie();
      },
      clear: () => {
        set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false });
        removeAuthCookie();
      },
      /** Intentional logout — sets flag so RequireAuth / auth:logout skip their toasts. */
      logout: () => {
        set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false, loggingOut: true });
        removeAuthCookie();
      },
      hasRole: (role) => get().user?.roles.includes(role) ?? false,
      isAuthenticated: false,
    }),
    {
      name: "jobhub:auth",
    }
  )
);
