import { Suspense } from "react";
import { Banner } from "@/components/banner";
import { LoginForm } from "@/components/login-form";
import { supabaseConfigError } from "@/lib/constants";

export const metadata = { title: "Sign in" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
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

async function LoginContent({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/subjects";
  const confirmError =
    params.error === "confirm" ? "That confirmation link did not sign you in. Create the account again to get a new email." : null;
  return <LoginForm next={next} setupError={confirmError ?? supabaseConfigError()} />;
}
