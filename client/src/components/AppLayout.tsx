import { Link, Outlet, useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isAdmin, signOut, useSession } from "../lib/auth-client";

export function AppLayout() {
  const { data: session } = useSession();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild className="font-semibold">
              <Link to="/">Helpdesk</Link>
            </Button>
            {isAdmin(session?.user.role) && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/users">Users</Link>
              </Button>
            )}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{session?.user.name}</span>
            <Badge variant="secondary">{session?.user.role}</Badge>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
