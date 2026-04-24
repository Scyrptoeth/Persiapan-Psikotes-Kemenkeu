import { redirect } from "next/navigation";
import { getCurrentSessionContext } from "@/lib/auth";

export default async function HomePage() {
  const context = await getCurrentSessionContext();
  redirect(context ? "/dashboard" : "/login");
}

