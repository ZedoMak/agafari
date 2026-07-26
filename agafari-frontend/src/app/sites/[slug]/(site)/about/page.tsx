import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrganization, getOrganizationServices } from "@/lib/api";
import { resolveBasePath } from "@/lib/clarity/base-path";
import { terminologyOf } from "@/lib/clarity/brand";
import { joinPath } from "@/lib/clarity/href";
import type { Service } from "@/lib/types";

export const metadata: Metadata = { title: "About" };

type PageProps = { params: Promise<{ slug: string }> };

export default async function AboutPage({ params }: PageProps) {
  const { slug } = await params;
  const organization = await getOrganization(slug).catch(() => null);
  if (!organization) notFound();

  const services: Service[] = await getOrganizationServices(slug).catch(() => []);
  const basePath = await resolveBasePath(slug);
  const href = (path: string) => joinPath(basePath, path);
  const words = terminologyOf(organization);

  const categories = Array.from(
    new Set(services.map((service) => service.category).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));

  const { contact } = organization;
  const contactRows: {
    key: string;
    label: string;
    text: string;
    href: string;
    external?: boolean;
  }[] = [];
  if (contact.email) {
    contactRows.push({
      key: "email",
      label: "Email",
      text: contact.email,
      href: `mailto:${contact.email}`,
    });
  }
  if (contact.phone) {
    contactRows.push({
      key: "phone",
      label: "Phone",
      text: contact.phone,
      href: `tel:${contact.phone.replace(/\s+/g, "")}`,
    });
  }
  if (contact.website) {
    contactRows.push({
      key: "website",
      label: "Website",
      text: contact.website.replace(/^https?:\/\//, ""),
      href: contact.website,
      external: true,
    });
  }

  return (
    <section className="c-section">
      <div className="c-container">
        <div style={{ marginBottom: "2.5rem", maxWidth: "62ch" }}>
          <span className="c-eyebrow c-rise">{organization.sector}</span>
          <h1
            className="c-title-lg c-rise"
            style={{ margin: "0.6rem 0 0.9rem", "--i": 1 } as React.CSSProperties}
          >
            About {organization.name}
          </h1>
          <p className="c-lede c-rise" style={{ "--i": 2 } as React.CSSProperties}>
            {organization.description ??
              `This site is where ${organization.name} publishes its ${words.pluralLower}, answers questions, and announces changes.`}
          </p>
        </div>

        <div className="c-detail">
          <div>
            <h2 className="c-title-md">What we do</h2>
            <div className="c-prose" style={{ marginTop: "0.75rem" }}>
              {services.length > 0 ? (
                <p>
                  {organization.name} publishes {services.length}{" "}
                  {services.length === 1 ? words.singularLower : words.pluralLower}{" "}
                  on this site
                  {categories.length > 0 && (
                    <>
                      , spanning {categories.length}{" "}
                      {categories.length === 1 ? "area" : "areas"} of work
                    </>
                  )}
                  . Each page explains who it is for, what it involves, and how
                  long it takes.
                </p>
              ) : (
                <p>
                  {organization.name} has not published any {words.pluralLower} on
                  this site yet. They will appear here and in the directory as
                  soon as they are published.
                </p>
              )}
            </div>

            {categories.length > 0 && (
              <div className="c-about-categories">
                {categories.map((category) => (
                  <Link
                    key={category}
                    className="c-chip"
                    href={href("/services")}
                    aria-label={`${category} — browse ${words.pluralLower}`}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            )}

            <div style={{ marginTop: "1.5rem" }}>
              <Link className="c-button c-button-secondary" href={href("/services")}>
                See all {words.pluralLower}
              </Link>
            </div>

            {organization.features.public_chat && (
              <>
                <h2 className="c-title-md" style={{ marginTop: "3rem" }}>
                  How our assistant works
                </h2>
                <ul className="c-about-points">
                  <li>
                    <strong>Only our published documents.</strong> Answers are
                    drawn from the documents {organization.name} has approved for
                    the public — nothing else.
                  </li>
                  <li>
                    <strong>Every answer shows its sources.</strong> You can open
                    the exact document an answer came from and read it yourself.
                  </li>
                  <li>
                    <strong>Internal material stays internal.</strong> Staff-only
                    documents are never used to answer questions on this site.
                  </li>
                </ul>
                <div style={{ marginTop: "1.25rem" }}>
                  <Link className="c-card-cta" href={href("/ask")}>
                    Ask a question <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </>
            )}
          </div>

          <aside className="c-detail-aside">
            <div className="c-panel">
              <div className="c-panel-head">
                <h3>How to reach us</h3>
              </div>
              <div className="c-panel-body">
                {contactRows.length > 0 ? (
                  <dl
                    className="c-meta-list"
                    style={{ marginTop: 0, borderTop: "none" }}
                  >
                    {contactRows.map((row) => (
                      <div key={row.key}>
                        <dt>{row.label}</dt>
                        <dd>
                          {row.external ? (
                            <a href={row.href} target="_blank" rel="noreferrer">
                              {row.text}
                            </a>
                          ) : (
                            <a href={row.href}>{row.text}</a>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="c-small c-muted">
                    {organization.name} has not published contact details on this
                    site yet.
                  </p>
                )}

                {organization.features.complaints && (
                  <p className="c-small c-muted" style={{ marginTop: "1rem" }}>
                    You can also{" "}
                    <Link className="c-card-cta" href={href("/support")}>
                      report a problem
                    </Link>{" "}
                    — submissions stay private.
                  </p>
                )}
              </div>
            </div>

            <div className="c-panel" style={{ marginTop: "1rem" }}>
              <div className="c-panel-head">
                <h3>Keep up to date</h3>
              </div>
              <div className="c-panel-body">
                <p className="c-small c-muted">
                  Changes to policies, rules, fees, and procedures are announced
                  on the updates page.
                </p>
                <div style={{ marginTop: "0.9rem" }}>
                  <Link className="c-card-cta" href={href("/updates")}>
                    Read the latest updates <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
