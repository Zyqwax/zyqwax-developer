import Link from "next/link";
import "./docs.css";

const links = [
  ["/docs", "Genel Bakış"],
  ["/docs/getting-started", "Başlarken"],
  ["/docs/configuration", "Yapılandırma"],
  ["/docs/oauth-flow", "OAuth Akışı"],
  ["/docs/scopes", "Scope’lar"],
  ["/docs/security", "Güvenlik"],
  ["/docs/troubleshooting", "Sorun Giderme"],
] as const;

export default async function DocsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="docs-shell">
      <header className="docs-header">
        <Link href="/" className="docs-brand">ZYQWAX <span>DEVELOPER DOCS</span></Link>
        <Link href="/portal" className="docs-back">Developer Portal →</Link>
      </header>
      <div className="docs-body">
        <aside className="docs-sidebar" aria-label="Dokümantasyon menüsü">
          <p>Next.js SDK</p>
          <nav>{links.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}</nav>
        </aside>
        <main className="docs-content">{children}</main>
      </div>
    </div>
  );
}
