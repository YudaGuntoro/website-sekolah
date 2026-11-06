"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { hasValidAuthSession } from "./auth";

export function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [error, setError] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const nextPath = pathname || "/";

    let active = true;
    void hasValidAuthSession().then(valid => {
      if (!active) return;
      setError(false);
      setIsAuthorized(valid);
      if (!valid) router.replace(`/signin?next=${encodeURIComponent(nextPath)}`);
    }).catch(() => { if (active) { setIsAuthorized(false); setError(true); } });
    return () => { active = false; };

  }, [pathname, router]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-400">
        {error ? <div role="alert">Sesi tidak dapat diperiksa. <button className="underline" onClick={() => window.location.reload()}>Coba lagi</button></div> : "Memeriksa sesi?"}
      </div>
    );
  }

  return children;
}
