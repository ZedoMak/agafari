import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-header";

export default function OrganizationNotFound() {
  return (
    <>
      <SiteHeader />
      <main className="section">
        <div className="narrow-container">
          <div className="empty-panel">
            <span className="eyebrow">Organization not found</span>
            <h2>This organization page is not available.</h2>
            <p>
              It may have moved, or the organization has not published an
              Agafari profile yet.
            </p>
            <Link href="/organizations" className="button button-primary">
              Browse organizations
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
