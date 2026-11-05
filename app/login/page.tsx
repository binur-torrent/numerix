import { Suspense } from "react";
import { Banner } from "@/components/banner";
import { LoginForm } from "@/components/login-form";
import { isSupabaseConfigured } from "@/lib/constants";

export const metadata = { title: "Sign in" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Banner showSignIn={false} />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <Suspense>
          <LoginContent searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function LoginContent({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/subjects";
  return <LoginForm next={next} demo={!isSupabaseConfigured()} />;
}
