import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authConfig } from '@/lib/server/auth-config';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const token = (await cookies()).get('developerAccessToken')?.value;
  if (!token) return NextResponse.json({ error: 'giriş gerekli' }, { status: 401 });
  try {
    const config = authConfig(request.url);
    const response = await fetch(`${config.AUTH_BASE_URL}/oauth/userinfo`, { headers: { authorization: `Bearer ${token}` }, cache: 'no-store' });
    return new NextResponse(await response.text(), { status: response.status, headers: { 'content-type': response.headers.get('content-type') || 'application/json' } });
  } catch { return NextResponse.json({ error: 'profil bilgileri alınamadı' }, { status: 502 }); }
}
