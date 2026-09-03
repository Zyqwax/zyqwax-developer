import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col">
        <header className="flex h-20 items-center justify-between border-b border-zinc-800">
          <Link className="flex items-center gap-2.5 font-extrabold tracking-[.08em]" href="/"><span className="grid size-[30px] place-items-center overflow-hidden rounded-lg"><Image src="/Z-mark-square.png" alt="ZYQWAX" width={128} height={128} className="size-full object-contain" priority /></span> ZYQWAX <small className="text-[10px] tracking-[.15em] text-amber-400">DEVELOPER</small></Link>
          <nav className="flex items-center gap-6 text-sm text-zinc-400"><a className="hover:text-white" href="/docs">Dokümantasyon</a><a className="rounded-lg bg-amber-400 px-4 py-2.5 font-bold text-zinc-900 hover:bg-amber-300" href="/api/auth/login">Giriş yap</a></nav>
        </header>
        <section className="flex flex-1 flex-col justify-center py-20"><p className="mb-4 text-[11px] font-extrabold tracking-[.16em] text-amber-400">ZYQWAX DEVELOPER PLATFORM</p><h1 className="max-w-4xl text-5xl font-bold leading-[.98] tracking-[-.05em] sm:text-7xl">Kimlik doğrulamayı<br /><span className="text-amber-400">kolayca entegre et.</span></h1><p className="mt-7 max-w-xl text-lg leading-relaxed text-zinc-400">Uygulamanı ZYQWAX OAuth ile bağla. Kullanıcılarına güvenli giriş deneyimi sun, client’larını tek bir yerden yönet.</p><div className="mt-9 flex flex-wrap gap-3"><a className="rounded-lg bg-amber-400 px-5 py-3 font-bold text-zinc-900 hover:bg-amber-300" href="/api/auth/login">Developer Portal’a gir →</a><a className="rounded-lg border border-zinc-700 px-5 py-3 font-bold text-zinc-200 hover:border-zinc-500" href="/docs">Dokümantasyonu incele</a></div></section>
        <section className="grid gap-4 border-t border-zinc-800 py-12 sm:grid-cols-3"><div><p className="mb-2 text-2xl text-amber-400">01</p><h2 className="font-bold">OAuth ile giriş</h2><p className="mt-2 text-sm leading-relaxed text-zinc-500">PKCE ve açık kullanıcı onayıyla güvenli kimlik doğrulama.</p></div><div><p className="mb-2 text-2xl text-amber-400">02</p><h2 className="font-bold">Scope kontrolü</h2><p className="mt-2 text-sm leading-relaxed text-zinc-500">Uygulamanın istediği kullanıcı verilerini açıkça belirle.</p></div><div><p className="mb-2 text-2xl text-amber-400">03</p><h2 className="font-bold">Tek panel</h2><p className="mt-2 text-sm leading-relaxed text-zinc-500">Client ID, secret ve redirect URI’larını yönet.</p></div></section>
        <footer className="flex gap-6 border-t border-zinc-800 py-6 text-xs text-zinc-500"><span>© {new Date().getFullYear()} ZYQWAX</span><a className="hover:text-white" href="https://auth.zyqwax.com">ZYQWAX Auth</a></footer>
      </div>
    </main>
  );
}
