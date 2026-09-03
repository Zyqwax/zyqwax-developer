import { NextRequest, NextResponse } from 'next/server';
import { authConfig } from '@/lib/server/auth-config';
import { setSessionCookies } from '@/lib/server/session-cookies';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get('error');
  if (error) return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error)}`, request.url));
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const expectedState = request.cookies.get('oauthState')?.value;
  const verifier = request.cookies.get('oauthVerifier')?.value;
  if (!code || !state || !expectedState || state !== expectedState || !verifier) return NextResponse.redirect(new URL('/?error=invalid_callback', request.url));
  try {
    const config = authConfig(request.url);
    const body = new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: config.redirectUri, client_id: config.AUTH_CLIENT_ID, client_secret: config.AUTH_CLIENT_SECRET, code_verifier: verifier });
    const tokenResponse = await fetch(`${config.AUTH_BASE_URL}/oauth/token`, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body, cache: 'no-store' });
    if (!tokenResponse.ok) throw new Error('token exchange failed');
    const tokens = await tokenResponse.json() as { access_token?: string; refresh_token?: string };
    if (!tokens.access_token || !tokens.refresh_token) throw new Error('missing tokens');
    const onboardResponse = await fetch(`${config.AUTH_BASE_URL}/developer/onboard`, { method: 'POST', headers: { authorization: `Bearer ${tokens.access_token}` }, cache: 'no-store' });
    if (!onboardResponse.ok) throw new Error('developer onboarding failed');
    const response = NextResponse.redirect(new URL('/portal', request.url));
    setSessionCookies(response, tokens.access_token, tokens.refresh_token);
    response.cookies.set('oauthState', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
    response.cookies.set('oauthVerifier', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
    return response;
  } catch { return NextResponse.redirect(new URL('/?error=login_failed', request.url)); }
}
