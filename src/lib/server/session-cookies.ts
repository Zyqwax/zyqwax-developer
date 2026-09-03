import type { NextResponse } from 'next/server';

const common = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' };

export function setSessionCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  response.cookies.set('developerAccessToken', accessToken, { ...common, maxAge: 15 * 60 });
  response.cookies.set('developerRefreshToken', refreshToken, { ...common, maxAge: 7 * 24 * 60 * 60 });
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.set('developerAccessToken', '', { ...common, maxAge: 0 });
  response.cookies.set('developerRefreshToken', '', { ...common, maxAge: 0 });
  response.cookies.set('oauthState', '', { ...common, maxAge: 0 });
  response.cookies.set('oauthVerifier', '', { ...common, maxAge: 0 });
}
