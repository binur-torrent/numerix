"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireUser } from "@/lib/auth";
import { isListedAdmin, isSupabaseConfigured, SESSION_COOKIE } from "@/lib/constants";
import {
  createSubject as insertSubject,
  deleteTest as removeTest,
  gradeTest as scoreTest,
  saveTest as writeTest,
  setSaved,
} from "@/lib/data";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { GradeResult, SaveTestInput, SessionUser } from "@/lib/types";

export type FormState = { error?: string; ok?: boolean } | null;

function safeNext(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/subjects";
  }
  return value;
}

function refresh() {
  revalidatePath("/", "layout");
}

async function promoteListedAdmin(userId: string, email: string) {
  if (!isListedAdmin(email)) return;
  const admin = createServiceClient();
  if (!admin) return;
  await admin.from("profiles").update({ role: "admin" }).eq("id", userId);
}

async function startDemoSession(email: string) {
  const role = email.startsWith("admin@") || isListedAdmin(email) ? "admin" : "student";
  const user: SessionUser = { id: `demo:${email}`, email, role };
  const jar = await cookies();
  jar.set(SESSION_COOKIE, JSON.stringify(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return role;
}

export async function authenticate(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const intent = formData.get("intent") === "sign-up" ? "sign-up" : "sign-in";
  const next = safeNext(formData.get("next"));

  if (!email.includes("@") || password.length < 6) {
    return { error: "Use a valid email and a password of at least 6 characters." };
  }

  if (!isSupabaseConfigured()) {
    const role = await startDemoSession(email);
    redirect(next === "/subjects" && role === "admin" ? "/admin" : next);
  }

  const supabase = await createClient();
  const result =
    intent === "sign-up"
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

  if (result.error) return { error: result.error.message };
  if (!result.data.session || !result.data.user) {
    return { error: "Check your email to confirm the account, then sign in." };
  }

  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  await promoteListedAdmin(result.data.user.id, email);
  redirect(next === "/subjects" && isListedAdmin(email) ? "/admin" : next);
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/");
}

export async function saveSubject(formData: FormData) {
  const user = await requireUser();
  const slug = String(formData.get("slug") ?? "");
  await setSaved(user.id, slug, true);
  refresh();
}

export async function removeSubject(formData: FormData) {
  const user = await requireUser();
  const slug = String(formData.get("slug") ?? "");
  await setSaved(user.id, slug, false);
  refresh();
}

export async function gradeAttempt(slug: string, answers: Record<string, number>): Promise<GradeResult | { error: string }> {
  const result = await scoreTest(slug, answers);
  if (!result) return { error: "This test is not available." };
  return result;
}

export async function saveTest(input: SaveTestInput) {
  await requireAdmin();
  const result = await writeTest(input);
  if ("id" in result) refresh();
  return result;
}

export async function deleteTest(id: string) {
  await requireAdmin();
  await removeTest(id);
  refresh();
}

export async function createSubject(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const result = await insertSubject({
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
  });
  if ("error" in result) return { error: result.error };
  refresh();
  return { ok: true };
}
