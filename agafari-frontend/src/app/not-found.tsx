import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="section">
        <div className="narrow-container">
          <div className="empty-panel">
            <span className="eyebrow">404</span>
            <h2>We could not find that page.</h2>
            <p>Explore available organizations or return to Agafari.</p>
            <Link href="/" className="button button-primary">
              Return home
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
