import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'node:crypto';
import { authConfig } from '@/lib/server/auth-config';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const config = authConfig(request.url);
  const state = randomBytes(32).toString('base64url');
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  const url = new URL(`${config.AUTH_BASE_URL}/oauth/authorize`);
  url.searchParams.set('client_id', config.AUTH_CLIENT_ID);
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'profile email');
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  const response = NextResponse.redirect(url);
  response.cookies.set('oauthState', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 10 * 60 });
  response.cookies.set('oauthVerifier', verifier, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 10 * 60 });
  return response;
}
