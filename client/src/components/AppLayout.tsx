import { Link, Outlet, useNavigate } from "react-router";
import { signOut, useSession } from "../lib/auth-client";

export function AppLayout() {
  const { data: session } = useSession();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <nav className="flex items-center gap-6">
            <Link to="/" className="font-semibold text-slate-900">
              Helpdesk
            </Link>
            {session?.user.role === "admin" && (
              <Link to="/admin/users" className="text-sm text-slate-600 hover:text-slate-900">
                Users
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-600">
              {session?.user.name}{" "}
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                {session?.user.role}
              </span>
            </span>
            <button
              onClick={handleSignOut}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
