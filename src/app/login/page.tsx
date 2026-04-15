"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "./action";

function LoginForm() {
  const searchParams = useSearchParams();
  const hasError = searchParams.get("error") === "1";
  const isLocked = searchParams.get("locked") === "1";

  return (
    <form action={loginAction} className="w-full max-w-xs space-y-4">
      <div>
        <input
          type="password"
          name="pin"
          placeholder="Enter PIN"
          autoComplete="current-password"
          inputMode="numeric"
          className="w-full px-4 py-3 text-center text-lg tracking-widest bg-transparent border-2 border-border rounded-lg focus:outline-none focus:border-foreground transition-colors font-mono"
          required
          autoFocus
          disabled={isLocked}
        />
      </div>

      {hasError && (
        <p className="text-danger text-sm text-center">
          Wrong PIN. Try again.
        </p>
      )}

      {isLocked && (
        <p className="text-danger text-sm text-center">
          Too many attempts. Try again in an hour.
        </p>
      )}

      <button
        type="submit"
        className="btn w-full bg-foreground text-background border-foreground"
        disabled={isLocked}
      >
        Enter
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <p className="label mb-2">Second Brain</p>
      <h1 className="text-2xl font-heading mb-1">Review Mode</h1>
      <p className="text-muted text-sm mb-8">
        Enter PIN to access your review queue
      </p>

      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
