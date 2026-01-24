import { NextResponse } from 'next/server';

const MAX_BODY_SIZE = 10 * 1024; // 10KB

export async function POST(request: Request) {
  let text: string;
  try {
    text = await request.text();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  if (text.length > MAX_BODY_SIZE) {
    return new NextResponse(null, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(text);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const report = body['csp-report'] as Record<string, unknown> | undefined;
  if (
    !report ||
    typeof report !== 'object' ||
    !report['document-uri'] ||
    !report['violated-directive']
  ) {
    return new NextResponse(null, { status: 400 });
  }

  console.warn('[CSP Violation]', JSON.stringify(report, null, 2));
  return new NextResponse(null, { status: 204 });
}
