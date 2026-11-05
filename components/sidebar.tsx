"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions";
import { Logo } from "@/components/logo";
import type { SessionUser, Subject } from "@/lib/types";

export function Sidebar({ user, saved }: { user: SessionUser; saved: Subject[] }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-20 border-b border-line bg-white md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-r md:border-b-0">
      <Link href="/subjects" className="flex items-center gap-2.5 px-4 py-4">
        <Logo />
        <span className="text-[17px] font-semibold tracking-tight text-navy">Numerix</span>
      </Link>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:overflow-y-auto md:pb-4">
        <NavLink href="/subjects" active={pathname === "/subjects"}>
          All subjects
        </NavLink>
        {saved.map((subject) => (
          <NavLink
            key={subject.id}
            href={`/subjects/${subject.slug}`}
            active={pathname.startsWith(`/subjects/${subject.slug}`)}
          >
            {subject.name}
          </NavLink>
        ))}
        <div className="ml-auto flex items-center md:hidden">
          {user.role === "admin" ? (
            <NavLink href="/admin" active={pathname.startsWith("/admin")}>
              Admin
            </NavLink>
          ) : null}
          <form action={signOut}>
            <button type="submit" className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-navy">
              Sign out
            </button>
          </form>
        </div>
      </nav>
      <div className="mt-auto hidden border-t border-line px-3 py-3 md:block">
        {user.role === "admin" ? (
          <NavLink href="/admin" active={pathname.startsWith("/admin")}>
            Admin
          </NavLink>
        ) : null}
        <p className="mt-3 truncate px-3 text-xs text-muted">{user.email}</p>
        <form action={signOut}>
          <button type="submit" className="rounded-xl px-3 py-2 text-sm font-medium text-navy hover:bg-paper">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-navy text-white" : "text-ink hover:bg-paper"
      }`}
    >
      {children}
    </Link>
  );
}
