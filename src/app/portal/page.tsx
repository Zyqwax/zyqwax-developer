'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';

type App = { id: string; clientId: string; name: string; description: string | null; redirectUris: string[]; allowedOrigins: string[]; allowedScopes: string[]; isActive: boolean };
type Profile = { username?: string; name?: string | null; email?: string; avatarUrl?: string | null };
type Form = { name: string; description: string; redirectUris: string; allowedOrigins: string; allowedScopes: string[] };

const scopeOptions = [
  ['profile', 'Profil', 'Kullanıcı adı, ad ve avatar'],
  ['email', 'E-posta', 'Kullanıcının e-posta adresi'],
  ['friends', 'Arkadaşlar', 'Arkadaş listesi'],
  ['blocks', 'Engeller', 'Engellenen kullanıcılar'],
];
const initial: Form = { name: '', description: '', redirectUris: '', allowedOrigins: '', allowedScopes: ['profile', 'email'] };

async function call(path: string, init?: RequestInit) {
  const response = await fetch(path, { ...init, headers: { 'content-type': 'application/json', ...(init?.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'İşlem tamamlanamadı');
  return data;
}

export default function Home() {
  const router = useRouter();
  const [apps, setApps] = useState<App[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { const [appData, profileData] = await Promise.all([call('/api/apps'), call('/api/session/me')]); setApps(appData.apps); setProfile(profileData); }
    catch (e) { if (e instanceof Error && e.message === 'giriş gerekli') router.replace('/api/auth/login'); else setError(e instanceof Error ? e.message : 'Uygulamalar yüklenemedi'); }
    finally { setLoading(false); }
  }, [router]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  async function create(event: FormEvent) {
    event.preventDefault(); setError('');
    try {
      const result = await call('/api/apps', { method: 'POST', body: JSON.stringify({ name: form.name, description: form.description, redirectUris: form.redirectUris.split('\n').map((x) => x.trim()).filter(Boolean), allowedOrigins: form.allowedOrigins.split('\n').map((x) => x.trim()).filter(Boolean), allowedScopes: form.allowedScopes }) });
      setApps((current) => [result.app, ...current]); setSecret(result.clientSecret); setForm(initial); setCreating(false);
    } catch (e) { setError(e instanceof Error ? e.message : 'Uygulama oluşturulamadı'); }
  }
  async function rotate(id: string) { if (!window.confirm('Yeni secret oluşturulsun mu? Eski secret hemen geçersiz olacak.')) return; try { setSecret((await call(`/api/apps/${id}/secret`, { method: 'POST' })).clientSecret); } catch (e) { setError(e instanceof Error ? e.message : 'Secret yenilenemedi'); } }
  async function disable(id: string) { if (!window.confirm('Bu uygulama devre dışı bırakılsın mı?')) return; try { await call(`/api/apps/${id}`, { method: 'DELETE' }); setApps((current) => current.map((app) => app.id === id ? { ...app, isActive: false } : app)); } catch (e) { setError(e instanceof Error ? e.message : 'İşlem başarısız'); } }
  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); router.replace('/'); }

  return (
    <main className="flex min-h-screen bg-zinc-950 px-[18px] text-zinc-100 sm:px-7">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-zinc-800 py-7 pr-6 md:flex">
        <Link className="mb-12 flex items-center gap-2.5 font-extrabold tracking-[.08em]" href="/"><span className="grid size-[30px] place-items-center rounded-lg bg-amber-400 text-zinc-900">Z</span><span>ZYQWAX<small className="ml-2 text-[10px] tracking-[.15em] text-amber-400">DEV</small></span></Link>
        <p className="mb-3 px-3 text-[10px] font-extrabold tracking-[.16em] text-zinc-600">PORTAL</p>
        <nav className="space-y-1 text-sm font-semibold">
          <Link className="flex items-center gap-3 rounded-lg bg-zinc-800 px-3 py-3 text-white" href="/portal"><span className="text-amber-400">◈</span> Genel bakış</Link>
          <a className="flex items-center gap-3 rounded-lg px-3 py-3 text-zinc-400 hover:bg-zinc-900 hover:text-white" href="#apps"><span>◇</span> Uygulamalar</a>
          <Link className="flex items-center gap-3 rounded-lg px-3 py-3 text-zinc-400 hover:bg-zinc-900 hover:text-white" href="/docs"><span>?</span> Dokümantasyon</Link>
        </nav>
        <div className="mt-auto border-t border-zinc-800 pt-5"><div className="mb-5 flex items-center gap-3 rounded-xl bg-zinc-900 p-3"><div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-amber-400 font-bold text-zinc-900">{profile?.avatarUrl ? <img className="size-full object-cover" src={profile.avatarUrl} alt="" /> : (profile?.name || profile?.username || 'D').slice(0, 1).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-zinc-100">{profile?.name || profile?.username || 'Developer'}</p><p className="truncate text-xs text-zinc-500">{profile?.email || (profile?.username ? `@${profile.username}` : 'ZYQWAX hesabı')}</p></div></div><a className="mb-4 block text-xs text-zinc-500 hover:text-white" href="https://auth.zyqwax.com">ZYQWAX Auth ↗</a><button className="text-sm font-semibold text-red-400 hover:text-red-300" onClick={() => void logout()}>Çıkış yap</button></div>
      </aside>
      <div className="mx-auto min-h-screen w-full max-w-[1180px] md:pl-8">
        <header className="flex h-[74px] items-center justify-between border-b border-zinc-800">
          <Link className="flex items-center gap-2.5 font-extrabold tracking-[.08em]" href="/"><span className="grid size-[30px] place-items-center rounded-lg bg-amber-400 text-zinc-900">Z</span> ZYQWAX <small className="text-[10px] tracking-[.15em] text-amber-400">DEVELOPER</small></Link>
          <nav className="flex items-center gap-6 text-sm text-zinc-400"><Link className="hover:text-white" href="/docs">Dokümantasyon</Link><button className="hover:text-white" onClick={() => void logout()}>Çıkış yap</button></nav>
        </header>

        <section className="flex flex-col justify-between gap-8 border-b border-zinc-800 py-14 sm:flex-row sm:items-end sm:py-20">
          <div><p className="mb-3 text-[11px] font-extrabold tracking-[.16em] text-amber-400">DEVELOPER PORTAL</p><h1 className="mb-5 max-w-3xl text-5xl font-bold leading-none tracking-[-.05em] sm:text-6xl">Ürününü ZYQWAX ile bağla.</h1><p className="max-w-xl text-lg leading-relaxed text-zinc-400">OAuth uygulamalarını oluştur, yönet ve kullanıcılarının ZYQWAX hesaplarıyla güvenli şekilde giriş yapmasını sağla.</p></div>
          <Link className="whitespace-nowrap font-bold text-amber-400" href="/docs">Entegrasyona başla →</Link>
        </section>

        {error && <div className="mt-6 rounded-lg border border-red-900 bg-red-950/60 px-4 py-3 text-red-200">{error}</div>}
        {secret && <div className="mt-6 flex justify-between gap-5 rounded-lg border border-amber-800 bg-amber-950/40 p-5"><div><p className="mb-3 text-[11px] font-extrabold tracking-[.16em] text-amber-400">CLIENT SECRET</p><strong className="mb-3 block">Bu secret yalnızca şimdi gösteriliyor.</strong><code className="mb-3 block break-all font-mono text-xs text-zinc-300">{secret}</code><p className="text-sm text-zinc-400">Güvenli bir yerde sakla. Kaybedersen yeni bir secret oluşturman gerekir.</p></div><button className="self-start rounded-md border border-amber-800 px-3 py-2 text-amber-400" onClick={() => setSecret('')}>Kapat</button></div>}

        <section id="apps" className="py-14 sm:py-16"><div className="mb-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-3 text-[11px] font-extrabold tracking-[.16em] text-amber-400">UYGULAMALARIN</p><h2 className="text-3xl font-bold tracking-tight">OAuth uygulamaları</h2></div><button className="rounded-lg bg-amber-400 px-4 py-3 font-bold text-zinc-900 hover:bg-amber-300" onClick={() => setCreating(!creating)}>+ Yeni uygulama</button></div>
          {creating && <form className="mb-6 max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900 p-7" onSubmit={create}><h3 className="mb-6 text-xl font-bold">Yeni uygulama oluştur</h3><label className="mb-4 block text-sm font-bold text-zinc-300">Uygulama adı<input className="mt-2 block w-full rounded-md border border-zinc-800 bg-zinc-950 p-3 font-normal text-white outline-none focus:border-amber-400" required maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Örn. Blog uygulamam" /></label><label className="mb-4 block text-sm font-bold text-zinc-300">Açıklama <span className="font-normal text-zinc-500">(isteğe bağlı)</span><textarea className="mt-2 block min-h-20 w-full resize-y rounded-md border border-zinc-800 bg-zinc-950 p-3 font-normal text-white outline-none focus:border-amber-400" maxLength={500} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><label className="mb-4 block text-sm font-bold text-zinc-300">Redirect URI <span className="font-normal text-zinc-500">(her satıra bir adres)</span><textarea className="mt-2 block min-h-20 w-full resize-y rounded-md border border-zinc-800 bg-zinc-950 p-3 font-normal text-white outline-none focus:border-amber-400" required value={form.redirectUris} onChange={(e) => setForm({ ...form, redirectUris: e.target.value })} placeholder="https://example.com/api/auth/callback" /></label><label className="mb-4 block text-sm font-bold text-zinc-300">App Origin <span className="font-normal text-zinc-500">(her satıra bir origin)</span><textarea className="mt-2 block min-h-20 w-full resize-y rounded-md border border-zinc-800 bg-zinc-950 p-3 font-normal text-white outline-none focus:border-amber-400" required value={form.allowedOrigins} onChange={(e) => setForm({ ...form, allowedOrigins: e.target.value })} placeholder={"https://example.com\nhttp://localhost:3001"} /><small className="mt-2 block font-normal text-zinc-500">Callback yolu ekleme; yalnızca protokol, host ve gerekiyorsa port yaz.</small></label><fieldset className="mb-4"><legend className="mb-1 text-sm font-bold text-zinc-300">İzin verilen scope&apos;lar</legend>{scopeOptions.map(([id, label, detail]) => <label className="flex items-center gap-2 border-b border-zinc-800/80 py-3 text-sm" key={id}><input className="size-4 accent-amber-400" type="checkbox" checked={form.allowedScopes.includes(id)} onChange={(e) => setForm({ ...form, allowedScopes: e.target.checked ? [...form.allowedScopes, id] : form.allowedScopes.filter((x) => x !== id) })} /><span><b className="block">{label}</b><small className="font-normal text-zinc-400">{detail}</small></span></label>)}</fieldset><div className="mt-7 flex justify-end gap-2"><button type="button" className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3" onClick={() => setCreating(false)}>İptal</button><button className="rounded-lg bg-amber-400 px-4 py-3 font-bold text-zinc-900">Uygulama oluştur</button></div></form>}

          {loading ? <div className="rounded-xl border border-dashed border-zinc-700 p-16 text-center text-zinc-400">Uygulamalar yükleniyor…</div> : apps.length === 0 && !creating ? <div className="rounded-xl border border-dashed border-zinc-700 p-16 text-center text-zinc-400"><div className="mb-4 text-3xl text-amber-400">◈</div><h3 className="mb-2 text-lg font-bold text-zinc-100">Henüz uygulaman yok</h3><p className="mb-6">İlk OAuth uygulamanı oluşturarak entegrasyona başla.</p><button className="rounded-lg bg-amber-400 px-4 py-3 font-bold text-zinc-900" onClick={() => setCreating(true)}>İlk uygulamanı oluştur</button></div> : <div className="grid gap-3">{apps.map((app) => <article className={`grid gap-5 rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:grid-cols-[1fr_auto] ${!app.isActive ? 'opacity-60' : ''}`} key={app.id}><div className="flex items-center gap-3.5"><div className="grid size-11 shrink-0 place-items-center rounded-lg bg-stone-800 text-xl font-extrabold text-amber-400">{app.name[0].toUpperCase()}</div><div><h3 className="mb-1 text-lg font-bold">{app.name} {!app.isActive && <span className="rounded-full bg-zinc-800 px-2 py-1 text-[10px] font-normal text-zinc-400">Devre dışı</span>}</h3><p className="mb-2 text-sm text-zinc-400">{app.description || 'Açıklama eklenmemiş'}</p><code className="break-all font-mono text-xs text-zinc-300">{app.clientId}</code></div></div><div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400"><span>{app.allowedScopes.join(' · ')}</span><span>{app.redirectUris.length} redirect URI</span></div><div className="col-span-full flex flex-wrap gap-5 border-t border-zinc-800 pt-4"><button disabled={!app.isActive} className="text-sm font-bold text-amber-400 disabled:cursor-not-allowed disabled:text-zinc-600" onClick={() => void rotate(app.id)}>Secret yenile</button>{app.isActive && <button className="text-sm font-bold text-red-400" onClick={() => void disable(app.id)}>Devre dışı bırak</button>}</div></article>)}</div>}
        </section>
        <footer className="flex flex-wrap gap-6 border-t border-zinc-800 py-6 text-xs text-zinc-500"><span>© {new Date().getFullYear()} ZYQWAX</span><Link className="hover:text-white" href="/docs">API Docs</Link><a className="hover:text-white" href="https://auth.zyqwax.com">ZYQWAX Auth</a></footer>
      </div>
    </main>
  );
}
