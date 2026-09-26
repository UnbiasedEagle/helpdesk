import { useCallback, useEffect, useState, type FormEvent } from "react";
import { authClient, useSession } from "../lib/auth-client";

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  banned: boolean | null;
  createdAt: Date;
};

const inputClass =
  "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none";

function fetchUsers() {
  return authClient.admin.listUsers({
    query: { sortBy: "createdAt", sortDirection: "desc", limit: 100 },
  });
}

function CreateAgentForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await authClient.admin.createUser({ name, email, password, role: "agent" });
    setSubmitting(false);
    if (error) {
      setError(error.message ?? "Could not create agent");
      return;
    }
    setName("");
    setEmail("");
    setPassword("");
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Create agent</h2>
      {error && (
        <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Name</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {submitting ? "Creating..." : "Create agent"}
      </button>
    </form>
  );
}

export function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const applyResult = useCallback((result: Awaited<ReturnType<typeof fetchUsers>>) => {
    setLoading(false);
    if (result.error) {
      setError(result.error.message ?? "Could not load users");
      return;
    }
    setUsers(result.data.users as ManagedUser[]);
  }, []);

  const loadUsers = useCallback(() => fetchUsers().then(applyResult), [applyResult]);

  useEffect(() => {
    fetchUsers().then(applyResult);
  }, [applyResult]);

  async function runAction(userId: string, action: () => Promise<{ error: { message?: string } | null }>) {
    setBusyId(userId);
    setError(null);
    const { error } = await action();
    setBusyId(null);
    if (error) setError(error.message ?? "Action failed");
    await loadUsers();
  }

  function toggleActive(user: ManagedUser) {
    return runAction(user.id, () =>
      user.banned
        ? authClient.admin.unbanUser({ userId: user.id })
        : authClient.admin.banUser({ userId: user.id, banReason: "Deactivated by admin" }),
    );
  }

  function resetPassword(user: ManagedUser) {
    const newPassword = window.prompt(`New password for ${user.email} (min 8 characters):`);
    if (!newPassword) return;
    return runAction(user.id, () => authClient.admin.setUserPassword({ userId: user.id, newPassword }));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Users</h1>

      <CreateAgentForm onCreated={loadUsers} />

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  No users yet.
                </td>
              </tr>
            )}
            {users.map((user) => {
              const isSelf = user.id === session?.user.id;
              const busy = busyId === user.id;
              return (
                <tr key={user.id}>
                  <td className="px-4 py-3 text-slate-900">{user.name}</td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3 text-slate-600">{user.role}</td>
                  <td className="px-4 py-3">
                    {user.banned ? (
                      <span className="rounded bg-red-50 px-2 py-0.5 text-xs text-red-700">Deactivated</span>
                    ) : (
                      <span className="rounded bg-green-50 px-2 py-0.5 text-xs text-green-700">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!isSelf && (
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={busy}
                          onClick={() => resetPassword(user)}
                          className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                        >
                          Reset password
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => toggleActive(user)}
                          className={`rounded-md px-2.5 py-1 text-xs disabled:opacity-50 ${
                            user.banned
                              ? "border border-green-300 text-green-700 hover:bg-green-50"
                              : "border border-red-300 text-red-700 hover:bg-red-50"
                          }`}
                        >
                          {user.banned ? "Reactivate" : "Deactivate"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
