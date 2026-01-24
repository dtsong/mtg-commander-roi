import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RATE_LIMIT_REQUESTS = 100;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory rate limiting: works for single-instance deployments and local dev.
// On Vercel serverless, each cold-start gets a fresh Map, so this is ineffective
// at scale. For production rate limiting, use Vercel's built-in firewall rules
// or a distributed store (Redis/Upstash). Kept here since it's harmless and
// provides basic protection in single-instance/dev environments.
const rateLimitStore = new Map<string, RateLimitEntry>();
let lastCleanup = 0;

function cleanupIfStale(now: number) {
  if (now - lastCleanup < RATE_LIMIT_WINDOW_MS) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

function isStaticAsset(pathname: string): boolean {
  if (pathname.startsWith('/_next')) return true;
  if (pathname.startsWith('/data/')) return true;
  if (pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|css|js)$/)) return true;
  return false;
}

function generateCspHeader(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://pagead2.googlesyndication.com https://va.vercel-scripts.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://cards.scryfall.io https://pagead2.googlesyndication.com https://*.doubleclick.net",
    "font-src 'self'",
    "connect-src 'self' https://api.scryfall.com https://va.vercel-scripts.com https://pagead2.googlesyndication.com",
    "frame-src https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' https://formspree.io",
    "upgrade-insecure-requests",
    "report-uri /api/csp-report",
  ].join('; ');
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  const clientIp = getClientIp(request);
  const now = Date.now();
  cleanupIfStale(now);
  const entry = rateLimitStore.get(clientIp);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(clientIp, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
  } else if (entry.count >= RATE_LIMIT_REQUESTS) {
    const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': retryAfterSeconds.toString(),
        'Content-Type': 'text/plain',
      },
    });
  } else {
    entry.count++;
  }

  const nonce = crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set('Content-Security-Policy', generateCspHeader(nonce));
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Report-To', JSON.stringify({
    group: 'csp-endpoint',
    max_age: 86400,
    endpoints: [{ url: '/api/csp-report' }],
  }));

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
