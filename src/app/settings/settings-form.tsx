"use client";

import { FormEvent, useState } from "react";
import { KeyRound } from "lucide-react";

export function SettingsForm() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/settings/password", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Password gagal diubah.");
      setIsPending(false);
      return;
    }

    setPassword("");
    setMessage("Password berhasil diperbarui.");
    setIsPending(false);
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert">{error}</div>}
      <div className="field">
        <label htmlFor="new-password">
          <KeyRound aria-hidden="true" size={18} /> Password baru
        </label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      <button className="rough-button primary" type="submit" disabled={isPending}>
        Simpan Password
      </button>
    </form>
  );
}

