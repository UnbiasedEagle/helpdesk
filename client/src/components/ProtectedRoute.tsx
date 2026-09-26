import { Navigate, Outlet, useLocation } from "react-router";
import { isAdmin, useSession } from "../lib/auth-client";

function FullPageMessage({ text }: { text: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted text-sm text-muted-foreground">
      {text}
    </div>
  );
}

export function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { data: session, isPending } = useSession();
  const location = useLocation();

  if (isPending) return <FullPageMessage text="Loading..." />;

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && !isAdmin(session.user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
