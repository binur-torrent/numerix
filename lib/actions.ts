"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireUser } from "@/lib/auth";
import { isListedAdmin, isSupabaseConfigured, siteOrigin, supabaseConfigError } from "@/lib/constants";
import {
  createSubject as insertSubject,
  deleteTest as removeTest,
  gradeTest as scoreTest,
  saveTest as writeTest,
  setSaved,
} from "@/lib/data";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { GradeResult, SaveTestInput } from "@/lib/types";

export type FormState = { error?: string; notice?: string; ok?: boolean } | null;

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

export async function authenticate(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const intent = formData.get("intent") === "sign-up" ? "sign-up" : "sign-in";
  const next = safeNext(formData.get("next"));

  if (!email.includes("@") || password.length < 6) {
    return { error: "Use a valid email and a password of at least 6 characters." };
  }

  if (!isSupabaseConfigured()) {
    return { error: supabaseConfigError() ?? "Supabase is not configured." };
  }

  const supabase = await createClient();
  const result =
    intent === "sign-up"
      ? await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${siteOrigin}/auth/callback` },
        })
      : await supabase.auth.signInWithPassword({ email, password });

  if (result.error) return { error: result.error.message };

  const user = result.data.user;
  if (intent === "sign-up" && user && (user.identities?.length ?? 0) === 0) {
    return { error: "An account with this email already exists. Sign in instead." };
  }

  if (!result.data.session || !user) {
    return {
      notice: "Account created. Check your email to confirm it, then sign in. The user is already listed in Supabase.",
    };
  }

  await promoteListedAdmin(user.id, email);
  redirect(next === "/subjects" && isListedAdmin(email) ? "/admin" : next);
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
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
