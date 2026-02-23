import { loginApi, type LoginRequest } from "../api/login.api";

export async function loginUseCase(dto: LoginRequest) {
  const res = await loginApi(dto);
  return res.access_token;
}