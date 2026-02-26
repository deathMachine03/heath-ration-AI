import { http } from "../../../shared/api/http";
import type { UsersListResponse } from "../model/types";
// import type { User } from "../model/types";

export type CreateUserDto = {
  phone: string;
  name?: string;
  role?: "user" | "admin" | "test";
  organization_id?: number;
  allowed_zone_ids?: number[];
  zone_restriction_mode?: "strict" | "extended";
};

export type CreateUserResponse = {
  success: boolean;
  user_id: string;
  phone: string;
  role: string;
  organization_id?: number;
  zone_restriction_mode: string;
};

export function createUser(dto: CreateUserDto) {
  return http<CreateUserResponse>("/api/v1/admin/users", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export type GetUsersParams = {
  skip: number;
  limit: number;
  // на будущее (если бек добавит):
  search?: string;
  role?: string;
  organization_id?: number;
};

function toQuery(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === "") return;
    q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function getUsers(params: GetUsersParams) {
  return http<UsersListResponse>(
    `/api/v1/admin/users${toQuery(params)}`
  );
}