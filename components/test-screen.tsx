import Link from "next/link";
import { TestRunner } from "@/components/test-runner";
import type { PublicTest } from "@/lib/types";

export function TestScreen({
  test,
  backHref,
  backLabel,
}: {
  test: PublicTest;
  backHref: string;
  backLabel: string;
}) {
  return (
    <main className={`mx-auto w-full px-6 py-8 md:px-10 md:py-12 ${test.passage ? "max-w-5xl" : "max-w-3xl"}`}>
      <Link href={backHref} className="text-sm font-medium text-muted hover:text-navy">
        {backLabel}
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-navy">{test.title}</h1>
      {test.description ? <p className="mt-2 text-muted">{test.description}</p> : null}
      <div className="mt-8">
        <TestRunner test={test} />
      </div>
    </main>
  );
}
