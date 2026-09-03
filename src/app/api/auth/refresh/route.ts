import { NextRequest, NextResponse } from 'next/server';
import { authConfig } from '@/lib/server/auth-config';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('developerRefreshToken')?.value;
  if (!refreshToken) return NextResponse.json({ error: 'giriş gerekli' }, { status: 401 });
  try {
    const config = authConfig(request.url);
    const tokenResponse = await fetch(`${config.AUTH_BASE_URL}/auth/refresh`, { method: 'POST', headers: { cookie: `refreshToken=${encodeURIComponent(refreshToken)}` }, cache: 'no-store' });
    const data = await tokenResponse.json() as { accessToken?: string; error?: string };
    if (!tokenResponse.ok || !data.accessToken) return NextResponse.json({ error: data.error || 'oturum yenilenemedi' }, { status: tokenResponse.status });
    const rotatedCookie = tokenResponse.headers.get('set-cookie')?.match(/refreshToken=([^;]+)/)?.[1];
    const response = NextResponse.json({ ok: true });
    response.cookies.set('developerAccessToken', data.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 15 * 60 });
    if (rotatedCookie) response.cookies.set('developerRefreshToken', decodeURIComponent(rotatedCookie), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 7 * 24 * 60 * 60 });
    return response;
  } catch { return NextResponse.json({ error: 'oturum yenilenemedi' }, { status: 502 }); }
}
