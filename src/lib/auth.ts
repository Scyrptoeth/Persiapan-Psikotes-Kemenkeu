import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { APP_SESSION_COOKIE } from "@/lib/env";
import type { Profile } from "@/lib/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionContext = {
  user: User;
  profile: Profile;
  appSessionId: string;
};

export async function getCurrentSessionContext(): Promise<SessionContext | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const cookieStore = await cookies();
  const appSessionId = cookieStore.get(APP_SESSION_COOKIE)?.value;
  if (!appSessionId) {
    return null;
  }

  const admin = createSupabaseAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (error || !profile || !profile.is_active || profile.current_session_id !== appSessionId) {
    return null;
  }

  return {
    user,
    profile,
    appSessionId,
  };
}

export async function requireUser(): Promise<SessionContext> {
  const context = await getCurrentSessionContext();
  if (!context) {
    redirect("/login");
  }

  return context;
}

export async function requireSuperadmin(): Promise<SessionContext> {
  const context = await requireUser();
  if (context.profile.role !== "superadmin") {
    redirect("/dashboard");
  }

  return context;
}

export async function requireApiUser() {
  const context = await getCurrentSessionContext();
  if (!context) {
    return {
      context: null,
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { context, response: null };
}

export async function requireApiSuperadmin() {
  const { context, response } = await requireApiUser();
  if (!context) {
    return { context: null, response };
  }

  if (context.profile.role !== "superadmin") {
    return {
      context: null,
      response: Response.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { context, response: null };
}

