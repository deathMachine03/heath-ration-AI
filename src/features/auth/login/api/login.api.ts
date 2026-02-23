import { http } from "../../../../shared/api/http";

export type LoginRequest = {
  phone: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
};

export function loginApi(dto: LoginRequest) {
  return http<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}