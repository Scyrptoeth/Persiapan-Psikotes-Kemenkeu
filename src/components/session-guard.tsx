"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SessionGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    const supabase = createSupabaseBrowserClient();

    async function checkSession() {
      const response = await fetch("/api/session/status", { cache: "no-store" });
      if (cancelled || response.ok) {
        return;
      }

      await supabase.auth.signOut();
      router.replace(`/login?reason=session-expired&from=${encodeURIComponent(pathname)}`);
    }

    checkSession();
    const interval = window.setInterval(checkSession, 15_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [pathname, router]);

  return null;
}

