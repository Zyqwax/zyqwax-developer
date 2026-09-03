import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authConfig } from '@/lib/server/auth-config';

export const runtime = 'nodejs';

async function forward(request: NextRequest) {
  const token = (await cookies()).get('developerAccessToken')?.value;
  if (!token) return NextResponse.json({ error: 'giriş gerekli' }, { status: 401 });
  const config = authConfig(request.url);
  const response = await fetch(`${config.AUTH_BASE_URL}/developer/apps`, { method: request.method, headers: { authorization: `Bearer ${token}`, ...(request.method !== 'GET' ? { 'content-type': 'application/json' } : {}) }, body: request.method === 'GET' ? undefined : await request.text(), cache: 'no-store' });
  const body = await response.text();
  return new NextResponse(body, { status: response.status, headers: { 'content-type': response.headers.get('content-type') || 'application/json' } });
}

export const GET = forward;
export const POST = forward;
