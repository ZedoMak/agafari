import type { Metadata } from "next";
import Link from "next/link";
import { TemplatePreview } from "@/components/landing/template-preview";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { TEMPLATE_CATALOG } from "@/lib/templates-catalog";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Browse Agafari templates for education, healthcare, government, NGOs, and more. Preview or start building.",
};

export default function TemplatesPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Template gallery</span>
            <h1>Professional templates for AI service websites</h1>
            <p>
              Pick a starting point, customize branding and knowledge, and
              launch. Clarity and Pulse include live demos today.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="template-showcase">
              {TEMPLATE_CATALOG.map((template) => (
                <article
                  className="showcase-card"
                  key={template.id}
                  id={template.id}
                >
                  <TemplatePreview template={template} />
                  <div className="showcase-card-body">
                    <div className="showcase-card-meta">
                      <span className="sector-badge">{template.category}</span>
                      {template.live ? (
                        <span className="live-pill">Live demo</span>
                      ) : null}
                    </div>
                    <h3>{template.name}</h3>
                    <p>{template.description}</p>
                    <div className="template-card-actions">
                      <Link
                        href={template.previewHref}
                        className="button button-secondary button-small"
                      >
                        Preview
                      </Link>
                      <Link
                        href={template.useHref}
                        className="button button-primary button-small"
                      >
                        Use template
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
