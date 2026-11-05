import { Suspense } from "react";
import { notFound } from "next/navigation";
import { TestEditor } from "@/components/test-editor";
import { getEditorTest, listAdminCatalog } from "@/lib/data";

export default function EditTestPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-sm text-muted">Loading editor</p>}>
      <EditTest params={params} />
    </Suspense>
  );
}

async function EditTest({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [test, catalog] = await Promise.all([getEditorTest(id), listAdminCatalog()]);
  if (!test) notFound();
  const subjects = catalog.map(({ subject }) => ({ id: subject.id, name: subject.name }));

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10 md:px-10 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight text-navy">Edit test</h1>
      <div className="mt-8">
        <TestEditor test={test} subjects={subjects} />
      </div>
    </main>
  );
}
