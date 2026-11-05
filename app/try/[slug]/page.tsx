import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { Banner } from "@/components/banner";
import { DataMessage } from "@/components/data-message";
import { TestScreen } from "@/components/test-screen";
import { getOptionalUser } from "@/lib/auth";
import { getPublicTest } from "@/lib/data";
import { caughtMessage } from "@/lib/errors";
import type { PublicTest, SessionUser } from "@/lib/types";

export default function TryPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <div className="min-h-screen bg-paper">
      <Banner />
      <Suspense fallback={<p className="px-6 py-16 text-sm text-muted">Loading test</p>}>
        <GuestTry params={params} />
      </Suspense>
    </div>
  );
}

async function GuestTry({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let user: SessionUser | null = null;
  let test: PublicTest | null = null;
  let failure: string | null = null;
  try {
    user = await getOptionalUser();
    test = await getPublicTest(slug, { includeUnpublished: user?.role === "admin" });
  } catch (error) {
    failure = caughtMessage(error);
  }
  if (failure) {
    return (
      <div className="px-6 py-16">
        <DataMessage error={failure} />
      </div>
    );
  }
  if (!test) notFound();
  if (user) redirect(`/subjects/${test.subjectSlug}/try/${test.slug}`);
  return <TestScreen test={test} backHref="/" backLabel="Home" />;
}
