import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "About",
  description:
    "Agafari helps organizations launch AI-powered digital service websites from professional templates.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero">
          <div className="container narrow-container">
            <span className="eyebrow">About</span>
            <h1>Shopify for AI organizational websites</h1>
            <p>
              Agafari is a SaaS platform that lets organizations choose a
              template, customize branding, upload knowledge, and launch a
              public site with a dashboard and RAG assistant—without building
              from scratch.
            </p>
            <div className="hero-actions">
              <Link href="/partner" className="button button-primary">
                Start building
              </Link>
              <Link href="/#templates" className="button button-secondary">
                View templates
              </Link>
            </div>
          </div>
        </section>
        <section className="section" id="privacy">
          <div className="container narrow-container">
            <h2>Privacy</h2>
            <p>
              Organization knowledge stays scoped to that organization. Public
              and internal documents are isolated at retrieval. Full privacy
              policy coming soon.
            </p>
          </div>
        </section>
        <section className="section section-soft" id="terms">
          <div className="container narrow-container">
            <h2>Terms</h2>
            <p>
              Agafari provides hosted templates and platform software. Customer
              relationships and end-user support remain with the organization
              that deploys the site. Formal terms coming soon.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
