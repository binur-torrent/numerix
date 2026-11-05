import { Suspense } from "react";
import { Banner } from "@/components/banner";
import { DataMessage } from "@/components/data-message";
import { ExamPicker } from "@/components/exam-picker";
import { listCatalog } from "@/lib/data";
import { caughtMessage } from "@/lib/errors";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-paper">
      <Banner />
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
        <Suspense fallback={<PickerFallback />}>
          <GuestCatalog />
        </Suspense>
      </main>
    </div>
  );
}

async function GuestCatalog() {
  let groups: { slug: string; name: string; tests: { slug: string; title: string }[] }[] | null = null;
  let failure: string | null = null;
  try {
    const catalog = await listCatalog();
    groups = catalog
      .filter((group) => group.tests.length > 0)
      .map((group) => ({
        slug: group.subject.slug,
        name: group.subject.name,
        tests: group.tests.map((test) => ({ slug: test.slug, title: test.title })),
      }));
  } catch (error) {
    failure = caughtMessage(error);
  }
  if (failure || !groups) return <DataMessage error={failure ?? "Could not load tests."} />;
  return <ExamPicker groups={groups} />;
}

function PickerFallback() {
  return (
    <div className="flex gap-4">
      <div className="h-14 w-36 rounded-2xl bg-white" />
      <div className="h-14 w-36 rounded-2xl bg-white" />
    </div>
  );
}
