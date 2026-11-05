import { Suspense } from "react";
import Link from "next/link";
import { DataMessage } from "@/components/data-message";
import { listCatalog } from "@/lib/data";
import { caughtMessage } from "@/lib/errors";
import type { CatalogGroup } from "@/lib/types";

export const metadata = { title: "All subjects" };

export default function SubjectsPage() {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-sm text-muted">Loading subjects</p>}>
      <Subjects />
    </Suspense>
  );
}

async function Subjects() {
  let catalog: CatalogGroup[] | null = null;
  let failure: string | null = null;
  try {
    catalog = await listCatalog();
  } catch (error) {
    failure = caughtMessage(error);
  }
  if (failure || !catalog) {
    return (
      <main className="px-6 py-16">
        <DataMessage error={failure ?? "Could not load tests."} />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10 md:px-10 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight text-navy">All subjects</h1>
      <p className="mt-2 text-sm text-muted">Open a subject and press + to keep it in the sidebar.</p>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {catalog.map(({ subject, tests }) => (
          <li key={subject.id}>
            <Link href={`/subjects/${subject.slug}`} className="flex items-baseline justify-between gap-6 py-5">
              <span>
                <span className="block text-xl font-medium text-ink">{subject.name}</span>
                <span className="mt-1 block text-sm text-muted">{subject.description}</span>
              </span>
              <span className="shrink-0 text-sm text-muted">
                {tests.length} {tests.length === 1 ? "test" : "tests"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
