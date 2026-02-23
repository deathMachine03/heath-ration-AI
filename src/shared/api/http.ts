import { tokenStorage } from "../lib/storage";

export type HttpError = {
  status: number;
  message: string;
  details?: unknown;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function parseError(res: Response): Promise<HttpError> {
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    // ignore
  }

  return {
    status: res.status,
    message: body?.message || body?.Message || res.statusText || "Request failed",
    details: body ?? null,
  };
}

export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}