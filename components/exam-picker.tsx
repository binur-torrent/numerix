"use client";

import { useState } from "react";
import { TestChoices } from "@/components/test-choices";

type Group = {
  slug: string;
  name: string;
  tests: { slug: string; title: string }[];
};

export function ExamPicker({ groups }: { groups: Group[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const selected = groups.find((group) => group.slug === open);

  if (groups.length === 0) {
    return <p className="text-sm text-muted">No mock tests are published yet.</p>;
  }

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-8">
      <div className="flex flex-wrap items-center justify-center gap-4">
        {groups.map((group) => {
          const active = group.slug === open;
          return (
            <button
              key={group.slug}
              type="button"
              aria-expanded={active}
              onClick={() => setOpen(active ? null : group.slug)}
              className={`min-w-36 rounded-2xl px-8 py-4 text-lg font-semibold tracking-tight text-white transition-colors ${
                active ? "bg-orange" : "bg-navy hover:bg-[#1b275f]"
              }`}
            >
              {group.name}
            </button>
          );
        })}
      </div>
      {selected ? (
        <TestChoices tests={selected.tests} hrefFor={(slug) => `/try/${slug}`} />
      ) : null}
    </div>
  );
}
