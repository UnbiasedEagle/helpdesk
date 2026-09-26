import { useSession } from "../lib/auth-client";

export function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">
        Welcome, {session?.user.name}
      </h1>
      <p className="mt-2 text-sm text-slate-500">Tickets will appear here.</p>
    </div>
  );
}
