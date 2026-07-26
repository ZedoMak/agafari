import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteEmbed } from "@/components/landing/site-embed";
import { TemplatePreview } from "@/components/landing/template-preview";
import { TemplateCard } from "@/components/landing/template-card";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { HOPE_AID_DEMO } from "@/lib/demo-sites";
import { TEMPLATE_CATALOG, getTemplate } from "@/lib/templates-catalog";

type PageProps = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return TEMPLATE_CATALOG.map((item) => ({ id: item.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const template = getTemplate(id);
  if (!template) return { title: "Template" };
  return {
    title: `${template.name} template`,
    description: template.description,
  };
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const template = getTemplate(id);
  if (!template) notFound();

  const isLive = template.status === "live";
  const others = TEMPLATE_CATALOG.filter((item) => item.id !== template.id);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero">
          <div className="container">
            <p className="breadcrumb">
              <Link href="/templates">Templates</Link>
              <span aria-hidden="true">/</span>
              {template.name}
            </p>
            <span className="eyebrow">{template.category}</span>
            <h1>{template.name}</h1>
            <p>{template.description}</p>
            {isLive ? (
              <p className="mock-data-callout">
                Working site · runs on <strong>mock data</strong>
              </p>
            ) : (
              <p className="design-callout">
                Design preview · no working site behind this style yet
              </p>
            )}
          </div>
        </section>

        <section className="section">
          <div className="container">
            {isLive && template.demo ? (
              <SiteEmbed site={template.demo} size="large" />
            ) : (
              <div className="detail-preview">
                <TemplatePreview template={template} />
              </div>
            )}

            <div className="template-detail-grid">
              <div>
                <h2>What this style does</h2>
                <p>{template.tagline}.</p>
                <ul className="feature-list">
                  {template.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="detail-side">
                <h3>Included in every template</h3>
                <ul className="feature-list">
                  <li>Hosted public website</li>
                  <li>Public RAG for your visitors</li>
                  <li>Private RAG for your staff</li>
                  <li>Admin dashboard</li>
                </ul>
                <div className="template-card-actions">
                  {isLive && template.demo ? (
                    <Link
                      href={template.demo.siteHref}
                      className="button button-primary"
                    >
                      Open live site
                    </Link>
                  ) : (
                    <Link href={template.useHref} className="button button-primary">
                      Request this style
                    </Link>
                  )}
                  <Link href={template.useHref} className="button button-secondary">
                    Start building
                  </Link>
                </div>
                {!isLive ? (
                  <p className="detail-note">
                    Want to see the engine working first?{" "}
                    <Link href={HOPE_AID_DEMO.siteHref}>
                      Open the Clarity site
                    </Link>{" "}
                    — same stack, different layout.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="section section-soft">
          <div className="container">
            <div className="section-head section-head-compact">
              <div>
                <span className="eyebrow">Other styles</span>
                <h2>Compare the rest</h2>
              </div>
            </div>
            <div className="gallery-grid">
              {others.map((item) => (
                <TemplateCard item={item} key={item.id} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
