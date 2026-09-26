import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient, useSession } from "../lib/auth-client";
import { Role } from "../lib/permissions";

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  banned: boolean | null;
  createdAt: Date;
};

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
    const { error } = await authClient.admin.createUser({ name, email, password, role: Role.Agent });
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
    <Card>
      <CardHeader>
        <CardTitle>Create agent</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Name</Label>
              <Input id="agent-name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-email">Email</Label>
              <Input
                id="agent-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-password">Password</Label>
              <Input
                id="agent-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create agent"}
          </Button>
        </form>
      </CardContent>
    </Card>
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
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    return runAction(user.id, async () => {
      const result = await authClient.admin.setUserPassword({ userId: user.id, newPassword });
      if (result.error) return result;
      // Sign the user out everywhere so the old password's sessions don't linger.
      return authClient.admin.revokeUserSessions({ userId: user.id });
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Users</h1>

      <CreateAgentForm onCreated={loadUsers} />

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                  No users yet.
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => {
              const isSelf = user.id === session?.user.id;
              const busy = busyId === user.id;
              return (
                <TableRow key={user.id}>
                  <TableCell className="px-4 font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-muted-foreground">{user.role}</TableCell>
                  <TableCell>
                    {user.banned ? (
                      <Badge variant="destructive">Deactivated</Badge>
                    ) : (
                      <Badge variant="secondary">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-4 text-right">
                    {!isSelf && (
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" disabled={busy} onClick={() => resetPassword(user)}>
                          Reset password
                        </Button>
                        <Button
                          variant={user.banned ? "outline" : "destructive"}
                          size="sm"
                          disabled={busy}
                          onClick={() => toggleActive(user)}
                        >
                          {user.banned ? "Reactivate" : "Deactivate"}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
