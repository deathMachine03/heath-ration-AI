import { tokenStorage } from "@/shared/lib/storage";
import { refreshApi } from "@/features/auth/login/api/auth.api";

export type HttpError = {
  status: number;
  message: string;
  details?: unknown;
};

let refreshPromise: Promise<string> | null = null;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function pickMessage(body: unknown, fallback: string): string {
  if (!isRecord(body)) return fallback;

  const m1 = body["message"];
  if (typeof m1 === "string" && m1.trim()) return m1;

  const m2 = body["Message"];
  if (typeof m2 === "string" && m2.trim()) return m2;

  return fallback;
}

async function parseError(res: Response): Promise<HttpError> {
  let body: unknown = null;

  try {
    body = await res.json();
  } catch {
    // ignore: not json
  }

  return {
    status: res.status,
    message: pickMessage(body, res.statusText || "Request failed"),
    details: body ?? null,
  };
}

async function getFreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  const refresh = tokenStorage.getRefresh();
  if (!refresh) {
    const err: HttpError = { status: 401, message: "No refresh token" };
    throw err;
  }

  refreshPromise = (async () => {
    const res = await refreshApi(refresh);
    tokenStorage.setTokens(res.access_token, res.refresh_token);
    return res.access_token;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const makeRequest = async (accessToken?: string) => {
    const headers: Record<string, string> = {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init.headers as Record<string, string> | undefined),
    };

    return fetch(path.startsWith("/api") ? path : `/api${path}`, { ...init, headers });
  };

  const access = tokenStorage.getAccess();
  let res = await makeRequest(access ?? undefined);

  if (res.status === 403) throw await parseError(res);

  if (res.status === 401) {
    try {
      const newAccess = await getFreshAccessToken();
      res = await makeRequest(newAccess);
    } catch {
      tokenStorage.clear();
      throw await parseError(res);
    }
  }

  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}