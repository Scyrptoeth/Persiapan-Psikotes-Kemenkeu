import { requireApiUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { changePasswordSchema } from "@/lib/validation";

export async function PATCH(request: Request) {
  const { context, response } = await requireApiUser();
  if (!context) return response;

  const body = await request.json();
  const parsed = changePasswordSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Password minimal 8 karakter." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.updateUserById(context.user.id, {
    password: parsed.data.password,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ ok: true });
}

