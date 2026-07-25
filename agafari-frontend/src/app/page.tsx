import Link from "next/link";
import { getOrganizations } from "@/lib/api";
import type { Organization } from "@/lib/types";
import { OrganizationAvatar } from "@/components/organization-card";
import { SiteFooter, SiteHeader } from "@/components/site-header";

async function getFeaturedOrganization(): Promise<Organization | null> {
  try {
    const organizations = await getOrganizations();
    return (
      organizations.find((organization) => organization.slug === "hope-aid") ??
      organizations[0] ??
      null
    );
  } catch {
    return null;
  }
}

const sectors = [
  "NGOs",
  "Education",
  "Finance",
  "Healthcare",
  "Telecom",
  "Public services",
];

const steps = [
  {
    number: "01",
    title: "Connect approved knowledge",
    description:
      "Upload service guides, policies, FAQs, and internal documents. Public and private material stay separated.",
  },
  {
    number: "02",
    title: "Ask in natural language",
    description:
      "People and employees ask ordinary questions instead of searching through pages and PDFs.",
  },
  {
    number: "03",
    title: "Answer with evidence",
    description:
      "Agafari retrieves the relevant approved source and returns a concise answer with citations.",
  },
  {
    number: "04",
    title: "Turn demand into insight",
    description:
      "Repeated questions, knowledge gaps, and complaints become structured signals the organization can act on.",
  },
];

const capabilities = [
  {
    title: "Grounded answers",
    description:
      "Responses are generated from approved organization knowledge, with sources attached.",
  },
  {
    title: "Hosted organization pages",
    description:
      "Each partner gets a configurable public experience without maintaining another product.",
  },
  {
    title: "Private employee RAG",
    description:
      "Staff can find internal policies and procedures without exposing them to public visitors.",
  },
  {
    title: "Complaint intelligence",
    description:
      "Structured feedback reveals patterns instead of leaving every case isolated.",
  },
  {
    title: "Knowledge-gap detection",
    description:
      "Unanswered questions show teams exactly what information is missing or unclear.",
  },
  {
    title: "Human control",
    description:
      "Organizations decide what is public, internal, approved, replaced, or archived.",
  },
];

const useCases = [
  [
    "NGO",
    "Programs and beneficiaries",
    "Explain eligibility, application steps, distribution timelines, and grievance channels.",
  ],
  [
    "Education",
    "Students and administration",
    "Answer admissions, payment, registration, scheduling, and certification questions.",
  ],
  [
    "Financial services",
    "Customers and operations",
    "Clarify onboarding, account access, fees, KYC, and complaint escalation.",
  ],
  [
    "Healthcare",
    "Patients and care teams",
    "Make appointments, service preparation, billing, and facility guidance easier to find.",
  ],
  [
    "Telecom",
    "Subscribers and support",
    "Deflect repeated plan, billing, SIM, network, and account-access questions.",
  ],
  [
    "Public services",
    "Residents and agencies",
    "Present verified procedures, requirements, offices, and policy updates clearly.",
  ],
];

