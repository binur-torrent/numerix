import { removeSubject, saveSubject } from "@/lib/actions";

export function AddSubjectButton({ slug, saved }: { slug: string; saved: boolean }) {
  return (
    <form action={saved ? removeSubject : saveSubject}>
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        aria-label={saved ? "Remove from my subjects" : "Add to my subjects"}
        title={saved ? "In my subjects" : "Add to my subjects"}
        className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-sm transition-colors ${
          saved ? "bg-navy" : "bg-orange hover:bg-[#e45404]"
        }`}
      >
        {saved ? <CheckIcon /> : <PlusIcon />}
      </button>
    </form>
  );
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <path d="M11 4v14M4 11h14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <path d="M5 11.5 9 15.5 17 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
