import Link from "next/link";
import { TemplatePreview } from "@/components/landing/template-preview";
import type { TemplateCatalogItem } from "@/lib/templates-catalog";

export function TemplateStatusPill({ item }: { item: TemplateCatalogItem }) {
  return item.status === "live" ? (
    <span className="live-pill">Working site</span>
  ) : (
    <span className="design-pill">Design preview</span>
  );
}

export function TemplateCard({ item }: { item: TemplateCatalogItem }) {
  const isLive = item.status === "live";

  return (
    <article className="showcase-card" id={item.id}>
      <Link
        href={`/templates/${item.id}`}
        className="showcase-card-preview"
        aria-label={`View the ${item.name} template`}
      >
        <TemplatePreview template={item} />
      </Link>
      <div className="showcase-card-body">
        <div className="showcase-card-meta">
          <span className="sector-badge">{item.category}</span>
          <TemplateStatusPill item={item} />
        </div>
        <h3>{item.name}</h3>
        <p>{item.tagline}</p>
        <div className="template-card-actions">
          {isLive && item.demo ? (
            <Link
              href={item.demo.siteHref}
              className="button button-primary button-small"
            >
              Open live site
            </Link>
          ) : (
            <Link
              href={`/templates/${item.id}`}
              className="button button-primary button-small"
            >
              View design
            </Link>
          )}
          <Link
            href={`/templates/${item.id}`}
            className="button button-secondary button-small"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
