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
                Browse the{" "}
                <Link href="/#templates">template showcase</Link> or{" "}
                <Link href="/templates">gallery</Link>. Clarity and Pulse have
                live demos.
              </p>
            </article>
            <article>
              <h2>2. Customize branding</h2>
              <p>
                Logo, colors, terminology, and services are controlled from the
                organization dashboard after you subscribe.
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
              <Link href="/organizations/hope-aid" className="button button-secondary">
                Open Clarity demo
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
