import "server-only";

import { connection } from "next/server";
import { getOptionalUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/constants";
import { readStore, updateStore } from "@/lib/local-store";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";
import type {
  CatalogGroup,
  EditorTest,
  GradeResult,
  PublicTest,
  Question,
  SaveTestInput,
  Subject,
  Test,
} from "@/lib/types";

type SubjectRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  position: number;
};

type TestRow = {
  id: string;
  subject_id: string;
  slug: string;
  title: string;
  description: string | null;
  passage: string | null;
  position: number;
  published: boolean;
};

type QuestionRow = {
  id: string;
  test_id: string;
  prompt: string;
  choices: string[];
  correct_index: number;
  explanation: string | null;
  position: number;
};

function raise(error: { message: string; code?: string }): never {
  const missing =
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    /relation|schema cache|does not exist/i.test(error.message);
  if (missing) {
    throw new Error(
      "Supabase is connected, but the tables are not there yet. Run supabase/schema.sql in the Supabase SQL editor.",
    );
  }
  if (/fetch failed|enotfound|failed to fetch/i.test(error.message)) {
    throw new Error("Could not reach Supabase. Check the project URL and the anon key.");
  }
  throw new Error(error.message);
}

function mapSubject(row: SubjectRow): Subject {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    position: row.position ?? 0,
  };
}

function mapTest(row: TestRow): Test {
  return {
    id: row.id,
    subjectId: row.subject_id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    passage: row.passage,
    position: row.position ?? 0,
    published: row.published,
  };
}

function mapQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    testId: row.test_id,
    prompt: row.prompt,
    choices: row.choices,
    correctIndex: row.correct_index,
    explanation: row.explanation ?? "",
    position: row.position ?? 0,
  };
}

async function db() {
  await connection();
  return createClient();
}

function byPosition<T extends { position: number; title?: string; name?: string }>(items: T[]) {
  return [...items].sort((a, b) => a.position - b.position || (a.title ?? a.name ?? "").localeCompare(b.title ?? b.name ?? ""));
}

export async function listCatalog(): Promise<CatalogGroup[]> {
  if (!isSupabaseConfigured()) {
    await connection();
    const store = readStore();
    return byPosition(store.subjects).map((subject) => ({
      subject,
      tests: byPosition(store.tests.filter((test) => test.subjectId === subject.id && test.published)),
    }));
  }

  const supabase = await db();
  const [{ data: subjects, error: subjectError }, { data: tests, error: testError }] = await Promise.all([
    supabase.from("subjects").select("*").order("position"),
    supabase.from("tests").select("*").eq("published", true).order("position"),
  ]);
  if (subjectError) raise(subjectError);
  if (testError) raise(testError);

  return (subjects as SubjectRow[]).map((row) => {
    const subject = mapSubject(row);
    return {
      subject,
      tests: (tests as TestRow[]).filter((test) => test.subject_id === subject.id).map(mapTest),
    };
  });
}

export async function listAdminCatalog(): Promise<CatalogGroup[]> {
  if (!isSupabaseConfigured()) {
    await connection();
    const store = readStore();
    return byPosition(store.subjects).map((subject) => ({
      subject,
      tests: byPosition(store.tests.filter((test) => test.subjectId === subject.id)),
    }));
  }

  const supabase = await db();
  const [{ data: subjects, error: subjectError }, { data: tests, error: testError }] = await Promise.all([
    supabase.from("subjects").select("*").order("position"),
    supabase.from("tests").select("*").order("position"),
  ]);
  if (subjectError) raise(subjectError);
  if (testError) raise(testError);

  return (subjects as SubjectRow[]).map((row) => {
    const subject = mapSubject(row);
    return {
      subject,
      tests: (tests as TestRow[]).filter((test) => test.subject_id === subject.id).map(mapTest),
    };
  });
}

export async function getSubject(slug: string): Promise<Subject | null> {
  const catalog = await listCatalog();
  return catalog.find((group) => group.subject.slug === slug)?.subject ?? null;
}

export async function getSubjectWithTests(slug: string) {
  const catalog = await listCatalog();
  return catalog.find((group) => group.subject.slug === slug) ?? null;
}

