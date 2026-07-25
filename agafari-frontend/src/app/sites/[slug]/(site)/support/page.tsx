import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeedbackForm } from "@/components/clarity/feedback-form";
import { getOrganization, getOrganizationServices } from "@/lib/api";
import type { Service } from "@/lib/types";

export const metadata: Metadata = { title: "Contact & feedback" };

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ service?: string }>;
};

export default async function SupportPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { service } = await searchParams;
  const organization = await getOrganization(slug).catch(() => null);
  if (!organization) notFound();

  const services: Service[] = await getOrganizationServices(slug).catch(() => []);
  const { contact } = organization;

  return (
    <section className="c-section">
      <div className="c-container">
        <div className="c-section-head">
          <div>
            <span className="c-eyebrow">We are listening</span>
            <h1 className="c-title-lg" style={{ marginTop: "0.6rem" }}>
              Contact &amp; feedback
            </h1>
          </div>
          <p>
            Tell {organization.name} what is working and what is not. Submissions
            are private, tracked by the team, and never used to train the public
            assistant.
          </p>
        </div>

        <div className="c-detail">
          {organization.features.complaints ? (
            <FeedbackForm services={services} defaultServiceId={service} />
          ) : (
            <div className="c-empty">
              <h3>Online submissions are closed</h3>
              <p>
                {organization.name} is not accepting feedback through this site
                right now. Please use the contact details listed here.
              </p>
            </div>
          )}

          <aside className="c-detail-aside">
            <div className="c-panel">
              <div className="c-panel-head">
                <h3>Reach the team</h3>
              </div>
              <div className="c-panel-body">
                <dl className="c-meta-list" style={{ marginTop: 0, borderTop: "none" }}>
                  {contact.email && (
                    <div>
                      <dt>Email</dt>
                      <dd>
                        <a href={`mailto:${contact.email}`}>{contact.email}</a>
                      </dd>
                    </div>
                  )}
                  {contact.phone && (
                    <div>
                      <dt>Phone</dt>
                      <dd>
                        <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                      </dd>
                    </div>
                  )}
                  {contact.website && (
                    <div>
                      <dt>Website</dt>
                      <dd>
                        <a href={contact.website} target="_blank" rel="noreferrer">
                          {contact.website.replace(/^https?:\/\//, "")}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
                <p className="c-small c-muted" style={{ marginTop: "1rem" }}>
                  For anything involving immediate danger, contact local emergency
                  services first.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
