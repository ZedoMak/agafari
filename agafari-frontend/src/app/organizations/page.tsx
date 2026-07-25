import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { getOrganizations } from "@/lib/api";
import type { Organization } from "@/lib/types";
import { DirectoryClient } from "./directory-client";

export const metadata: Metadata = {
  title: "Template demos",
  description:
    "Preview example company sites built from Agafari templates. Demos only—Agafari sells templates, not customer support.",
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
            <span className="eyebrow">Template demos</span>
            <h1>See a deployed template.</h1>
            <p>
              Example company sites after someone chose a template and
              customized it. Your customers would use a site like this—on your
              domain, not on Agafari.
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
