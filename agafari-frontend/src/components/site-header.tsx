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
          <Link href="/organizations">Organizations</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#for-organizations">For organizations</Link>
        </nav>
        <div className="nav-actions">
          <Link href="/partner" className="button button-ghost nav-partner">
            Partner with us
          </Link>
          <Link href="/organizations" className="button button-primary">
            Explore organizations
          </Link>
        </div>
        <details className="mobile-menu">
          <summary aria-label="Open navigation">
            <span />
            <span />
            <span />
          </summary>
          <nav aria-label="Mobile navigation">
            <Link href="/organizations">Organizations</Link>
            <Link href="/#how-it-works">How it works</Link>
            <Link href="/#for-organizations">For organizations</Link>
            <Link href="/partner">Partner with us</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <AgafariMark />
          <p>
            Clear answers for people. Better insight for organizations.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <h3>Explore</h3>
            <Link href="/organizations">Organizations</Link>
            <Link href="/#how-it-works">How it works</Link>
          </div>
          <div>
            <h3>For organizations</h3>
            <Link href="/partner">Request a pilot</Link>
            <Link href="/#trust">Trust and safety</Link>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Agafari</span>
        <span>Knowledge people can act on.</span>
      </div>
    </footer>
  );
}
