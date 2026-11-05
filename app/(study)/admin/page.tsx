import { Suspense } from "react";
import Link from "next/link";
import { DataMessage } from "@/components/data-message";
import { SubjectForm } from "@/components/subject-form";
import { isSupabaseConfigured } from "@/lib/constants";
import { listAdminCatalog } from "@/lib/data";
import { caughtMessage } from "@/lib/errors";
import type { CatalogGroup } from "@/lib/types";

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-sm text-muted">Loading tests</p>}>
      <AdminHome />
    </Suspense>
  );
}

async function AdminHome() {
  let catalog: CatalogGroup[] | null = null;
  let failure: string | null = null;
  try {
    catalog = await listAdminCatalog();
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
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-navy">Tests</h1>
          <Link href="/admin/tests/new" className="rounded-full bg-navy px-4 py-2 text-sm font-medium text-white">
            New test
          </Link>
        </div>
        {isSupabaseConfigured() ? null : (
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted">
            Supabase is not connected. New tests and edits are saved in .data/store.json on this computer.
          </p>
        )}
        <div className="mt-10 space-y-8">
          {catalog.map(({ subject, tests }) => (
            <section key={subject.id}>
              <h2 className="text-sm font-medium text-muted">{subject.name}</h2>
              {tests.length === 0 ? (
                <p className="mt-2 text-sm text-muted">No tests yet.</p>
              ) : (
                <ul className="mt-2 divide-y divide-line border-y border-line">
                  {tests.map((test) => (
                    <li key={test.id} className="flex items-center justify-between gap-4 py-3">
                      <span className="font-medium">
                        {test.title}
                        {test.published ? null : <span className="ml-2 text-xs font-medium text-orange">Draft</span>}
                      </span>
                      <Link href={`/admin/tests/${test.id}`} className="text-sm font-medium text-navy">
                        Edit
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight text-navy">New subject</h2>
          <SubjectForm />
        </section>
      </main>
  );
}
