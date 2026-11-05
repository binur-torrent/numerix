"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteTest, saveTest } from "@/lib/actions";
import { slugify } from "@/lib/slug";
import type { EditorQuestion, EditorTest, Subject } from "@/lib/types";

const emptyQuestion = (): EditorQuestion => ({
  prompt: "",
  choices: ["", "", "", ""],
  correctIndex: 0,
  explanation: "",
});

export function TestEditor({
  test,
  subjects,
}: {
  test: EditorTest | null;
  subjects: Pick<Subject, "id" | "name">[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(test?.title ?? "");
  const [slug, setSlug] = useState(test?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(test?.slug));
  const [subjectId, setSubjectId] = useState(test?.subjectId ?? subjects[0]?.id ?? "");
  const [description, setDescription] = useState(test?.description ?? "");
  const [passage, setPassage] = useState(test?.passage ?? "");
  const [published, setPublished] = useState(test?.published ?? true);
  const [questions, setQuestions] = useState<EditorQuestion[]>(
    test?.questions.length ? test.questions : [emptyQuestion()],
  );

  function updateQuestion(index: number, next: EditorQuestion) {
    setQuestions((current) => current.map((question, questionIndex) => (questionIndex === index ? next : question)));
  }

  function onSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveTest({
        id: test?.id,
        subjectId,
        title,
        slug,
        description,
        passage,
        published,
        questions,
      });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/admin");
    });
  }

  function onDelete() {
    if (!test || !window.confirm("Delete this test?")) return;
    startTransition(async () => {
      await deleteTest(test.id);
      router.push("/admin");
    });
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title">
          <input
            value={title}
            onChange={(event) => {
              const value = event.target.value;
              setTitle(value);
              if (!slugTouched) setSlug(slugify(value));
            }}
            className="h-11 w-full rounded-xl border border-line bg-white px-3 outline-none"
          />
        </Field>
        <Field label="Slug">
          <input
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(slugify(event.target.value));
            }}
            className="h-11 w-full rounded-xl border border-line bg-white px-3 outline-none"
          />
        </Field>
        <Field label="Subject">
          <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="h-11 w-full rounded-xl border border-line bg-white px-3 outline-none">
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Description">
          <input value={description} onChange={(event) => setDescription(event.target.value)} className="h-11 w-full rounded-xl border border-line bg-white px-3 outline-none" />
        </Field>
      </div>
      <Field label="Passage, optional">
        <textarea
          value={passage}
          onChange={(event) => setPassage(event.target.value)}
          rows={6}
          className="min-h-32 w-full rounded-xl border border-line bg-white px-3 py-3 outline-none"
        />
      </Field>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={published}
          onChange={(event) => setPublished(event.target.checked)}
          className="h-4 w-4 accent-navy"
        />
        Published
      </label>

      <div className="space-y-5">
        {questions.map((question, index) => (
          <fieldset key={index} className="rounded-3xl border border-line bg-white p-5">
            <legend className="px-1 text-sm font-medium text-muted">Question {index + 1}</legend>
            <textarea
              value={question.prompt}
              onChange={(event) => updateQuestion(index, { ...question, prompt: event.target.value })}
              rows={3}
              placeholder="Prompt"
              className="mt-3 min-h-20 w-full rounded-xl border border-line bg-white px-3 py-3 outline-none"
            />
            <div className="mt-3 space-y-2">
              {question.choices.map((choice, choiceIndex) => (
                <div key={choiceIndex} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${index}`}
                    checked={question.correctIndex === choiceIndex}
                    onChange={() => updateQuestion(index, { ...question, correctIndex: choiceIndex })}
                    aria-label={`Correct choice ${choiceIndex + 1}`}
                    className="accent-orange"
                  />
                  <input
                    value={choice}
                    onChange={(event) => {
                      const choices = question.choices.map((item, itemIndex) =>
                        itemIndex === choiceIndex ? event.target.value : item,
                      );
                      updateQuestion(index, { ...question, choices });
                    }}
                    placeholder={`Choice ${String.fromCharCode(65 + choiceIndex)}`}
                    className="h-11 w-full rounded-xl border border-line bg-white px-3 outline-none"
                  />
                </div>
              ))}
            </div>
            <textarea
              value={question.explanation}
              onChange={(event) => updateQuestion(index, { ...question, explanation: event.target.value })}
              rows={2}
              placeholder="Explanation shown after the test"
              className="mt-3 min-h-16 w-full rounded-xl border border-line bg-white px-3 py-3 outline-none"
            />
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-navy"
                onClick={() =>
                  updateQuestion(index, {
                    ...question,
                    choices: question.choices.length < 6 ? [...question.choices, ""] : question.choices,
                  })
                }
              >
                Add choice
              </button>
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-navy"
                onClick={() => {
                  if (question.choices.length <= 2) return;
                  const choices = question.choices.slice(0, -1);
                  updateQuestion(index, {
                    ...question,
                    choices,
                    correctIndex: Math.min(question.correctIndex, choices.length - 1),
                  });
                }}
              >
                Remove choice
              </button>
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-orange"
                onClick={() => setQuestions((current) => current.filter((_, questionIndex) => questionIndex !== index))}
              >
                Remove question
              </button>
            </div>
          </fieldset>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setQuestions((current) => [...current, emptyQuestion()])}
        className="text-sm font-medium text-navy"
      >
        Add question
      </button>

      {error ? <p className="text-sm text-orange">{error}</p> : null}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={pending || subjects.length === 0}
          className="rounded-xl bg-navy px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Saving" : "Save test"}
        </button>
        {test ? (
          <button type="button" onClick={onDelete} disabled={pending} className="text-sm font-medium text-orange">
            Delete test
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-ink">
      {label}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
