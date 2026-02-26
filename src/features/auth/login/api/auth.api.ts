export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer" | string;
};

export async function sendCodeApi(phone: string) {
  const res = await fetch("/api/v1/users/sendcode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) throw new Error("Не удалось отправить код");
  return res.json();
}

export async function loginApi(phone: string, code: string): Promise<LoginResponse> {
  const res = await fetch("/api/v1/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code }),
  });
  if (!res.ok) throw new Error("Неверный код или ошибка входа");
  return res.json();
}

export async function refreshApi(refresh_token: string): Promise<LoginResponse> {
  const res = await fetch("/api/v1/users/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  });
  if (!res.ok) throw new Error("Refresh token недействителен");
  return res.json();
}