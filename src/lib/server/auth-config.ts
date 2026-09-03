import { z } from 'zod';

const schema = z.object({
  AUTH_BASE_URL: z.string().url().default('http://localhost:3000/api'),
  AUTH_CLIENT_ID: z.string().min(1),
  AUTH_CLIENT_SECRET: z.string().min(1),
  AUTH_REDIRECT_URI: z.string().url().optional(),
});

export function authConfig(requestUrl?: string) {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) throw new Error('Auth yapılandırması eksik');
  const base = parsed.data.AUTH_BASE_URL.replace(/\/$/, '');
  const authBaseUrl = base.endsWith('/api') ? base : `${base}/api`;
  return { ...parsed.data, AUTH_BASE_URL: authBaseUrl, redirectUri: parsed.data.AUTH_REDIRECT_URI || (requestUrl ? `${new URL(requestUrl).origin}/api/auth/callback` : '') };
}