export async function listSavedSubjects(userId: string): Promise<Subject[]> {
  if (!isSupabaseConfigured()) {
    await connection();
    const store = readStore();
    const ids = new Set(store.saved[userId] ?? []);
    return byPosition(store.subjects.filter((subject) => ids.has(subject.id)));
  }

  const supabase = await db();
  const { data, error } = await supabase
    .from("saved_subjects")
    .select("subject_id, subjects(*)")
    .eq("user_id", userId);
  if (error) raise(error);

  const subjects = (data ?? [])
    .map((row) => {
      const subject = row.subjects as SubjectRow | SubjectRow[] | null;
      const value = Array.isArray(subject) ? subject[0] : subject;
      return value ? mapSubject(value) : null;
    })
    .filter((subject): subject is Subject => Boolean(subject));

  return byPosition(subjects);
}

export async function setSaved(userId: string, subjectSlug: string, saved: boolean) {
  if (!isSupabaseConfigured()) {
    await updateStore((store) => {
      const subject = store.subjects.find((item) => item.slug === subjectSlug);
      if (!subject) return;
      const current = new Set(store.saved[userId] ?? []);
      if (saved) current.add(subject.id);
      else current.delete(subject.id);
      store.saved[userId] = [...current];
    });
    return;
  }

  const supabase = await db();
  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("id")
    .eq("slug", subjectSlug)
    .maybeSingle();
  if (subjectError) raise(subjectError);
  if (!subject) return;

  if (saved) {
    const { error } = await supabase
      .from("saved_subjects")
      .upsert({ user_id: userId, subject_id: subject.id }, { onConflict: "user_id,subject_id" });
    if (error) raise(error);
    return;
  }

  const { error } = await supabase
    .from("saved_subjects")
    .delete()
    .eq("user_id", userId)
    .eq("subject_id", subject.id);
  if (error) raise(error);
}

function toPublic(subject: Subject, test: Test, questions: Question[]): PublicTest {
  return {
    slug: test.slug,
    title: test.title,
    description: test.description,
    passage: test.passage,
    subjectSlug: subject.slug,
    subjectName: subject.name,
    questions: byPosition(questions).map((question) => ({
      id: question.id,
      prompt: question.prompt,
      choices: question.choices,
    })),
  };
}

export async function getPublicTest(
  slug: string,
  options: { includeUnpublished?: boolean } = {},
): Promise<PublicTest | null> {
  if (!isSupabaseConfigured()) {
    await connection();
    const store = readStore();
    const test = store.tests.find((item) => item.slug === slug);
    if (!test || (!test.published && !options.includeUnpublished)) return null;
    const subject = store.subjects.find((item) => item.id === test.subjectId);
    if (!subject) return null;
    const questions = store.questions.filter((question) => question.testId === test.id);
    return toPublic(subject, test, questions);
  }

  const supabase = await db();
  const { data, error } = await supabase.from("tests").select("*").eq("slug", slug).maybeSingle();
  if (error) raise(error);
  if (!data) return null;
  const test = mapTest(data as TestRow);
  if (!test.published && !options.includeUnpublished) return null;

  const { data: subjectRow, error: subjectError } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", test.subjectId)
    .maybeSingle();
  if (subjectError) raise(subjectError);
  if (!subjectRow) return null;

  const { data: questionRows, error: questionError } = await supabase
    .from("questions")
    .select("id, test_id, prompt, choices, position")
    .eq("test_id", test.id)
    .order("position");
  if (questionError) raise(questionError);

  return toPublic(
    mapSubject(subjectRow as SubjectRow),
    test,
    (questionRows as QuestionRow[]).map((row) => ({
      ...mapQuestion({ ...row, correct_index: 0, explanation: "" }),
    })),
  );
}

