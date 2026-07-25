import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { PartnerForm } from "./partner-form";

export const metadata: Metadata = {
  title: "Subscribe",
  description:
    "Subscribe to an Agafari template. We ship a dedicated website with RAG and a dashboard. You customize, deploy, and serve your customers.",
};

export default function PartnerPage() {
  return (
    <>
      <SiteHeader />
      <main className="partner-page">
        <div className="container partner-grid">
          <section className="partner-copy">
            <span className="eyebrow">Get started</span>
            <h1>Start building your AI website</h1>
            <p>
              Choose a template. We host the stack—website, RAG, and dashboard.
              You customize branding and knowledge, then serve your visitors on
              your dedicated site.
            </p>
            <ul className="feature-list">
              <li>Dedicated hosted company website</li>
              <li>Public + private RAG included</li>
              <li>Dashboard to manage services and documents</li>
              <li>You own customer service on your site</li>
            </ul>
            <p>
              Not ready?{" "}
              <Link href="/templates">Compare templates</Link> or{" "}
              <Link href="/organizations/hope-aid">
                preview the Clarity demo
              </Link>
              .
            </p>
          </section>
          <Suspense fallback={<div className="partner-form form-body">Loading…</div>}>
            <PartnerForm />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
