import { scoreAttempt } from "@/lib/scoring";
import { requireApiUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { categorySchema, submitAttemptSchema } from "@/lib/validation";
import type { AttemptSummary } from "@/lib/types";

export async function GET(request: Request) {
  const { context, response } = await requireApiUser();
  if (!context) return response;

  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const packageNumber = url.searchParams.get("packageNumber");
  const admin = createSupabaseAdminClient();

  let query = admin
    .from("attempts")
    .select(
      "id,user_id,category,package_number,score,total_questions,correct_count,wrong_count,blank_count,elapsed_seconds,submitted_at",
    )
    .eq("user_id", context.user.id)
    .order("submitted_at", { ascending: false })
    .limit(100);

  if (category && categorySchema.safeParse(category).success) {
    query = query.eq("category", category);
  }

  if (packageNumber && Number.isInteger(Number(packageNumber))) {
    query = query.eq("package_number", Number(packageNumber));
  }

  const { data, error } = await query.returns<AttemptSummary[]>();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ attempts: data ?? [] });
}

export async function POST(request: Request) {
  const { context, response } = await requireApiUser();
  if (!context) return response;

  const body = await request.json();
  const parsed = submitAttemptSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Payload jawaban tidak valid." }, { status: 400 });
  }

  const result = scoreAttempt(parsed.data.category, parsed.data.packageNumber, parsed.data.answers);
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("attempts")
    .insert({
      user_id: context.user.id,
      category: parsed.data.category,
      package_number: parsed.data.packageNumber,
      score: result.score,
      total_questions: result.totalQuestions,
      correct_count: result.correctCount,
      wrong_count: result.wrongCount,
      blank_count: result.blankCount,
      elapsed_seconds: parsed.data.elapsedSeconds,
      answers: {
        submitted: parsed.data.answers,
        review: result.answerReview,
      },
      started_at: parsed.data.startedAt ?? null,
    })
    .select(
      "id,user_id,category,package_number,score,total_questions,correct_count,wrong_count,blank_count,elapsed_seconds,submitted_at",
    )
    .single<AttemptSummary>();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ attempt: data, result });
}

