import { useEffect, useState } from "react";

export function HomePage() {
  const [status, setStatus] = useState<"checking" | "ok" | "error">("checking");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => (res.ok ? setStatus("ok") : setStatus("error")))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Helpdesk</h1>
        <p className="mt-2 text-sm text-slate-500">
          Server status:{" "}
          <span
            className={
              status === "ok"
                ? "text-green-600"
                : status === "error"
                  ? "text-red-600"
                  : "text-slate-400"
            }
          >
            {status}
          </span>
        </p>
      </div>
    </div>
  );
}
