# Zyqwax Auth — Next.js entegrasyonu

Bu doküman, `zyqwax-developer` uygulamalarında `@zyqwax-auth/nextjs` package’ının kullanımını anlatır.

## Ne sağlar?

Package, uygulamaya şu akışı ekler:

```text
Login link
  -> Zyqwax Auth consent
  -> OAuth callback
  -> PKCE ve state doğrulaması
  -> token exchange
  -> userinfo
  -> encrypted HttpOnly session
```

Uygulama tarafında OAuth cryptography, token saklama, callback doğrulama veya session cookie üretme kodu yazılmaz.

## Kurulum

Yayınlanmış sürüm için:

```bash
pnpm add @zyqwax-auth/nextjs
```

Monorepo/local geliştirmede:

```json
{
  "dependencies": {
    "@zyqwax-auth/nextjs": "workspace:*"
  }
}
```

`next.config.ts`:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@zyqwax-auth/nextjs'],
};

export default nextConfig;
```

## Environment

```env
ZYQWAX_ISSUER_URL=https://id.zyqwax.com/api
ZYQWAX_CLIENT_ID=<registered-client-id>
ZYQWAX_CLIENT_SECRET=<server-only-secret>
ZYQWAX_REDIRECT_URI=https://<application-domain>/api/auth/callback
ZYQWAX_SESSION_SECRET=<at-least-32-random-characters>
ZYQWAX_SCOPE=profile email
ZYQWAX_POST_LOGIN_REDIRECT=/dashboard
ZYQWAX_POST_LOGOUT_REDIRECT=/
```

Provider panelinde şu callback URI birebir kayıtlı olmalıdır:

```text
https://<application-domain>/api/auth/callback
```

Local örnek:

```text
http://localhost:3200/api/auth/callback
```

Secret değerleri `NEXT_PUBLIC_` ile başlamamalı ve client component’e aktarılmamalıdır.

## Route’lar

`src/lib/auth-config.ts`:

```ts
import { getConfig } from '@zyqwax-auth/nextjs';

export function getAuthConfig() {
  return getConfig();
}
```

`app/api/auth/login/route.ts`:

```ts
import { createLoginHandler } from '@zyqwax-auth/nextjs';
import { getAuthConfig } from '@/lib/auth-config';

export const runtime = 'nodejs';
export const GET = createLoginHandler(getAuthConfig());
```

Aynı yapı ile şu route’ları ekleyin:

```ts
// app/api/auth/callback/route.ts
export const GET = createCallbackHandler(getAuthConfig());

// app/api/auth/me/route.ts
export const GET = createMeHandler(getAuthConfig());

// app/api/auth/logout/route.ts
export const GET = createLogoutHandler(getAuthConfig());
```

Her route dosyasında `runtime = 'nodejs'` bulunmalıdır.

## Client kullanımı

Root layout:

```tsx
import { AuthProvider } from '@zyqwax-auth/nextjs/client';

<AuthProvider>{children}</AuthProvider>
```

Component:

```tsx
'use client';

import { useAuth } from '@zyqwax-auth/nextjs/client';

export function AuthButton() {
  const { loading, isAuthenticated, user, signOut } = useAuth();

  if (loading) return <span>Kontrol ediliyor…</span>;
  if (!isAuthenticated) return <a href="/api/auth/login">Giriş yap</a>;

  return (
    <button type="button" onClick={() => void signOut()}>
      {user?.name ?? user?.username ?? 'Çıkış yap'}
    </button>
  );
}
```

## Scope’lar

| Scope | Dönen alanlar |
| --- | --- |
| `profile` | `sub`, `username`, `name`, `avatarUrl` |
| `email` | `email` |
| `friends` | arkadaş listesi |
| `blocks` | engellenen kullanıcılar |

`username` ayrı bir scope değildir; `profile` içinde gelir.

## Korunan sayfalar

Middleware yalnızca hızlı bir cookie varlık kontrolü yapabilir. Asıl session doğrulaması `/api/auth/me` tarafından yapılmalıdır. Cookie varlığı tek başına authorization kanıtı değildir.

## Test

Package repository’sindeki hazır test app:

```bash
cd zyqwax-auth-package
cp apps/test-app/.env.example apps/test-app/.env.local
pnpm --filter @zyqwax-auth/test-app dev -- --port 3200
```

Kontrol listesi:

- Login provider’a yönleniyor mu?
- Consent ekranı görüntüleniyor mu?
- Approve callback’e dönüyor mu?
- Yanlış state reddediliyor mu?
- Yanlış PKCE verifier reddediliyor mu?
- `/api/auth/me` kullanıcıyı döndürüyor mu?
- Logout cookie’yi temizliyor mu?
- Access token süresi dolduktan sonra refresh çalışıyor mu?

Build ve typecheck geçmesi, gerçek OAuth akışının çalıştığını kanıtlamaz. Özellikle refresh grant provider tarafında etkin olmalıdır.

## Sorun giderme

### `oauth state geçersiz`

- Callback aynı browser/session üzerinden mi çağrıldı?
- `ZYQWAX_SESSION_SECRET` değişti mi?
- Cookie browser tarafından engelleniyor mu?
- Domain, path ve HTTPS ayarlarını kontrol edin.

### `redirect_uri geçersiz`

Environment’taki URI ile provider’daki kayıt karakter karakter aynı olmalıdır. Port ve trailing slash farklarını kontrol edin.

### Build sırasında `Zyqwax Auth yapılandırması eksik`

Build sırasında gerekli server environment değerleri mevcut değil. Local build için `.env.local`, CI için encrypted environment variables kullanın.

### Login sonrası session yok

- `/api/auth/me` çağrısının cookie gönderdiğini kontrol edin.
- Response `Set-Cookie` header’ını kontrol edin.
- Production’da HTTPS kullanıldığında `Secure` cookie’nin HTTP üzerinden test edilmediğinden emin olun.

## Kaynaklar

- Package API ve ayrıntılı kullanım: `@zyqwax-auth/nextjs/README.md`
- Agent/developer kuralları: `@zyqwax-auth/nextjs/AGENTS.md`
- Çalışan örnek: `zyqwax-auth-package/apps/test-app`
