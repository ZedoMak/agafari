import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "How Agafari works—templates, customization, knowledge upload, and launching your AI website.",
};

export default function DocsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero">
          <div className="container narrow-container">
            <span className="eyebrow">Docs</span>
            <h1>Get oriented in minutes</h1>
            <p>
              Agafari ships a template-based website, admin dashboard, and
              RAG assistant. Start with a template, customize, upload docs,
              launch.
            </p>
          </div>
        </section>
        <section className="section">
          <div className="container narrow-container docs-list">
            <article>
              <h2>1. Choose a template</h2>
              <p>
                Browse the <Link href="/templates">template gallery</Link>. Four
                styles run as mock organizations you can open — from{" "}
                <Link href="/sites/hope-aid">Hope Aid</Link> to{" "}
                <Link href="/sites/northbridge">Northbridge University</Link>.
              </p>
            </article>
            <article>
              <h2>2. Customize branding</h2>
              <p>
                Logo, colors, terminology, and services are controlled from the
                organization dashboard after you subscribe. The four demo sites
                are the same template with different configuration — Northbridge
                even renames every &ldquo;service&rdquo; to
                &ldquo;programme&rdquo;.
              </p>
            </article>
            <article>
              <h2>3. Upload knowledge</h2>
              <p>
                Mark documents PUBLIC or INTERNAL, approve indexing, and let the
                assistant answer with citations.
              </p>
            </article>
            <article>
              <h2>4. Launch</h2>
              <p>
                Your organization gets a dedicated hosted site. You serve
                visitors from that site—not from Agafari&apos;s marketing pages.
              </p>
            </article>
            <div className="hero-actions">
              <Link href="/partner" className="button button-primary">
                Start building
              </Link>
              <Link href="/templates" className="button button-secondary">
                Compare live demo sites
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
