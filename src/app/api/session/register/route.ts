import { cookies } from "next/headers";
import { APP_SESSION_COOKIE } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return Response.json({ error: "Missing bearer token." }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const {
    data: { user },
    error: userError,
  } = await admin.auth.getUser(token);

  if (userError || !user) {
    return Response.json({ error: "Invalid login session." }, { status: 401 });
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (profileError || !profile) {
    return Response.json({ error: "Nomor WhatsApp belum terdaftar oleh superadmin." }, { status: 403 });
  }

  if (!profile.is_active) {
    return Response.json({ error: "Akun ini sedang dinonaktifkan." }, { status: 403 });
  }

  await admin
    .from("app_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("revoked_at", null);

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const { data: appSession, error: sessionError } = await admin
    .from("app_sessions")
    .insert({
      user_id: user.id,
      user_agent: request.headers.get("user-agent"),
      ip_address: ipAddress,
    })
    .select("id")
    .single<{ id: string }>();

  if (sessionError || !appSession) {
    return Response.json({ error: "Gagal membuat sesi aplikasi." }, { status: 500 });
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({ current_session_id: appSession.id })
    .eq("id", user.id);

  if (updateError) {
    return Response.json({ error: "Gagal memperbarui sesi aktif." }, { status: 500 });
  }

  const cookieStore = await cookies();
  cookieStore.set(APP_SESSION_COOKIE, appSession.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({
    profile: {
      id: profile.id,
      phone: profile.phone,
      displayName: profile.display_name,
      role: profile.role,
    },
  });
}

