import { sendCodeApi, loginApi } from "../api/auth.api";

export async function requestSmsCode(phone: string) {
  await sendCodeApi(phone);
}

export async function loginWithCode(phone: string, code: string) {
  const res = await loginApi(phone, code);
  return { access: res.access_token, refresh: res.refresh_token };
}