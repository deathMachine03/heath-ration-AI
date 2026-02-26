import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { RequireAuth } from "./RequireAuth";
import LoginPage from "../../features/auth/login/pages/LoginPage";
import UsersListPage from "../../features/users/pages/UsersListPage";
import UserCreatePage from "../../features/users/pages/UserCreatePage";


type LocationState = {
  from?: string;
};

function ForbiddenPage() {
  return <div style={{ padding: 16 }}>403 — Forbidden</div>;
}

export function AppRouter() {
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: LocationState | null;
  };

  const from = location.state?.from;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/" element={<Navigate to={from ?? "/login"} replace />} />
        <Route path="/users" element={<UsersListPage />} />
        <Route path="/users/new" element={<UserCreatePage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}