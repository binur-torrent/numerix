"use client";

import { useActionState, useState } from "react";
import { authenticate } from "@/lib/actions";

export function LoginForm({ next, setupError }: { next: string; setupError?: string | null }) {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [state, action, pending] = useActionState(authenticate, null);

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-3xl font-semibold tracking-tight text-navy">
        {mode === "sign-in" ? "Sign in" : "Create an account"}
      </h1>
      <form action={action} className="mt-8 space-y-4">
        <input type="hidden" name="intent" value={mode} />
        <input type="hidden" name="next" value={next} />
        <label className="block text-sm font-medium text-ink">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-3 outline-none"
          />
        </label>
        <label className="block text-sm font-medium text-ink">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            className="mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-3 outline-none"
          />
        </label>
        {setupError ? <p className="text-sm leading-6 text-orange">{setupError}</p> : null}
        {state?.error ? <p className="text-sm leading-6 text-orange">{state.error}</p> : null}
        {state?.notice ? <p className="text-sm leading-6 text-navy">{state.notice}</p> : null}
        <button
          type="submit"
          disabled={pending || Boolean(setupError)}
          className="h-11 w-full rounded-xl bg-navy text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Please wait" : mode === "sign-in" ? "Sign in" : "Create account"}
        </button>
      </form>
      <button
        type="button"
        onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
        className="mt-4 text-sm font-medium text-navy"
      >
        {mode === "sign-in" ? "Need an account?" : "Already have an account?"}
      </button>
    </div>
  );
}
