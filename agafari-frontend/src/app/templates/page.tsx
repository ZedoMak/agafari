import type { Metadata } from "next";
import Link from "next/link";
import { LiveSiteSwitcher } from "@/components/landing/live-site-switcher";
import { TemplateCard } from "@/components/landing/template-card";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { PUBLISHED_DEMOS } from "@/lib/demo-sites";
import { DESIGN_TEMPLATES, TEMPLATE_CATALOG } from "@/lib/templates-catalog";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Six template styles for AI service websites. Four run as live mock organizations you can open; the rest are design previews you can request.",
};

export default function TemplatesPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Template gallery</span>
            <h1>Choose the style your visitors deserve</h1>
            <p>
              Every template ships the same engine — public website, public RAG,
              private staff RAG, dashboard. What changes is layout, tone, and
              colour. {PUBLISHED_DEMOS.length} styles are running right now as
              mock organizations you can open; {DESIGN_TEMPLATES.length} are
              design previews you can request.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-head section-head-compact">
              <div>
                <span className="eyebrow">Six styles</span>
                <h2>Pick a direction</h2>
              </div>
              <p>
                Open a template to see it full width. Styles marked “working
                site” have a mock organization live behind them; the rest are
                design only, for now.
              </p>
            </div>
            <div className="gallery-grid">
              {TEMPLATE_CATALOG.map((item) => (
                <TemplateCard item={item} key={item.id} />
              ))}
            </div>
          </div>
        </section>

        <section className="section section-soft" id="live">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Working examples</span>
                <h2>The same product, customized four ways</h2>
              </div>
              <p>
                Each of these is a mock organization on its own site — services,
                policy updates, a public assistant, and feedback. Their team runs
                it from the Agafari admin panel. Branding and wording come from
                their configuration, not from separate code.
              </p>
            </div>

            <LiveSiteSwitcher />
          </div>
        </section>

        <section className="section">
          <div className="container centered-head">
            <span className="eyebrow">Not seeing your style?</span>
            <h2>We build the next template with you</h2>
            <p>
              {DESIGN_TEMPLATES.length} designs are queued. Tell us which one
              fits your organization and we prioritise it for your launch.
            </p>
            <div className="hero-actions" style={{ justifyContent: "center" }}>
              <Link href="/partner" className="button button-primary">
                Request a template
              </Link>
              <Link href="/docs" className="button button-secondary">
                How it works
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