export default async function Home() {
  const featured = await getFeaturedOrganization();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Verified organization knowledge</span>
              <h1>
                Find the answer. <em>Know it&apos;s real.</em>
              </h1>
              <p>
                Agafari brings an organization&apos;s services, policies, and
                guidance into one clear place—so people get useful answers and
                organizations learn where support is breaking down.
              </p>
              <div className="hero-actions">
                <Link href="/organizations" className="button button-primary">
                  Explore organizations <span aria-hidden="true">→</span>
                </Link>
                <Link href="/partner" className="button button-secondary">
                  Bring Agafari to your organization
                </Link>
              </div>
              <div className="hero-note">
                <span aria-hidden="true" />
                Answers grounded in organization-approved sources
              </div>
            </div>

            <div className="product-preview" aria-label="Agafari answer preview">
              <div className="preview-window">
                <div className="preview-toolbar">
                  <div className="preview-org">
                    <span className="mini-logo">HA</span>
                    Hope Aid Ethiopia
                  </div>
                  <span className="preview-status">
                    <i aria-hidden="true" /> Knowledge verified
                  </span>
                </div>
                <div className="preview-content">
                  <span>Community Livelihood Grant</span>
                  <h3>Ask a question about this program</h3>
                  <div className="preview-question">
                    What documents do we need, and how long does review take?
                  </div>
                  <div className="preview-answer">
                    You&apos;ll need a community recognition letter, a simple
                    project plan, and a budget. Applications are normally
                    reviewed within 20 working days.
                    <div className="preview-citation">
                      <b aria-hidden="true">↗</b>
                      Community Grant Public Guide
                    </div>
                  </div>
                  <div className="preview-input">
                    <span>Ask a follow-up question…</span>
                    <span aria-hidden="true">↑</span>
                  </div>
                </div>
              </div>
              <div className="floating-proof">
                <span className="proof-icon" aria-hidden="true">
                  ✓
                </span>
                <div>
                  <strong>Source-backed answer</strong>
                  <span>No guesswork or generic advice</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sector-strip" aria-label="Supported sectors">
          <div className="container sector-strip-inner">
            <p>Built for organizations across sectors</p>
            <div className="sector-list">
              {sectors.map((sector) => (
                <span key={sector}>{sector}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">The information problem</span>
                <h2>Simple questions should not become long journeys.</h2>
              </div>
              <p>
                Important information is often scattered across websites,
                documents, support lines, and people&apos;s memories. Everyone
                pays the cost.
              </p>
            </div>
            <div className="problem-grid">
              <article className="problem-item">
                <span className="problem-number">01</span>
                <h3>People cannot find a clear answer</h3>
                <p>
                  They search multiple pages, make repeated calls, or travel in
                  person just to understand a requirement or process.
                </p>
              </article>
              <article className="problem-item">
                <span className="problem-number">02</span>
                <h3>Support teams repeat the same work</h3>
                <p>
                  Call centers and staff answer identical questions every day
                  without turning that demand into better self-service.
                </p>
              </article>
              <article className="problem-item">
                <span className="problem-number">03</span>
                <h3>Real feedback gets buried</h3>
                <p>
                  Complaints arrive as isolated messages. Patterns stay hidden,
                  and leaders do not see what should be fixed first.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section section-soft" id="for-organizations">
          <div className="container">
            <div className="centered-head">
              <span className="eyebrow">One platform, two outcomes</span>
              <h2>Useful in public. Powerful behind the scenes.</h2>
              <p>
                People get a free, trustworthy place to ask. Organizations get
                a hosted knowledge system that helps them answer, learn, and
                improve.
              </p>
            </div>
            <div className="audience-grid">
              <article className="audience-panel people">
                <span className="audience-label">For people</span>
                <h3>A clearer way to understand any service.</h3>
                <p>
                  Browse an organization, choose a service, and ask in your own
                  words. Every useful answer stays connected to its source.
                </p>
                <ul className="feature-list">
                  <li>Verified service information</li>
                  <li>Grounded AI answers with citations</li>
                  <li>Direct complaint and feedback submission</li>
                </ul>
              </article>
              <article className="audience-panel organizations">
                <span className="audience-label">For organizations</span>
                <h3>Your knowledge, support, and insight layer.</h3>
                <p>
                  Launch a branded public assistant and private employee RAG
                  without building a new platform from scratch.
                </p>
                <ul className="feature-list">
                  <li>Public and private knowledge spaces</li>
                  <li>Document approval and interaction logs</li>
                  <li>Repeated-question and complaint insights</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="how-it-works">
          <div className="container steps-grid">
            <div className="steps-intro">
              <span className="eyebrow">How Agafari works</span>
              <h2>Knowledge in. Clarity out.</h2>
              <p>
                The organization controls what becomes trusted knowledge.
                Agafari handles the work of preparing it for useful,
                traceable answers.
              </p>
              <Link href="/partner" className="button button-secondary">
                See it for your organization
              </Link>
            </div>
            <div className="steps">
              {steps.map((step) => (
                <article className="step" key={step.number}>
                  <span className="step-number">{step.number}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-soft">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Live pilot</span>
                <h2>Experience the public side of Agafari.</h2>
              </div>
              <p>
                Hope Aid is a fictional NGO pilot using real Agafari flows and
                synthetic demonstration data.
              </p>
            </div>
            <div className="featured-demo">
              <div className="featured-copy">
                <span className="sector-badge">
                  {featured?.sector ?? "NGO"} · Demo organization
                </span>
                <h3>{featured?.name ?? "Hope Aid Ethiopia"}</h3>
                <p>
                  {featured?.description ??
                    "Explore a complete example of an organization profile, service catalog, public assistant, and complaint flow."}
                </p>
                <Link
                  href={`/organizations/${featured?.slug ?? "hope-aid"}`}
                  className="button button-brand"
                >
                  Explore the live demo <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="featured-visual">
                <div className="demo-card-mini">
                  <div className="demo-card-head">
                    {featured ? (
                      <OrganizationAvatar organization={featured} size="small" />
                    ) : (
                      <span className="org-avatar org-avatar-small org-avatar-fallback">
                        HA
                      </span>
                    )}
                    <div>
                      <strong>{featured?.name ?? "Hope Aid Ethiopia"}</strong>
                      <span>Verified organization profile</span>
                    </div>
                  </div>
                  {[
                    "Community Livelihood Grant",
                    "Ask the public assistant",
                    "Submit feedback",
                  ].map((label) => (
                    <div className="demo-service-line" key={label}>
                      <span>{label}</span>
                      <b>→</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-dark">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">What the platform delivers</span>
                <h2>More than a chatbot.</h2>
              </div>
              <p style={{ color: "#b3c2bc" }}>
                A complete knowledge and feedback loop designed around
                traceability, control, and action.
              </p>
            </div>
            <div className="capability-grid">
              {capabilities.map((capability, index) => (
                <article className="capability" key={capability.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{capability.title}</h3>
                  <p>{capability.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="centered-head">
              <span className="eyebrow">Not limited to one sector</span>
              <h2>The same information problem appears everywhere.</h2>
            </div>
            <div className="sector-use-grid">
              {useCases.map(([sector, title, description]) => (
                <article className="sector-use" key={sector}>
                  <small>{sector}</small>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-soft" id="trust">
          <div className="container trust-layout">
            <div>
              <span className="eyebrow">Trust by design</span>
              <h2>Clear about what the AI knows—and what it does not.</h2>
              <p>
                Agafari is designed for useful restraint. It grounds answers in
                approved material, shows sources, and admits when verified
                information is missing.
              </p>
            </div>
            <div className="trust-items">
              <div className="trust-item">
                <strong>Approved sources</strong>
                <span>
                  Organizations control which documents can answer questions.
                </span>
              </div>
              <div className="trust-item">
                <strong>Visible citations</strong>
                <span>
                  People can see where an answer came from and verify it.
                </span>
              </div>
              <div className="trust-item">
                <strong>Honest uncertainty</strong>
                <span>
                  Low-confidence and unanswered states are shown clearly.
                </span>
              </div>
              <div className="trust-item">
                <strong>Separated knowledge</strong>
                <span>
                  Public and internal sources are isolated at retrieval.
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="container">
            <div className="cta-panel">
              <div>
                <h2>Make your organization easier to understand.</h2>
                <p>
                  Give people clearer answers, give employees faster access to
                  knowledge, and give your team insight into what needs fixing.
                </p>
                <div className="cta-actions">
                  <Link
                    href="/organizations/hope-aid"
                    className="button button-primary"
                  >
                    Explore the demo
                  </Link>
                  <Link href="/partner" className="button button-secondary">
                    Request a pilot
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