export async function gradeTest(slug: string, answers: Record<string, number>): Promise<GradeResult | null> {
  let questions: Question[] = [];
  const user = await getOptionalUser();
  const includeUnpublished = user?.role === "admin";

  if (!isSupabaseConfigured()) {
    await connection();
    const store = readStore();
    const test = store.tests.find((item) => item.slug === slug && (item.published || includeUnpublished));
    if (!test) return null;
    questions = byPosition(store.questions.filter((question) => question.testId === test.id));
  } else {
    const supabase = await db();
    let query = supabase.from("tests").select("id").eq("slug", slug);
    if (!includeUnpublished) query = query.eq("published", true);
    const { data: test, error } = await query.maybeSingle();
    if (error) raise(error);
    if (!test) return null;
    const { data, error: questionError } = await supabase
      .from("questions")
      .select("*")
      .eq("test_id", test.id)
      .order("position");
    if (questionError) raise(questionError);
    questions = (data as QuestionRow[]).map(mapQuestion);
  }

  const review = questions.map((question) => {
    const selected = answers[question.id];
    return {
      id: question.id,
      prompt: question.prompt,
      choices: question.choices,
      selectedIndex: typeof selected === "number" && Number.isInteger(selected) ? selected : null,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
    };
  });

  return {
    correct: review.filter((item) => item.selectedIndex === item.correctIndex).length,
    total: review.length,
    review,
  };
}

export async function getEditorTest(id: string): Promise<EditorTest | null> {
  if (!isSupabaseConfigured()) {
    await connection();
    const store = readStore();
    const test = store.tests.find((item) => item.id === id);
    if (!test) return null;
    return {
      id: test.id,
      subjectId: test.subjectId,
      title: test.title,
      slug: test.slug,
      description: test.description,
      passage: test.passage ?? "",
      published: test.published,
      questions: byPosition(store.questions.filter((question) => question.testId === test.id)).map((question) => ({
        prompt: question.prompt,
        choices: question.choices,
        correctIndex: question.correctIndex,
        explanation: question.explanation,
      })),
    };
  }

  const supabase = await db();
  const { data, error } = await supabase.from("tests").select("*").eq("id", id).maybeSingle();
  if (error) raise(error);
  if (!data) return null;
  const test = mapTest(data as TestRow);
  const { data: questionRows, error: questionError } = await supabase
    .from("questions")
    .select("*")
    .eq("test_id", test.id)
    .order("position");
  if (questionError) raise(questionError);

  return {
    id: test.id,
    subjectId: test.subjectId,
    title: test.title,
    slug: test.slug,
    description: test.description,
    passage: test.passage ?? "",
    published: test.published,
    questions: (questionRows as QuestionRow[]).map((row) => {
      const question = mapQuestion(row);
      return {
        prompt: question.prompt,
        choices: question.choices,
        correctIndex: question.correctIndex,
        explanation: question.explanation,
      };
    }),
  };
}

function validateTest(input: SaveTestInput) {
  const title = input.title.trim();
  const slug = slugify(input.slug || title);
  const description = input.description.trim();
  const passage = input.passage.trim();
  if (!title) return { ok: false as const, error: "Add a title." };
  if (!slug) return { ok: false as const, error: "Add a slug." };
  if (!input.subjectId) return { ok: false as const, error: "Choose a subject." };
  if (input.questions.length === 0) return { ok: false as const, error: "Add at least one question." };
  if (passage.length > 8000) return { ok: false as const, error: "The passage is too long." };

  for (const [index, question] of input.questions.entries()) {
    const prompt = question.prompt.trim();
    const choices = question.choices.map((choice) => choice.trim());
    if (!prompt) return { ok: false as const, error: `Question ${index + 1} needs a prompt.` };
    if (choices.length < 2 || choices.length > 6) {
      return { ok: false as const, error: `Question ${index + 1} needs between 2 and 6 choices.` };
    }
    if (choices.some((choice) => !choice)) {
      return { ok: false as const, error: `Fill in every choice for question ${index + 1}.` };
    }
    if (!Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex >= choices.length) {
      return { ok: false as const, error: `Mark the correct choice for question ${index + 1}.` };
    }
  }

  return {
    ok: true as const,
    value: {
      title,
      slug,
      description,
      passage: passage || null,
      published: input.published,
      subjectId: input.subjectId,
      questions: input.questions.map((question) => ({
        prompt: question.prompt.trim(),
        choices: question.choices.map((choice) => choice.trim()),
        correctIndex: question.correctIndex,
        explanation: question.explanation.trim(),
      })),
    },
  };
}

