import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../api/users.api";

type Role = "user" | "admin" | "test";
type Mode = "strict" | "extended";

function normalizePhone(input: string): string {
  return input.replace(/[^\d+]/g, "");
}

type ApiError = { status?: number; message?: string; details?: unknown };

export default function UserCreatePage() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("+7");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [mode, setMode] = useState<Mode>("strict");

  const [organizationId, setOrganizationId] = useState<string>(""); // строка для инпута
  const [zoneIds, setZoneIds] = useState<string>(""); // "1,2,3"

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isStrict = mode === "strict" && role !== "admin"; // admin всё равно extended на сервере
  const orgRequired = isStrict;

  const parsedOrgId = useMemo(() => {
    const v = organizationId.trim();
    if (!v) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }, [organizationId]);

  const parsedZoneIds = useMemo(() => {
    const raw = zoneIds.trim();
    if (!raw) return undefined;
    const ids = raw
      .split(",")
      .map((x) => Number(x.trim()))
      .filter((n) => Number.isFinite(n));
    return ids.length ? ids : undefined;
  }, [zoneIds]);

  const canSubmit = useMemo(() => {
    const p = normalizePhone(phone);
    if (!p.startsWith("+7") || p.length < 12) return false;
    if (name.length > 100) return false;
    if (orgRequired && !parsedOrgId) return false;
    return true;
  }, [phone, name, orgRequired, parsedOrgId]);

  function mapCreateUserError(e: unknown): string {
    const err = e as ApiError;
    if (err?.status === 409) return "Пользователь с таким номером уже существует (409).";
    if (err?.status === 400) return "Некорректные данные (400). Проверьте роль/режим/имя.";
    if (err?.status === 404) return "Организация или зона не найдены (404).";
    if (err?.status === 403) return "Зона принадлежит другой организации при strict (403).";
    if (err?.status === 401) return "Не авторизован (401).";
    return err?.message ?? "Не удалось создать пользователя.";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const dto = {
        phone: normalizePhone(phone),
        ...(name.trim() ? { name: name.trim() } : {}),
        role,
        zone_restriction_mode: mode,
        ...(parsedOrgId ? { organization_id: parsedOrgId } : {}),
        ...(parsedZoneIds ? { allowed_zone_ids: parsedZoneIds } : {}),
      };

      const res = await createUser(dto);

      // после создания — обратно в список
      navigate("/users", { replace: true });

      // если нужно — можно показывать toast/notification:
      // res.user_id полезен для логов/уведомления
      void res;
    } catch (e2: unknown) {
      setError(mapCreateUserError(e2));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Create user</h1>
            <div className="text-sm text-zinc-400 mt-1">
              POST /api/v1/admin/users
            </div>
          </div>

          <button
            onClick={() => navigate("/users")}
            className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
          >
            Back
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5"
        >
          {error ? (
            <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              {error}
            </div>
          ) : null}

          <div className="grid gap-2">
            <label className="text-sm text-zinc-400">Phone *</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+77001234567"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-zinc-400">Name (max 100)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Айгуль Сейткали"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="text-xs text-zinc-500">
              {name.length}/100
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm text-zinc-400">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
                <option value="test">test</option>
              </select>
              <div className="text-xs text-zinc-500">
                admin на сервере получает extended автоматически
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-zinc-400">Zone restriction mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as Mode)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="strict">strict</option>
                <option value="extended">extended</option>
              </select>
              <div className="text-xs text-zinc-500">
                strict → нужен organization_id (кроме роли admin)
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm text-zinc-400">
                Organization ID {orgRequired ? "*" : ""}
              </label>
              <input
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                placeholder="1"
                inputMode="numeric"
                className={[
                  "w-full bg-zinc-800 border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2",
                  orgRequired ? "border-zinc-700 focus:ring-indigo-500" : "border-zinc-800 focus:ring-indigo-500",
                ].join(" ")}
              />
              {orgRequired ? (
                <div className="text-xs text-zinc-500">
                  Обязателен при strict (и если роль не admin)
                </div>
              ) : null}
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-zinc-400">Allowed zone IDs</label>
              <input
                value={zoneIds}
                onChange={(e) => setZoneIds(e.target.value)}
                placeholder="1,2,3"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="text-xs text-zinc-500">
                Введите через запятую (пример: 1,2)
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/users")}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="ml-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}