"use client";

import { KeyRound, LogIn, Smartphone } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { phoneToAuthEmail } from "@/lib/auth-identity";
import { normalizePhone } from "@/lib/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const reason = useMemo(() => params.get("reason"), [params]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const normalizedPhone = normalizePhone(phone);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: phoneToAuthEmail(normalizedPhone),
      password,
    });

    if (signInError || !data.session) {
      setError(signInError?.message ?? "Login gagal.");
      setIsPending(false);
      return;
    }

    const response = await fetch("/api/session/register", {
      method: "POST",
      headers: {
        authorization: `Bearer ${data.session.access_token}`,
      },
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      await supabase.auth.signOut();
      setError(payload?.error ?? "Akun belum dapat digunakan.");
      setIsPending(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      {reason === "session-expired" && (
        <div className="alert">Sesi Anda sudah digantikan oleh login terbaru atau dinonaktifkan.</div>
      )}
      {error && <div className="alert">{error}</div>}

      <div className="field">
        <label htmlFor="phone">
          <Smartphone aria-hidden="true" size={18} /> Nomor WhatsApp
        </label>
        <input
          id="phone"
          name="phone"
          autoComplete="tel"
          inputMode="tel"
          placeholder="+628..."
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="password">
          <KeyRound aria-hidden="true" size={18} /> Password
        </label>
        <input
          id="password"
          name="password"
          autoComplete="current-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      <button className="rough-button primary" type="submit" disabled={isPending}>
        <LogIn aria-hidden="true" size={18} /> {isPending ? "Memeriksa..." : "Masuk"}
      </button>
    </form>
  );
}
