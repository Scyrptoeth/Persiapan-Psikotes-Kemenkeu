import { Suspense } from "react";
import { LoginForm } from "@/app/login/login-form";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <section className="wire-panel panel-pad" style={{ width: "min(720px, 100%)" }}>
        <div className="top-row" style={{ alignItems: "flex-start" }}>
          <div>
            <p className="micro-label">LOGIN AREA</p>
            <h1 className="brand">Persiapan Psikotes Kementerian Keuangan</h1>
          </div>
          <span className="stamp">v0.1</span>
        </div>
        <p className="muted" style={{ fontSize: "1.05rem", maxWidth: 620 }}>
          Masuk dengan Nomor WhatsApp dan password yang sudah dibuat oleh superadmin.
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="footer-note">
          Platform belajar independen, bukan situs resmi Kementerian Keuangan.
        </p>
      </section>
    </main>
  );
}

