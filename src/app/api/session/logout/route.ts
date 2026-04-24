import { cookies } from "next/headers";
import { APP_SESSION_COOKIE } from "@/lib/env";
import { getCurrentSessionContext } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const context = await getCurrentSessionContext();
  const cookieStore = await cookies();

  if (context) {
    const admin = createSupabaseAdminClient();
    await admin
      .from("app_sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", context.appSessionId);
    await admin.from("profiles").update({ current_session_id: null }).eq("id", context.user.id);
  }

  cookieStore.delete(APP_SESSION_COOKIE);
  return Response.json({ ok: true });
}

