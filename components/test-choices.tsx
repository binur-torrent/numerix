import Link from "next/link";

export function TestChoices({
  tests,
  hrefFor,
  align = "center",
}: {
  tests: { slug: string; title: string }[];
  hrefFor: (slug: string) => string;
  align?: "center" | "start";
}) {
  if (tests.length === 0) {
    return <p className="text-sm text-muted">No published tests yet.</p>;
  }

  return (
    <div className={`flex flex-wrap gap-3 ${align === "center" ? "justify-center" : "justify-start"}`}>
      {tests.map((test) => (
        <Link
          key={test.slug}
          href={hrefFor(test.slug)}
          className="rounded-2xl border border-line bg-white px-5 py-3 text-base font-medium text-navy transition-colors hover:border-orange"
        >
          {test.title}
        </Link>
      ))}
    </div>
  );
}
