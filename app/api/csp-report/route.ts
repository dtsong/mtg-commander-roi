import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.warn('[CSP Violation]', JSON.stringify(body['csp-report'] || body, null, 2));
  } catch {
    // Malformed report body - ignore
  }
  return new NextResponse(null, { status: 204 });
}
