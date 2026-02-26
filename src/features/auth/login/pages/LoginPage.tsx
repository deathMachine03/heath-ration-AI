import { useNavigate, useLocation } from "react-router-dom";
import { LoginForm } from "../ui/LoginForm";
import { useAuth } from "../../../../app/providers/auth/useAuth";

type LocationState = {
  from?: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { setTokens } = useAuth();

  const state = location.state as LocationState | null;
  const redirectTo = state?.from ?? "/users";

return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-white mb-6 text-center">
          Admin Login
        </h1>

        <LoginForm
          onSuccess={(access, refresh) => {
            setTokens(access, refresh);
            navigate(redirectTo, { replace: true });
          }}
        />
      </div>
    </div>
  );
}