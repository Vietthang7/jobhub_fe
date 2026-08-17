"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Role } from "@/lib/api/schema";
import { useAuthStore } from "@/lib/store/auth";
import { apiFetch } from "@/lib/api/client";

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

/**
 * Try a lightweight authenticated request to force a token refresh if the
 * current access token has expired.  If the refresh succeeds `apiFetch`
 * updates the store automatically.  The call is intentionally cheap — the
 * backend returns 200 with a tiny JSON body.
 */
async function trySilentRefresh(): Promise<boolean> {
  try {
    // Use a light endpoint; 401 triggers the automatic refresh inside apiFetch
    await apiFetch("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: useAuthStore.getState().refreshToken }),
    });
    return true;
  } catch {
    return false;
  }
}

export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, accessToken } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [hydrated, setHydrated] = useState(
    () => useAuthStore.persist?.hasHydrated?.() ?? false
  );
  const refreshAttempted = useRef(false);

  useEffect(() => {
    if (useAuthStore.persist?.hasHydrated?.() ?? false) {
      setHydrated(true);
    }
    const unsub = useAuthStore.persist?.onFinishHydration?.(() => setHydrated(true));
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  useEffect(() => {
    // Wait for store rehydration before validating auth state
    if (!hydrated) return;

    if (!accessToken || !user) {
      // Deliberate logout — the logout handler already showed a success toast.
      const { loggingOut, refreshToken } = useAuthStore.getState();
      if (loggingOut) {
        router.replace("/");
        return;
      }

      // Before redirecting, try a silent refresh if a refresh token exists
      if (refreshToken && !refreshAttempted.current) {
        refreshAttempted.current = true;
        trySilentRefresh().then((ok) => {
          if (!ok) {
            toast.error("Vui lòng đăng nhập để tiếp tục", { id: "auth-required" });
            router.replace(`/login?next=${encodeURIComponent(pathname)}`);
          }
          // If ok, the store was updated → this effect will re-run with a valid accessToken
        });
        return;
      }

      toast.error("Vui lòng đăng nhập để tiếp tục", { id: "auth-required" });
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const hasAllowedRole = allowedRoles.some((role) => user.roles.includes(role));
      if (!hasAllowedRole) {
        toast.error("Bạn không có quyền truy cập", { id: "auth-forbidden" });
        router.replace("/");
        return;
      }
    }

    // Reset for next mount
    refreshAttempted.current = false;
    setIsAuthorized(true);
  }, [hydrated, accessToken, user, allowedRoles, router, pathname]);

  if (!hydrated || !isAuthorized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white text-muted-foreground">
        <div className="flex items-center gap-3 text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
