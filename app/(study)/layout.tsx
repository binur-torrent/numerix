import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { requireUser } from "@/lib/auth";
import { listSavedSubjects } from "@/lib/data";

export default function StudyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper md:flex">
      <Suspense
        fallback={
          <div className="h-16 border-b border-line bg-white md:h-screen md:w-64 md:shrink-0 md:border-r md:border-b-0" />
        }
      >
        <SidebarSlot />
      </Suspense>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

async function SidebarSlot() {
  const user = await requireUser();
  const saved = await listSavedSubjects(user.id);
  return <Sidebar user={user} saved={saved} />;
}
