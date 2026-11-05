import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured, SESSION_COOKIE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Role, SessionUser } from "@/lib/types";

function parseSession(raw: string | undefined): SessionUser | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<SessionUser>;
    if (typeof value.id !== "string" || typeof value.email !== "string") return null;
    if (value.role !== "admin" && value.role !== "student") return null;
    return { id: value.id, email: value.email, role: value.role };
  } catch {
    return null;
  }
}

export async function getOptionalUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured()) {
    const jar = await cookies();
    return parseSession(jar.get(SESSION_COOKIE)?.value);
  }

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
