import Link from "next/link";
import { notFound } from "next/navigation";
import { HeroAsk } from "@/components/clarity/hero-ask";
import { ServiceCard } from "@/components/clarity/service-card";
import { joinPath } from "@/lib/clarity/href";
import { getOrganization, getOrganizationServices } from "@/lib/api";
import { resolveBasePath } from "@/lib/clarity/base-path";
import { terminologyOf } from "@/lib/clarity/brand";
import type { Service } from "@/lib/types";

export default async function TenantHome({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const organization = await getOrganization(slug).catch(() => null);
  if (!organization) notFound();

  const services: Service[] = await getOrganizationServices(slug).catch(() => []);
  const basePath = await resolveBasePath(slug);
  const href = (path: string) => joinPath(basePath, path);
  const words = terminologyOf(organization);
  const featured = services.slice(0, 6);

  return (
    <>
      <section className="c-hero">
        <div className="c-container c-hero-inner">
          <span className="c-eyebrow c-rise">{organization.sector}</span>
          <h1 className="c-rise" style={{ "--i": 1 } as React.CSSProperties}>
            {organization.name}
          </h1>
          {organization.description && (
            <p
              className="c-hero-lede c-rise"
              style={{ "--i": 2 } as React.CSSProperties}
            >
              {organization.description}
            </p>
          )}

          <div
            className="c-rise"
            style={{ "--i": 3, width: "min(640px, 100%)" } as React.CSSProperties}
          >
            {organization.features.public_chat && services.length > 0 ? (
              <HeroAsk
                suggestions={[
                  `Who is eligible for the ${services[0].title}?`,
                  "What documents do I need?",
                  "How long does a decision take?",
                ]}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  gap: "0.6rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  className="c-button c-button-primary c-button-lg"
                  href={href("/services")}
                >
                  Browse {words.pluralLower}
                </Link>
                {organization.features.complaints && (
                  <Link
                    className="c-button c-button-secondary c-button-lg"
                    href={href("/support")}
                  >
                    Contact us
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="c-hero-meta">
            <span>
              <i aria-hidden="true" />
              {services.length} published {services.length === 1 ? words.singularLower : words.pluralLower}
            </span>
            {organization.features.public_chat && (
              <span>
                <i aria-hidden="true" />
                Answers cite approved public documents
              </span>
            )}
            {organization.contact.phone && (
              <span>
                <i aria-hidden="true" />
                {organization.contact.phone}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="c-section">
        <div className="c-container">
          <div className="c-section-head">
            <div>
              <span className="c-eyebrow">What we offer</span>
              <h2 className="c-title-md" style={{ marginTop: "0.5rem" }}>
                {words.plural}
              </h2>
            </div>
            <p>
              Each {words.singularLower} page explains eligibility and next steps,
              and lets you ask questions grounded in {organization.name}&apos;s
              published documents.
            </p>
          </div>

          {featured.length > 0 ? (
            <>
              <div className="c-grid">
                {featured.map((service, index) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    index={index}
                    href={href(`/services/${service.slug}`)}
                  />
                ))}
              </div>
              {services.length > featured.length && (
                <div style={{ marginTop: "1.5rem" }}>
                  <Link className="c-button c-button-secondary" href={href("/services")}>
                    View all {services.length} {words.pluralLower}
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="c-empty">
              <h3>Nothing published yet</h3>
              <p>
                {organization.name} has not published any {words.pluralLower} on
                this site yet. Please check back soon.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="c-section-tight" style={{ paddingBottom: "4rem" }}>
        <div className="c-container">
          <div className="c-grid">
            {organization.features.public_chat && (
              <Link className="c-card" href={href("/ask")}>
                <h3>Ask a question</h3>
                <p>
                  Get a written answer with links to the exact document it came
                  from. Available any time.
                </p>
                <div className="c-card-foot">
                  <span>Public assistant</span>
                  <span className="c-card-cta">
                    Open <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            )}
            {organization.features.complaints && (
              <Link className="c-card" href={href("/support")}>
                <h3>Report a problem</h3>
                <p>
                  Tell us what went wrong. Submissions stay private and are never
                  added to the public assistant.
                </p>
                <div className="c-card-foot">
                  <span>Feedback & complaints</span>
                  <span className="c-card-cta">
                    Open <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            )}
            {organization.contact.email && (
              <a className="c-card" href={`mailto:${organization.contact.email}`}>
                <h3>Talk to a person</h3>
                <p>
                  Prefer a human? Email the team directly and we will get back to
                  you.
                </p>
                <div className="c-card-foot">
                  <span>{organization.contact.email}</span>
                  <span className="c-card-cta">
                    Email <span aria-hidden="true">→</span>
                  </span>
                </div>
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
