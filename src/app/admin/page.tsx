import { AppShell } from "@/components/app-shell";
import { requireSuperadmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";
import { AdminPanel } from "@/app/admin/admin-panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { profile } = await requireSuperadmin();
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("profiles").select("*").order("created_at", { ascending: false });

  return (
    <AppShell profile={profile}>
      <div>
        <p className="micro-label">SUPERADMIN</p>
        <h2 className="brand-small">Manajemen Pengguna</h2>
      </div>
      <AdminPanel initialUsers={(data ?? []) as Profile[]} currentUserId={profile.id} />
    </AppShell>
  );
}

