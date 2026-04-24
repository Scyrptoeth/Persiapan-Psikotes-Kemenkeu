import { normalizePhone } from "@/lib/format";
import { phoneToAuthEmail } from "@/lib/auth-identity";
import { requireApiSuperadmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createUserSchema } from "@/lib/validation";
import type { Profile } from "@/lib/types";

export async function GET() {
  const { response } = await requireApiSuperadmin();
  if (response) return response;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ users: (data ?? []) as Profile[] });
}

export async function POST(request: Request) {
  const { response } = await requireApiSuperadmin();
  if (response) return response;

  const body = await request.json();
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Data user tidak valid." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const phone = normalizePhone(parsed.data.phone);
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: phoneToAuthEmail(phone),
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      display_name: parsed.data.displayName,
      phone,
    },
  });

  if (createError || !created.user) {
    return Response.json({ error: createError?.message ?? "Gagal membuat user." }, { status: 400 });
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .insert({
      id: created.user.id,
      phone,
      display_name: parsed.data.displayName,
      role: parsed.data.role,
      is_active: true,
    })
    .select("*")
    .single();

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return Response.json({ error: profileError.message }, { status: 500 });
  }

  return Response.json({ user: profile as Profile }, { status: 201 });
}
