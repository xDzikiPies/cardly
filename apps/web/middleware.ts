import { NextRequest, NextResponse } from "next/server";

/**
 * Prosty in-memory rate limiter. UWAGA: na Vercelu (serverless) każda instancja funkcji
 * ma swoją pamięć, więc limit NIE jest globalnie spójny przy dużym ruchu / wielu
 * instancjach. Wystarczające na start i do testów ze znajomymi; przy realnym ruchu
 * podmienić na Upstash Redis (`@upstash/ratelimit`) — ten plik zostaje strukturalnie taki sam.
 */
interface RateLimitRule {
  windowMs: number;
  max: number;
}

// Auth (login/register) ma niższy limit — to tam ktoś mógłby próbować brute-force hasła.
// Reszta API ma wyższy, luźniejszy limit — chroni głównie przed przypadkowym/złośliwym spamem.
const RULES: Record<string, RateLimitRule> = {
  auth: { windowMs: 60_000, max: 10 },
  api: { windowMs: 60_000, max: 60 },
};

const hits = new Map<string, { count: number; resetAt: number }>();

function getClientKey(req: NextRequest, bucket: string): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return `${bucket}:${ip}`;
}

function checkLimit(key: string, rule: RateLimitRule): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + rule.windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  if (entry.count >= rule.max) {
    return { ok: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

export function middleware(req: NextRequest) {
  const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth/");
  const bucket = isAuthRoute ? "auth" : "api";
  const rule = RULES[bucket];

  const { ok, retryAfterSec } = checkLimit(getClientKey(req, bucket), rule);

  if (!ok) {
    return NextResponse.json(
      { error: "TOO_MANY_REQUESTS" },
      { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
    );
  }

  const res = NextResponse.next();
  // Podstawowe nagłówki bezpieczeństwa — Next.js nie dodaje ich domyślnie do API routes.
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return res;
}

export const config = {
  matcher: "/api/:path*",
};
