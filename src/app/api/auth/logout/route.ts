import { NextRequest, NextResponse } from 'next/server';
import { authConfig } from '@/lib/server/auth-config';
import { clearSessionCookies } from '@/lib/server/session-cookies';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('developerRefreshToken')?.value;
  try {
    if (refreshToken) {
      const config = authConfig(request.url);
      await fetch(`${config.AUTH_BASE_URL}/auth/logout`, { method: 'POST', headers: { cookie: `refreshToken=${encodeURIComponent(refreshToken)}` }, cache: 'no-store' });
    }
  } finally {
    const response = NextResponse.json({ ok: true });
    clearSessionCookies(response);
    return response;
  }
}
