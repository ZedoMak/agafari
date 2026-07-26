import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { HOPE_AID_DEMO } from "@/lib/demo-sites";

export const metadata: Metadata = {
  title: "Demos",
  description:
    "Company site demos live under /sites/[slug]. Marketing no longer hosts customer service here.",
};

export default function OrganizationsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero">
          <div className="container narrow-container">
            <span className="eyebrow">Demos moved</span>
            <h1>Company sites live under /sites</h1>
            <p>
              Agafari does not serve organization customers on this marketing
              directory. Published demos are isolated company sites. The current
              mock Clarity demo is Hope Aid.
            </p>
            <p className="mock-data-callout">
              Demo uses <strong>mock data only</strong>
            </p>
            <div className="hero-actions">
              <Link
                href={HOPE_AID_DEMO.siteHref}
                className="button button-primary"
              >
                Open {HOPE_AID_DEMO.siteHref}
              </Link>
              <Link href="/templates" className="button button-secondary">
                View embedded preview
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
