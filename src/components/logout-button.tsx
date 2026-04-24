"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LogoutButton() {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setIsPending(true);
    const supabase = createSupabaseBrowserClient();
    await fetch("/api/session/logout", { method: "POST" });
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <button className="rough-button" onClick={handleLogout} disabled={isPending} type="button">
      <LogOut aria-hidden="true" size={18} /> Keluar
    </button>
  );
}

