"use client";

import { useActionState, useEffect, useRef } from "react";
import { createSubject } from "@/lib/actions";

export function SubjectForm() {
  const [state, action, pending] = useActionState(createSubject, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
      <input
        name="name"
        required
        placeholder="Subject name"
        className="h-11 rounded-xl border border-line bg-white px-3 outline-none"
      />
      <input
        name="slug"
        required
        placeholder="slug"
        className="h-11 rounded-xl border border-line bg-white px-3 outline-none"
      />
      <input
        name="description"
        placeholder="Short description"
        className="h-11 rounded-xl border border-line bg-white px-3 outline-none sm:col-span-2"
      />
      {state?.error ? <p className="text-sm text-orange sm:col-span-2">{state.error}</p> : null}
      {state?.ok ? <p className="text-sm text-navy sm:col-span-2">Subject added.</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-xl bg-navy px-4 text-sm font-medium text-white disabled:opacity-60 sm:w-fit"
      >
        {pending ? "Adding" : "Add subject"}
      </button>
    </form>
  );
}
