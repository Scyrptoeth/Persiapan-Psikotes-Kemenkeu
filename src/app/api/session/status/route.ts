import { cookies } from "next/headers";
import { APP_SESSION_COOKIE } from "@/lib/env";
import { getCurrentSessionContext } from "@/lib/auth";

export async function GET() {
  const context = await getCurrentSessionContext();

  if (!context) {
    const cookieStore = await cookies();
    cookieStore.delete(APP_SESSION_COOKIE);
    return Response.json({ valid: false }, { status: 401 });
  }

  return Response.json({
    valid: true,
    role: context.profile.role,
    phone: context.profile.phone,
  });
}

