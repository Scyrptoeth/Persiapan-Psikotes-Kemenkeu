import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { SettingsForm } from "@/app/settings/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { profile } = await requireUser();

  return (
    <AppShell profile={profile}>
      <div>
        <p className="micro-label">SETTINGS</p>
        <h2 className="brand-small">Password Akun</h2>
      </div>

      <section className="wire-panel panel-pad" style={{ marginTop: 24, maxWidth: 720 }}>
        <p className="muted">
          Nomor WhatsApp tidak dapat diubah mandiri. Hubungi superadmin untuk perubahan nomor.
        </p>
        <SettingsForm />
      </section>
    </AppShell>
  );
}

