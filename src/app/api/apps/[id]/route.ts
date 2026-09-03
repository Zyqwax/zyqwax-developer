import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authConfig } from '@/lib/server/auth-config';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { return forward(request, (await params).id); }
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { return forward(request, (await params).id); }

async function forward(request: NextRequest, id: string) {
  const token = (await cookies()).get('developerAccessToken')?.value;
  if (!token) return NextResponse.json({ error: 'giriş gerekli' }, { status: 401 });
  const config = authConfig(request.url);
  const response = await fetch(`${config.AUTH_BASE_URL}/developer/apps/${encodeURIComponent(id)}`, { method: request.method, headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: await request.text(), cache: 'no-store' });
  return new NextResponse(await response.text(), { status: response.status, headers: { 'content-type': response.headers.get('content-type') || 'application/json' } });
}
