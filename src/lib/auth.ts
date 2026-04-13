import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "secondbrain-session";
const SESSION_DURATION = 30 * 24 * 60 * 60; // 30 days

// In-memory rate limiting (resets on cold start, fine for single-user)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 60 * 60 * 1000; // 1 hour

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    return { allowed: true, remaining: MAX_ATTEMPTS, resetIn: 0 };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const resetIn = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, resetIn };
  }

  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - entry.count,
    resetIn: Math.ceil((entry.resetAt - now) / 1000),
  };
}

export function recordAttempt(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  const updated = { ...entry, count: entry.count + 1 };
  if (updated.count >= MAX_ATTEMPTS) {
    updated.resetAt = now + LOCKOUT_MS;
  }
  loginAttempts.set(ip, updated);
}

export function clearAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const hash = process.env.AUTH_PIN_HASH;
  if (!hash) return false;
  return bcrypt.compare(pin, hash);
}

export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session) return false;

  // Session token is a bcrypt hash of the PIN hash (double-hashed)
  // Verify it matches the stored PIN hash
  const pinHash = process.env.AUTH_PIN_HASH;
  if (!pinHash) return false;
  return bcrypt.compare(pinHash, session.value);
}

export async function createSession(): Promise<void> {
  const pinHash = process.env.AUTH_PIN_HASH;
  if (!pinHash) return;

  // Create a session token by hashing the PIN hash
  const sessionToken = await bcrypt.hash(pinHash, 10);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}
