import { useState } from "react";
import { loginUseCase } from "../model/login.usecase";

type Props = {
  onSuccess: (token: string) => void;
};

export function LoginForm({ onSuccess }: Props) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await loginUseCase({ phone, password });
      onSuccess(token);
    } catch (e: any) {
      setError(e?.message ?? "Ошибка авторизации");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12, maxWidth: 360 }}>
      <label>
        Phone
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>

      <label>
        Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>

      {error ? <div style={{ color: "crimson" }}>{error}</div> : null}

      <button disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
    </form>
  );
}