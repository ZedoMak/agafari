import Link from "next/link";

export function AgafariMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand-lockup" aria-label="Agafari">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      {!compact && <span className="brand-name">Agafari</span>}
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container nav-inner">
        <Link href="/" className="nav-logo">
          <AgafariMark />
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/#features">Features</Link>
          <Link href="/#templates">Templates</Link>
          <Link href="/#pricing">Pricing</Link>
          <Link href="/docs">Docs</Link>
          <Link href="/about">About</Link>
        </nav>
        <div className="nav-actions">
          <Link href="/partner" className="button button-ghost nav-partner">
            Log in
          </Link>
          <Link href="/partner" className="button button-primary">
            Get started
          </Link>
        </div>
        <details className="mobile-menu">
          <summary aria-label="Open navigation">
            <span />
            <span />
            <span />
          </summary>
          <nav aria-label="Mobile navigation">
            <Link href="/#features">Features</Link>
            <Link href="/#templates">Templates</Link>
            <Link href="/#pricing">Pricing</Link>
            <Link href="/docs">Docs</Link>
            <Link href="/about">About</Link>
            <Link href="/partner">Log in</Link>
            <Link href="/partner">Get started</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer site-footer-saas">
      <div className="container footer-grid footer-grid-saas">
        <div className="footer-brand">
          <AgafariMark />
          <p>
            Shopify for AI-powered organizational websites—templates, dashboard,
            and RAG in one product.
          </p>
        </div>
        <div className="footer-links footer-links-saas">
          <div>
            <h3>Product</h3>
            <Link href="/#features">Features</Link>
            <Link href="/#templates">Templates</Link>
            <Link href="/#pricing">Pricing</Link>
            <Link href="/#demo">Demo</Link>
          </div>
          <div>
            <h3>Resources</h3>
            <Link href="/docs">Docs</Link>
            <Link href="/templates">Template gallery</Link>
            <Link href="/organizations">Live demos</Link>
          </div>
          <div>
            <h3>Company</h3>
            <Link href="/about">About</Link>
            <Link href="/partner">Contact</Link>
          </div>
          <div>
            <h3>Legal</h3>
            <Link href="/about#privacy">Privacy</Link>
            <Link href="/about#terms">Terms</Link>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Agafari</span>
        <div className="footer-socials" aria-label="Social">
          <span>X</span>
          <span>LinkedIn</span>
          <span>GitHub</span>
        </div>
      </div>
    </footer>
  );
}
