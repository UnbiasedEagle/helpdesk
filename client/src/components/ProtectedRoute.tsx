import { Navigate, Outlet, useLocation } from "react-router";
import { useSession } from "../lib/auth-client";

function FullPageMessage({ text }: { text: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
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

  if (adminOnly && session.user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
