import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AddSubjectButton } from "@/components/add-subject-button";
import { DataMessage } from "@/components/data-message";
import { TestChoices } from "@/components/test-choices";
import { requireUser } from "@/lib/auth";
import { getSubjectWithTests, listSavedSubjects } from "@/lib/data";
import { caughtMessage } from "@/lib/errors";
import type { CatalogGroup, Subject } from "@/lib/types";

export default function SubjectPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-sm text-muted">Loading subject</p>}>
      <Subject params={params} />
    </Suspense>
  );
}

async function Subject({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireUser();
  let group: CatalogGroup | null = null;
  let saved: Subject[] = [];
  let failure: string | null = null;
  try {
    group = await getSubjectWithTests(slug);
    saved = await listSavedSubjects(user.id);
  } catch (error) {
    failure = caughtMessage(error);
  }
  if (failure) {
    return (
      <main className="px-6 py-16">
        <DataMessage error={failure} />
      </main>
    );
  }
  if (!group) notFound();
  const isSaved = saved.some((subject) => subject.id === group.subject.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10 md:px-10 md:py-14">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-navy">{group.subject.name}</h1>
          {group.subject.description ? <p className="mt-2 max-w-xl text-muted">{group.subject.description}</p> : null}
        </div>
        <AddSubjectButton slug={group.subject.slug} saved={isSaved} />
      </div>
      <div className="mt-10">
        <TestChoices
          tests={group.tests}
          align="start"
          hrefFor={(testSlug) => `/subjects/${group.subject.slug}/try/${testSlug}`}
        />
      </div>
    </main>
  );
}
