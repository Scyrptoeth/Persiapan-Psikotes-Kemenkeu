import { normalizePhone } from "@/lib/format";
import { phoneToAuthEmail } from "@/lib/auth-identity";
import { requireApiSuperadmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { updateUserSchema } from "@/lib/validation";
import type { Profile } from "@/lib/types";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { context: sessionContext, response } = await requireApiSuperadmin();
  if (!sessionContext) return response;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateUserSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Data update user tidak valid." }, { status: 400 });
  }

  if (id === sessionContext.user.id && parsed.data.isActive === false) {
    return Response.json({ error: "Superadmin tidak dapat menonaktifkan akunnya sendiri." }, { status: 400 });
  }

  if (id === sessionContext.user.id && parsed.data.role && parsed.data.role !== "superadmin") {
    return Response.json({ error: "Superadmin tidak dapat menurunkan role akunnya sendiri." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const authUpdate: {
    email?: string;
    password?: string;
    email_confirm?: boolean;
    user_metadata?: Record<string, string>;
  } = {};
  const profileUpdate: Partial<Profile> = {};
  const userMetadata: Record<string, string> = {};
  let shouldRevokeSessions = false;

  if (parsed.data.phone) {
    const phone = normalizePhone(parsed.data.phone);
    authUpdate.email = phoneToAuthEmail(phone);
    authUpdate.email_confirm = true;
    userMetadata.phone = phone;
    profileUpdate.phone = phone;
    shouldRevokeSessions = true;
  }

  if (parsed.data.password) {
    authUpdate.password = parsed.data.password;
  }

  if (parsed.data.displayName) {
    userMetadata.display_name = parsed.data.displayName;
    profileUpdate.display_name = parsed.data.displayName;
  }

  if (parsed.data.role) {
    profileUpdate.role = parsed.data.role;
  }

  if (typeof parsed.data.isActive === "boolean") {
    profileUpdate.is_active = parsed.data.isActive;
    if (!parsed.data.isActive) {
      profileUpdate.current_session_id = null;
      shouldRevokeSessions = true;
    }
  }

  if (Object.keys(userMetadata).length > 0) {
    authUpdate.user_metadata = userMetadata;
  }

  if (Object.keys(authUpdate).length > 0) {
    const { error } = await admin.auth.admin.updateUserById(id, authUpdate);
    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
  }

  if (Object.keys(profileUpdate).length > 0) {
    const { data, error } = await admin
      .from("profiles")
      .update(profileUpdate)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (shouldRevokeSessions) {
      await admin
        .from("app_sessions")
        .update({ revoked_at: new Date().toISOString() })
        .eq("user_id", id)
        .is("revoked_at", null);
      await admin.from("profiles").update({ current_session_id: null }).eq("id", id);
    }

    return Response.json({ user: data as Profile });
  }

  const { data, error } = await admin.from("profiles").select("*").eq("id", id).single();
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ user: data as Profile });
}
