import "server-only";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Role, SessionUser } from "@/lib/types";

export async function getOptionalUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", data.user.id)
    .maybeSingle();

  const role: Role = profile?.role === "admin" ? "admin" : "student";
  return {
    id: data.user.id,
    email: profile?.email ?? data.user.email ?? "",
    role,
  };
}

export async function requireUser() {
  const user = await getOptionalUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/subjects");
  return user;
}
