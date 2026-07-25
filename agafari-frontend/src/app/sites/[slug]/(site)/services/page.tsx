import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDirectory } from "@/components/clarity/service-directory";
import { getOrganization, getOrganizationServices } from "@/lib/api";
import { terminologyOf } from "@/lib/clarity/brand";
import type { Service } from "@/lib/types";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const organization = await getOrganization(slug);
    return { title: terminologyOf(organization).plural };
  } catch {
    return {};
  }
}

export default async function ServicesPage({ params }: PageProps) {
  const { slug } = await params;
  const organization = await getOrganization(slug).catch(() => null);
  if (!organization) notFound();

  const services: Service[] = await getOrganizationServices(slug).catch(() => []);
  const words = terminologyOf(organization);

  return (
    <section className="c-section">
      <div className="c-container">
        <div className="c-section-head">
          <div>
            <span className="c-eyebrow">{organization.name}</span>
            <h1 className="c-title-lg" style={{ marginTop: "0.6rem" }}>
              {words.plural}
            </h1>
          </div>
          <p>
            Everything {organization.name} currently offers, with eligibility,
            timelines, and an assistant grounded in approved public documents.
          </p>
        </div>

        {services.length > 0 ? (
          <ServiceDirectory services={services} />
        ) : (
          <div className="c-empty">
            <h3>No published {words.pluralLower}</h3>
            <p>
              Once {organization.name} publishes {words.pluralLower}, they appear
              here automatically.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
