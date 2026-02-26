export type User = {
  id: string;
  phone: string;
  name?: string | null;
  role: string;
  organization_id?: number | null;
  zone_restriction_mode?: string;
  allowed_zone_ids?: number[];
  blocked: boolean;
  created_at?: string;
  last_login_at?: string | null;
};

export type UsersListResponse = {
  success: boolean;
  total: number;
  users: User[];
};