"use client";

import { useEffect } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "../../components/auth/useAuth";

export default function LoginPage() {
  const { isAuthenticated, loading, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (loading || !isAuthenticated) {
      return;
    }

    const nextPath = searchParams.get("next") || "/";
    router.replace(nextPath as Parameters<typeof router.replace>[0]);
  }, [isAuthenticated, loading, router, searchParams]);

  return (
    <main className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden px-6 py-14 bg-[var(--color-background)]">
      <div
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{
          background:
            "radial-gradient(40rem 24rem at 8% 10%, rgba(99, 102, 241, 0.15), transparent), radial-gradient(34rem 20rem at 92% 80%, rgba(16, 185, 129, 0.15), transparent)"
        }}
      />

      <section
        className="relative mx-auto flex w-full max-w-md flex-col gap-6 rounded-3xl border border-[var(--color-border)]/50 bg-[#0D0F14]/50 p-10 backdrop-blur-xl shadow-2xl"
      >
        <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-primary)]">Earnify Access</p>
        <h1 className="text-3xl font-bold leading-tight text-white">Sign in to launch and track campaigns</h1>
        <p className="text-sm leading-relaxed text-[var(--color-muted)]">
          Use your Google account to continue. Earnify will issue a secure session token in an httpOnly cookie.
        </p>

        <button
          type="button"
          onClick={loginWithGoogle}
          className="group mt-4 inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] px-6 py-4 text-base font-bold text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.7)]"
        >
          <span
            aria-hidden
            className="inline-block h-3 w-3 rounded-full bg-white animate-pulse"
          />
          Continue with Google
        </button>
      </section>
    </main>
  );
}
