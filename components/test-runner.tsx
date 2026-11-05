"use client";

import { useState, useTransition } from "react";
import { gradeAttempt } from "@/lib/actions";
import type { GradeResult, PublicTest } from "@/lib/types";

const letters = ["A", "B", "C", "D", "E", "F"];

export function TestRunner({ test }: { test: PublicTest }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<GradeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const question = test.questions[index];

  function finish() {
    setError(null);
    startTransition(async () => {
      const graded = await gradeAttempt(test.slug, answers);
      if ("error" in graded) {
        setError(graded.error);
        return;
      }
      setResult(graded);
    });
  }

  if (result) {
    return <Result result={result} />;
  }

  if (!question) {
    return <p className="text-sm text-muted">This test has no questions yet.</p>;
  }

  return (
    <div className={test.passage ? "grid items-start gap-8 lg:grid-cols-2" : ""}>
      {test.passage ? <Passage text={test.passage} /> : null}
      <div>
        <p className="text-sm font-medium text-muted">
          Question {index + 1} of {test.questions.length}
        </p>
        <h2 className="mt-3 text-2xl font-medium leading-snug tracking-tight text-ink">{question.prompt}</h2>
        <div className="mt-6 space-y-3">
          {question.choices.map((choice, choiceIndex) => {
            const selected = answers[question.id] === choiceIndex;
            return (
              <button
                key={choice}
                type="button"
                onClick={() => setAnswers((current) => ({ ...current, [question.id]: choiceIndex }))}
                className={`flex w-full items-start gap-4 rounded-2xl border px-4 py-3.5 text-left transition-colors ${
                  selected ? "border-navy bg-white ring-2 ring-navy" : "border-line bg-white hover:border-navy/30"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    selected ? "bg-orange text-white" : "bg-paper text-navy"
                  }`}
                >
                  {letters[choiceIndex]}
                </span>
                <span className="pt-1 leading-6">{choice}</span>
              </button>
            );
          })}
        </div>
        {error ? <p className="mt-4 text-sm text-orange">{error}</p> : null}
        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIndex((current) => current - 1)}
            disabled={index === 0 || pending}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-navy disabled:opacity-40"
          >
            Back
          </button>
          {index === test.questions.length - 1 ? (
            <button
              type="button"
              onClick={finish}
              disabled={pending}
              className="rounded-xl bg-navy px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {pending ? "Scoring" : "Finish"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIndex((current) => current + 1)}
              className="rounded-xl bg-navy px-5 py-2.5 text-sm font-medium text-white"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Passage({ text }: { text: string }) {
  return (
    <article className="rounded-3xl border border-line bg-white p-6 text-[15px] leading-7 md:p-8">
      {text.split("\n\n").map((paragraph) => (
        <p key={paragraph.slice(0, 32)} className="mt-4 first:mt-0">
          {paragraph}
        </p>
      ))}
    </article>
  );
}

function Result({ result }: { result: GradeResult }) {
  return (
    <div>
      <p className="text-sm font-medium text-orange">Result</p>
      <p className="mt-2 text-5xl font-semibold tracking-tight text-navy">
        {result.correct}
        <span className="text-2xl font-medium text-muted"> / {result.total}</span>
      </p>
      <ol className="mt-10 space-y-4">
        {result.review.map((item, index) => {
          const correct = item.selectedIndex === item.correctIndex;
          return (
            <li key={item.id} className="rounded-3xl border border-line bg-white p-6">
              <p className="text-sm text-muted">Question {index + 1}</p>
              <p className="mt-2 text-lg font-medium leading-snug">{item.prompt}</p>
              <p className={`mt-3 text-sm font-medium ${correct ? "text-navy" : "text-orange"}`}>
                {correct ? "Correct" : "Not correct"}
              </p>
              <p className="mt-2 text-sm leading-6">
                Your answer: {item.selectedIndex === null ? "Blank" : item.choices[item.selectedIndex]}
              </p>
              {correct ? null : (
                <p className="mt-1 text-sm leading-6">Answer: {item.choices[item.correctIndex]}</p>
              )}
              {item.explanation ? <p className="mt-3 text-sm leading-6 text-muted">{item.explanation}</p> : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
