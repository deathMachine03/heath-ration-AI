import { useMemo, useState } from "react";
import { requestSmsCode, loginWithCode } from "../../login/model/login.usecase";

type Step = "phone" | "code";

type Props = {
  onSuccess: (access: string, refresh: string) => void;
};

function normalizePhone(input: string): string {
  return input.replace(/[^\d+]/g, "");
}

export function LoginForm({ onSuccess }: Props) {
  const [step, setStep] = useState<Step>("phone");

  const [phone, setPhone] = useState("+7");
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSendCode = useMemo(() => {
    const p = normalizePhone(phone);
    return p.startsWith("+7") && p.length >= 12;
  }, [phone]);

  const canLogin = useMemo(() => {
    return /^\d{4,6}$/.test(code);
  }, [code]);

  async function handleSendCode() {
    setLoading(true);
    setError(null);

    try {
      await requestSmsCode(normalizePhone(phone));
      setStep("code");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Не удалось отправить код");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    setLoading(true);
    setError(null);

    try {
      const { access, refresh } = await loginWithCode(
        normalizePhone(phone),
        code
      );

      onSuccess(access, refresh);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {step === "phone" && (
        <>
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+77001234567"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 p-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            disabled={!canSendCode || loading}
            onClick={handleSendCode}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition"
          >
            {loading ? "Sending..." : "Send Code"}
          </button>
        </>
      )}

      {step === "code" && (
        <>
          <div className="text-sm text-zinc-400">
            Code sent to <span className="text-white">{phone}</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="1234"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 p-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("phone")}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 rounded-lg transition"
            >
              Change
            </button>

            <button
              disabled={!canLogin || loading}
              onClick={handleLogin}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}