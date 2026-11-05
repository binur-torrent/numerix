import Link from "next/link";
import { Logo } from "@/components/logo";

export function Banner({ showSignIn = true }: { showSignIn?: boolean }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-white px-5 sm:px-8">
      <Link href="/" className="flex items-center gap-2.5">
        <Logo />
        <span className="text-[17px] font-semibold tracking-tight text-navy">Numerix</span>
      </Link>
      {showSignIn ? (
        <Link
          href="/login"
          className="rounded-full px-3 py-1.5 text-sm font-medium text-navy hover:bg-paper"
        >
          Sign in
        </Link>
      ) : null}
    </header>
  );
}
