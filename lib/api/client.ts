export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

export async function apiFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      credentials: "include",
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage =
        body.message || body.error || `Request failed with status ${res.status}`;
      
      // Global 401 redirect to login if business token expired (except for public routes)
      if (res.status === 401 && typeof window !== "undefined" && !window.location.pathname.startsWith("/join/")) {
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }

      return {
        error: errorMessage,
        status: res.status,
      };
    }

    return {
      data: body as T,
      status: res.status,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error. Please try again.";
    return {
      error: message,
      status: 0,
    };
  }
}
