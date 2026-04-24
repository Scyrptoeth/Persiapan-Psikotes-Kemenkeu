import { requireApiSuperadmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function DELETE(request: Request) {
  const { response } = await requireApiSuperadmin();
  if (response) return response;

  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return Response.json({ error: "userId wajib diisi." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("attempts").delete().eq("user_id", userId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}

