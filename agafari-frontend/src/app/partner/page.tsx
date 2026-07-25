import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { PartnerForm } from "./partner-form";

export const metadata: Metadata = {
  title: "Partner with Agafari",
  description:
    "Request a pilot for a hosted public knowledge assistant, private employee RAG, and customer insight dashboard.",
};

export default function PartnerPage() {
  return (
    <>
      <SiteHeader />
      <main className="partner-page">
        <div className="container partner-grid">
          <section className="partner-copy">
            <span className="eyebrow">Request a pilot</span>
            <h1>Turn repeated questions into clear answers and action.</h1>
            <p>
              Agafari gives your organization a hosted public information
              experience, a private employee knowledge assistant, and a
              structured view of the questions and feedback that matter.
            </p>
            <ul className="feature-list">
              <li>A branded organization page and public assistant</li>
              <li>Private RAG for employees and approved documents</li>
              <li>Complaint, knowledge-gap, and interaction insights</li>
              <li>A reusable hosted template—no separate platform to maintain</li>
            </ul>
          </section>
          <PartnerForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