export async function saveTest(input: SaveTestInput): Promise<{ id: string } | { error: string }> {
  const validated = validateTest(input);
  if (!validated.ok) return { error: validated.error };
  const value = validated.value;

  if (!isSupabaseConfigured()) {
    let id = input.id ?? crypto.randomUUID();
    let error: string | null = null;
    await updateStore((store) => {
      if (!store.subjects.some((subject) => subject.id === value.subjectId)) {
        error = "That subject does not exist.";
        return;
      }
      if (store.tests.some((test) => test.slug === value.slug && test.id !== input.id)) {
        error = "That slug is already used.";
        return;
      }
      if (input.id) {
        const existing = store.tests.find((test) => test.id === input.id);
        if (!existing) {
          error = "That test no longer exists.";
          return;
        }
        existing.subjectId = value.subjectId;
        existing.title = value.title;
        existing.slug = value.slug;
        existing.description = value.description;
        existing.passage = value.passage;
        existing.published = value.published;
        id = existing.id;
      } else {
        const position = store.tests.filter((test) => test.subjectId === value.subjectId).length;
        store.tests.push({
          id,
          subjectId: value.subjectId,
          slug: value.slug,
          title: value.title,
          description: value.description,
          passage: value.passage,
          position,
          published: value.published,
        });
      }
      store.questions = store.questions.filter((question) => question.testId !== id);
      value.questions.forEach((question, position) => {
        store.questions.push({
          id: crypto.randomUUID(),
          testId: id,
          prompt: question.prompt,
          choices: question.choices,
          correctIndex: question.correctIndex,
          explanation: question.explanation,
          position,
        });
      });
    });
    if (error) return { error };
    return { id };
  }

  const supabase = await db();
  const { data: clash, error: clashError } = await supabase
    .from("tests")
    .select("id")
    .eq("slug", value.slug)
    .maybeSingle();
  if (clashError) raise(clashError);
  if (clash && clash.id !== input.id) return { error: "That slug is already used." };

  const payload = {
    subject_id: value.subjectId,
    slug: value.slug,
    title: value.title,
    description: value.description,
    passage: value.passage,
    published: value.published,
  };

  let id = input.id;
  if (id) {
    const { error } = await supabase.from("tests").update(payload).eq("id", id);
    if (error) raise(error);
    const { error: deleteError } = await supabase.from("questions").delete().eq("test_id", id);
    if (deleteError) raise(deleteError);
  } else {
    const { data, error } = await supabase.from("tests").insert(payload).select("id").single();
    if (error) raise(error);
    id = data.id;
  }

  const rows = value.questions.map((question, position) => ({
    test_id: id,
    prompt: question.prompt,
    choices: question.choices,
    correct_index: question.correctIndex,
    explanation: question.explanation,
    position,
  }));
  const { error: insertError } = await supabase.from("questions").insert(rows);
  if (insertError) raise(insertError);
  return { id: id! };
}

export async function deleteTest(id: string) {
  if (!isSupabaseConfigured()) {
    await updateStore((store) => {
      store.tests = store.tests.filter((test) => test.id !== id);
      store.questions = store.questions.filter((question) => question.testId !== id);
    });
    return;
  }

  const supabase = await db();
  const { error } = await supabase.from("tests").delete().eq("id", id);
  if (error) raise(error);
}

export async function createSubject(input: { name: string; slug: string; description: string }) {
  const name = input.name.trim();
  const slug = slugify(input.slug || name);
  const description = input.description.trim();
  if (!name || !slug) return { error: "Name and slug are required." as const };

  if (!isSupabaseConfigured()) {
    let error: string | null = null;
    await updateStore((store) => {
      if (store.subjects.some((subject) => subject.slug === slug)) {
        error = "That slug is already used.";
        return;
      }
      store.subjects.push({
        id: crypto.randomUUID(),
        slug,
        name,
        description,
        position: store.subjects.length,
      });
    });
    if (error) return { error };
    return { ok: true as const };
  }

  const supabase = await db();
  const { error } = await supabase.from("subjects").insert({ name, slug, description });
  if (error) {
    if (error.code === "23505") return { error: "That slug is already used." };
    raise(error);
  }
  return { ok: true as const };
}
