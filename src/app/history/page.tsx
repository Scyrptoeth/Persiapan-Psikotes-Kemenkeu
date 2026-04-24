import { AppShell } from "@/components/app-shell";
import { CATEGORY_LABELS, formatDuration } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AttemptSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const { profile, user } = await requireUser();
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("attempts")
    .select(
      "id,user_id,category,package_number,score,total_questions,correct_count,wrong_count,blank_count,elapsed_seconds,submitted_at",
    )
    .eq("user_id", user.id)
    .order("submitted_at", { ascending: false })
    .limit(200)
    .returns<AttemptSummary[]>();

  const attempts = data ?? [];

  return (
    <AppShell profile={profile}>
      <div>
        <p className="micro-label">HISTORY</p>
        <h2 className="brand-small">Histori Nilai</h2>
      </div>

      <section className="wire-panel panel-pad" style={{ marginTop: 24 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Paket</th>
                <th>Skor</th>
                <th>Benar</th>
                <th>Salah</th>
                <th>Kosong</th>
                <th>Durasi</th>
              </tr>
            </thead>
            <tbody>
              {attempts.length === 0 ? (
                <tr>
                  <td colSpan={7}>Belum ada histori pengerjaan.</td>
                </tr>
              ) : (
                attempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td>{new Date(attempt.submitted_at).toLocaleString("id-ID")}</td>
                    <td>
                      {CATEGORY_LABELS[attempt.category]} Paket {attempt.package_number}
                    </td>
                    <td>
                      <strong>{attempt.score}/40</strong>
                    </td>
                    <td>{attempt.correct_count}</td>
                    <td>{attempt.wrong_count}</td>
                    <td>{attempt.blank_count}</td>
                    <td>{formatDuration(attempt.elapsed_seconds)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}

