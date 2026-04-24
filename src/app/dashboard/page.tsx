import Link from "next/link";
import { ArrowRight, Gauge, History, Medal, PencilLine } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CATEGORY_LABELS } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { listAllPackages } from "@/lib/questions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AttemptSummary, CategorySlug } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { profile, user } = await requireUser();
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("attempts")
    .select(
      "id,user_id,category,package_number,score,total_questions,correct_count,wrong_count,blank_count,elapsed_seconds,submitted_at",
    )
    .eq("user_id", user.id)
    .order("submitted_at", { ascending: false })
    .limit(80)
    .returns<AttemptSummary[]>();

  const attempts = data ?? [];
  const bestScore = attempts.reduce((best, attempt) => Math.max(best, attempt.score), 0);
  const latest = attempts[0];
  const packages = listAllPackages();
  const categories = ["tambah", "kurang", "kali", "bagi", "mix"] as CategorySlug[];

  return (
    <AppShell profile={profile}>
      <div className="top-row">
        <div>
          <p className="micro-label">DASHBOARD</p>
          <h2 className="brand-small">Selamat datang, {profile.display_name}</h2>
        </div>
        <span className="stamp">7 menit</span>
      </div>

      <section className="grid four" style={{ marginTop: 24 }}>
        <div className="wire-panel panel-pad">
          <p className="micro-label">
            <Gauge aria-hidden="true" size={16} /> Best Score
          </p>
          <div className="stat-number" style={{ color: "var(--red)" }}>
            {bestScore}
          </div>
          <p className="muted">dari 40</p>
        </div>
        <div className="wire-panel panel-pad accent-blue">
          <p className="micro-label">
            <History aria-hidden="true" size={16} /> Percobaan
          </p>
          <div className="stat-number" style={{ color: "var(--blue)" }}>
            {attempts.length}
          </div>
          <p className="muted">tersimpan</p>
        </div>
        <div className="wire-panel panel-pad accent-yellow">
          <p className="micro-label">
            <Medal aria-hidden="true" size={16} /> Terakhir
          </p>
          <div className="stat-number" style={{ color: "var(--ink)" }}>
            {latest?.score ?? "-"}
          </div>
          <p className="muted">{latest ? `${CATEGORY_LABELS[latest.category]} Paket ${latest.package_number}` : "Belum ada"}</p>
        </div>
        <div className="wire-panel panel-pad accent-green">
          <p className="micro-label">
            <PencilLine aria-hidden="true" size={16} /> Mode
          </p>
          <div className="stat-number" style={{ color: "var(--green)" }}>
            50
          </div>
          <p className="muted">paket hitung cepat</p>
        </div>
      </section>

      <section className="grid" style={{ marginTop: 24 }}>
        {categories.map((category) => (
          <article key={category} className="wire-panel panel-pad">
            <div className="split-row">
              <div>
                <p className="micro-label">PAKET LATIHAN</p>
                <h3 className="brand-small">{CATEGORY_LABELS[category]}</h3>
              </div>
              <Link className="rough-button" href={`/practice/${category}/1`}>
                Mulai <ArrowRight aria-hidden="true" size={17} />
              </Link>
            </div>
            <div className="package-grid" style={{ marginTop: 18 }}>
              {packages
                .filter((item) => item.category === category)
                .map((item) => (
                  <Link
                    key={`${item.category}-${item.packageNumber}`}
                    className={`rough-button ${item.isDecimal ? "yellow" : ""}`}
                    href={`/practice/${item.category}/${item.packageNumber}`}
                    aria-label={`${item.title} ${item.isDecimal ? "desimal" : "bilangan bulat"}`}
                  >
                    {item.packageNumber}
                  </Link>
                ))}
            </div>
            <p className="muted">
              Paket 1-5 bilangan bulat. Paket 6-10 desimal maksimal dua angka di belakang koma.
            </p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}

