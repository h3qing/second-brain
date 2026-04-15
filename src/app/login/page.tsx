"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "./action";

const messages = [
  "This is Heqing's second brain. Visitors welcome, but only he has the keys. Fork it and build your own.",
  "You found the secret door. Unfortunately, it only opens for one person. But the blueprints are open source.",
  "150+ books live here. One PIN protects them. Yours could too — fork the repo.",
  "This brain is spoken for. But github.com/h3qing/second-brain is free for the taking.",
  "Plot twist: the real second brain is the one you build yourself. Fork this project and start reading.",
  "Heqing reads a lot. This is where the ideas go to be reviewed. You can build your own version.",
  "This vault is invite-only. Population: 1. But the architecture is open — make it population: 2.",
  "Behind this PIN: Kindle highlights, atomic ideas, and one person's attempt to remember what they read.",
];

function LoginForm() {
  const searchParams = useSearchParams();
  const hasError = searchParams.get("error") === "1";
  const isLocked = searchParams.get("locked") === "1";

  const message = useMemo(
    () => messages[Math.floor(Math.random() * messages.length)],
    []
  );

  return (
    <>
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

      <p className="text-muted text-xs text-center mt-8 max-w-xs leading-relaxed" style={{ fontStyle: "italic" }}>
        {message}
      </p>
    </>
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
