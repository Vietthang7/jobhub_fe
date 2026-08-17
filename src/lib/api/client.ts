import { useAuthStore } from "@/lib/store/auth";

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public fields?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class RateLimitError extends Error {
  constructor(public retryAfter?: number) {
    super("Yêu cầu quá nhanh. Vui lòng thử lại sau.");
    this.name = "RateLimitError";
  }
}

const BASE_URL = "/api";

interface ApiFetchInit extends RequestInit {
  skipAuth?: boolean;
}

let refreshPromise: Promise<string> | null = null;

function clearAndLogout() {
  const { clear } = useAuthStore.getState();
  clear();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:logout"));
  }
}

async function refreshAccessToken(): Promise<string> {
  const { refreshToken, setSession } = useAuthStore.getState();
  if (!refreshToken) {
    clearAndLogout();
    throw new ApiError(401, "Phiên đăng nhập hết hạn");
  }

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    // Only clear session when the server explicitly rejects the refresh token
    // (4xx). Network errors / 5xx are transient — don't wipe the session.
    if (res.status >= 400 && res.status < 500) {
      clearAndLogout();
    }
    throw new ApiError(res.status, "Phiên đăng nhập hết hạn");
  }

  const data = await res.json();
  setSession(data);
  return data.accessToken as string;
}

async function handle401<T>(path: string, init?: ApiFetchInit): Promise<T> {
  refreshPromise ??= refreshAccessToken().finally(() => { refreshPromise = null; });
  try {
    const token = await refreshPromise;
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return apiFetch<T>(path, { ...init, headers, skipAuth: true });
  } catch {
    // refreshAccessToken already handled clear/logout if needed
    throw new ApiError(401, "Phiên đăng nhập hết hạn");
  }
}

export async function apiFetch<T>(
  path: string,
  init?: ApiFetchInit
): Promise<T> {
  const { skipAuth, ...rest } = init || {};
  const url = `${BASE_URL}${path}`;
  
  const headers = new Headers(rest.headers);
  if (!headers.has("Content-Type") && !(rest.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const { accessToken } = useAuthStore.getState();
  if (accessToken && !skipAuth) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(url, { ...rest, headers });

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    throw new RateLimitError(retryAfter ? parseInt(retryAfter, 10) : undefined);
  }

  if (response.status === 401 && !skipAuth && !path.includes("/auth/refresh")) {
    return handle401(path, init);
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new ApiError(response.status, "Đã có lỗi xảy ra");
    }

    // Mapping error shape
    const message = errorData.error || errorData.message || "Đã có lỗi xảy ra";
    const fields = errorData.fields || (typeof errorData === "object" ? errorData : undefined);
    
    throw new ApiError(response.status, message, fields);
  }

  if (response.status === 204) return {} as T;
  return response.json();
}
