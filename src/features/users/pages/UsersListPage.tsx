// src/features/users/pages/UsersListPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../api/users.api";
import type { User } from "../model/types";

type HttpErrorLike = { status?: number; message?: string };

export default function UsersListPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<User[]>([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<50 | 100 | 200 | 500>(50);

  const skip = useMemo(() => (page - 1) * limit, [page, limit]);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit],
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = await getUsers({ skip, limit });
      setItems(res.users);
      setTotal(res.total);
    } catch (e: unknown) {
      const err = e as HttpErrorLike;

      if (err?.status === 403) {
        navigate("/forbidden", { replace: true });
        return;
      }

      if (err?.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      setError(err?.message ?? "Не удалось загрузить пользователей");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, limit]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-semibold">Users</h1>
            <div className="text-sm text-zinc-400 mt-1">
              Total: <span className="text-zinc-200">{total}</span>
              {loading ? <span className="ml-2">(loading)</span> : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/users/new")}
              className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
            >
              Create user
            </button>

            <select
              value={limit}
              onChange={(e) => {
                setPage(1);
                setLimit(Number(e.target.value) as 50 | 100 | 200 | 500);
              }}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
            </select>

            <button
              disabled={!canPrev || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>

            <button
              disabled={!canNext || loading}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>

        <div className="text-sm text-zinc-400 mb-3">
          Page <span className="text-zinc-200">{page}</span> of{" "}
          <span className="text-zinc-200">{totalPages}</span> • skip{" "}
          <span className="text-zinc-200">{skip}</span> • limit{" "}
          <span className="text-zinc-200">{limit}</span>
        </div>

        {error ? (
          <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            {error}
          </div>
        ) : null}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900">
                <tr className="text-left text-zinc-400">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Org</th>
                  <th className="px-4 py-3">Blocked</th>
                </tr>
              </thead>

              <tbody>
                {items.map((u) => (
                  <tr key={u.id} className="border-t border-zinc-800">
                    <td className="px-4 py-3">{u.name ?? "-"}</td>
                    <td className="px-4 py-3">{u.phone}</td>
                    <td className="px-4 py-3">{u.role}</td>
                    <td className="px-4 py-3">{u.organization_id ?? "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          "inline-flex items-center px-2 py-1 rounded-md text-xs border",
                          u.blocked
                            ? "bg-red-500/10 text-red-200 border-red-500/20"
                            : "bg-emerald-500/10 text-emerald-200 border-emerald-500/20",
                        ].join(" ")}
                      >
                        {u.blocked ? "true" : "false"}
                      </span>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && !loading ? (
                  <tr>
                    <td className="px-4 py-6 text-zinc-400" colSpan={5}>
                      No users
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
