import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { getOrganizations } from "@/lib/api";
import type { Organization } from "@/lib/types";
import { DirectoryClient } from "./directory-client";

export const metadata: Metadata = {
  title: "Organizations",
  description:
    "Browse organizations, understand their services, and ask questions grounded in verified information.",
};

export const dynamic = "force-dynamic";

export default async function OrganizationsPage() {
  let organizations: Organization[] = [];
  let unavailable = false;
  try {
    organizations = await getOrganizations();
  } catch {
    unavailable = true;
  }

  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Organization directory</span>
            <h1>Find the organization. Get the clear answer.</h1>
            <p>
              Browse verified organization pages, explore their services, and
              ask grounded questions without searching across scattered
              sources.
            </p>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <DirectoryClient
              organizations={organizations}
              unavailable={unavailable}
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
