import { Suspense } from "react";
import { TestEditor } from "@/components/test-editor";
import { listAdminCatalog } from "@/lib/data";

export const metadata = { title: "New test" };

export default function NewTestPage() {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-sm text-muted">Loading editor</p>}>
      <NewTest />
    </Suspense>
  );
}

async function NewTest() {
  const catalog = await listAdminCatalog();
  const subjects = catalog.map(({ subject }) => ({ id: subject.id, name: subject.name }));
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10 md:px-10 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight text-navy">New test</h1>
      <div className="mt-8">
        <TestEditor test={null} subjects={subjects} />
      </div>
    </main>
  );
}
