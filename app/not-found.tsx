import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-6">
      <p className="text-lg text-navy">This page is not here.</p>
      <Link href="/" className="text-sm font-medium text-orange">
        Back home
      </Link>
    </div>
  );
}
