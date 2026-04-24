"use client";

import { FormEvent, useState } from "react";
import { Plus, RotateCcw, Save } from "lucide-react";
import type { Profile, ProfileRole } from "@/lib/types";

type AdminPanelProps = {
  initialUsers: Profile[];
  currentUserId: string;
};

export function AdminPanel({ initialUsers, currentUserId }: AdminPanelProps) {
  const [users, setUsers] = useState(initialUsers);
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      phone: String(formData.get("phone") ?? ""),
      password: String(formData.get("password") ?? ""),
      displayName: String(formData.get("displayName") ?? ""),
      role: String(formData.get("role") ?? "user"),
    };

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "User gagal dibuat.");
      return;
    }

    const body = (await response.json()) as { user: Profile };
    setUsers((current) => [body.user, ...current]);
    event.currentTarget.reset();
    setMessage("User berhasil dibuat.");
  }

  async function saveUser(user: Profile) {
    setPendingId(user.id);
    setMessage(null);
    setError(null);

    const password = passwordDrafts[user.id]?.trim();
    const payload = {
      phone: user.phone,
      displayName: user.display_name,
      role: user.role,
      isActive: user.is_active,
      ...(password ? { password } : {}),
    };

    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "User gagal disimpan.");
      setPendingId(null);
      return;
    }

    const body = (await response.json()) as { user: Profile };
    setUsers((current) => current.map((item) => (item.id === body.user.id ? body.user : item)));
    setPasswordDrafts((current) => ({ ...current, [user.id]: "" }));
    setMessage("User berhasil disimpan.");
    setPendingId(null);
  }

  async function resetAttempts(user: Profile) {
    const confirmed = window.confirm(`Reset seluruh histori jawaban ${user.display_name}?`);
    if (!confirmed) return;

    setPendingId(user.id);
    setMessage(null);
    setError(null);

    const response = await fetch(`/api/admin/attempts?userId=${encodeURIComponent(user.id)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Histori gagal direset.");
      setPendingId(null);
      return;
    }

    setMessage("Histori jawaban berhasil direset.");
    setPendingId(null);
  }

  function updateUser(id: string, patch: Partial<Profile>) {
    setUsers((current) => current.map((user) => (user.id === id ? { ...user, ...patch } : user)));
  }

  return (
    <div className="grid" style={{ marginTop: 24 }}>
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert">{error}</div>}

      <section className="wire-panel panel-pad accent-red">
        <p className="micro-label">TAMBAH USER</p>
        <form className="grid four" onSubmit={createUser}>
          <div className="field">
            <label htmlFor="new-phone">Nomor WhatsApp</label>
            <input id="new-phone" name="phone" placeholder="+628..." required />
          </div>
          <div className="field">
            <label htmlFor="new-name">Nama</label>
            <input id="new-name" name="displayName" placeholder="Nama peserta" required />
          </div>
          <div className="field">
            <label htmlFor="new-password">Password</label>
            <input id="new-password" name="password" type="password" minLength={8} required />
          </div>
          <div className="field">
            <label htmlFor="new-role">Role</label>
            <select id="new-role" name="role" defaultValue="user">
              <option value="user">User</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
          <button className="rough-button primary" type="submit">
            <Plus aria-hidden="true" size={17} /> Buat User
          </button>
        </form>
      </section>

      <section className="wire-panel panel-pad">
        <p className="micro-label">DATABASE USER</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Nomor WhatsApp</th>
                <th>Role</th>
                <th>Status</th>
                <th>Password Baru</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <input
                      aria-label={`Nama ${user.phone}`}
                      value={user.display_name}
                      onChange={(event) => updateUser(user.id, { display_name: event.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      aria-label={`Nomor WhatsApp ${user.display_name}`}
                      value={user.phone}
                      onChange={(event) => updateUser(user.id, { phone: event.target.value })}
                    />
                  </td>
                  <td>
                    <select
                      aria-label={`Role ${user.display_name}`}
                      value={user.role}
                      onChange={(event) => updateUser(user.id, { role: event.target.value as ProfileRole })}
                      disabled={user.id === currentUserId}
                    >
                      <option value="user">User</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                  </td>
                  <td>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 900 }}>
                      <input
                        type="checkbox"
                        checked={user.is_active}
                        disabled={user.id === currentUserId}
                        onChange={(event) => updateUser(user.id, { is_active: event.target.checked })}
                      />
                      Aktif
                    </label>
                  </td>
                  <td>
                    <input
                      aria-label={`Password baru ${user.display_name}`}
                      type="password"
                      minLength={8}
                      value={passwordDrafts[user.id] ?? ""}
                      onChange={(event) =>
                        setPasswordDrafts((current) => ({ ...current, [user.id]: event.target.value }))
                      }
                      placeholder="Kosongkan jika tidak reset"
                    />
                  </td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      <button
                        className="rough-button blue"
                        type="button"
                        disabled={pendingId === user.id}
                        onClick={() => void saveUser(user)}
                      >
                        <Save aria-hidden="true" size={16} /> Simpan
                      </button>
                      <button
                        className="rough-button danger"
                        type="button"
                        disabled={pendingId === user.id}
                        onClick={() => void resetAttempts(user)}
                      >
                        <RotateCcw aria-hidden="true" size={16} /> Reset Jawaban
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

