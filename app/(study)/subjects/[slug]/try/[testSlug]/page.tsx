import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DataMessage } from "@/components/data-message";
import { TestScreen } from "@/components/test-screen";
import { requireUser } from "@/lib/auth";
import { getPublicTest } from "@/lib/data";
import { caughtMessage } from "@/lib/errors";
import type { PublicTest } from "@/lib/types";

export default function StudyTryPage({
  params,
}: {
  params: Promise<{ slug: string; testSlug: string }>;
}) {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-sm text-muted">Loading test</p>}>
      <StudyTry params={params} />
    </Suspense>
  );
}

async function StudyTry({ params }: { params: Promise<{ slug: string; testSlug: string }> }) {
  const { slug, testSlug } = await params;
  const user = await requireUser();
  let test: PublicTest | null = null;
  let failure: string | null = null;
  try {
    test = await getPublicTest(testSlug, { includeUnpublished: user.role === "admin" });
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
  if (!test || test.subjectSlug !== slug) notFound();
  return <TestScreen test={test} backHref={`/subjects/${slug}`} backLabel={test.subjectName} />;
}
