import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CATEGORY_LABELS, isCategorySlug } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { getPublicQuestionPackage } from "@/lib/questions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AttemptSummary } from "@/lib/types";
import { PracticeClient } from "@/app/practice/[category]/[packageNumber]/practice-client";

export const dynamic = "force-dynamic";

type PracticePageProps = {
  params: Promise<{
    category: string;
    packageNumber: string;
  }>;
};

export default async function PracticePage({ params }: PracticePageProps) {
  const resolvedParams = await params;
  const packageNumber = Number(resolvedParams.packageNumber);

  if (!isCategorySlug(resolvedParams.category) || !Number.isInteger(packageNumber) || packageNumber < 1 || packageNumber > 10) {
    notFound();
  }

  const { profile, user } = await requireUser();
  const questionPackage = getPublicQuestionPackage(resolvedParams.category, packageNumber);
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("attempts")
    .select(
      "id,user_id,category,package_number,score,total_questions,correct_count,wrong_count,blank_count,elapsed_seconds,submitted_at",
    )
    .eq("user_id", user.id)
    .eq("category", resolvedParams.category)
    .eq("package_number", packageNumber)
    .order("submitted_at", { ascending: false })
    .limit(10)
    .returns<AttemptSummary[]>();

  return (
    <AppShell profile={profile}>
      <div className="top-row">
        <div>
          <p className="micro-label">PRACTICE</p>
          <h2 className="brand-small">
            {CATEGORY_LABELS[resolvedParams.category]} Paket {packageNumber}
          </h2>
        </div>
        <Link className="rough-button" href="/dashboard">
          Kembali
        </Link>
      </div>

      <PracticeClient questionPackage={questionPackage} history={data ?? []} />
    </AppShell>
  );
}

