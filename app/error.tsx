"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-6">
      <p className="text-lg text-navy">Something went wrong.</p>
      <button type="button" onClick={reset} className="text-sm font-medium text-orange">
        Try again
      </button>
    </div>
  );
}
