import Link from "next/link";
import { LiveSiteSwitcher } from "@/components/landing/live-site-switcher";
import { SiteEmbed } from "@/components/landing/site-embed";
import { TemplateCard } from "@/components/landing/template-card";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { HOPE_AID_DEMO, PUBLISHED_DEMOS } from "@/lib/demo-sites";
import { DESIGN_TEMPLATES, TEMPLATE_CATALOG } from "@/lib/templates-catalog";

const steps = [
  {
    number: "01",
    title: "Choose a style",
    description:
      "Six template directions, from calm public-service layouts to dark support consoles.",
  },
  {
    number: "02",
    title: "Customize branding",
    description:
      "Logo, colours, wording, and services — configured for your organization.",
  },
  {
    number: "03",
    title: "Upload documents",
    description:
      "Mark knowledge PUBLIC for visitors or INTERNAL for staff. Approve what the AI may use.",
  },
  {
    number: "04",
    title: "Launch your site",
    description:
      "Your visitors use your hosted site. Your team runs it from the admin panel we host for you.",
  },
];

const outcomes = [
  {
    title: "Your public website",
    description:
      "A branded site where your visitors browse services and ask questions.",
  },
  {
    title: "Public RAG",
    description:
      "Answers grounded only in approved public documents, with citations attached.",
  },
  {
    title: "Private RAG",
    description:
      "A staff assistant over internal knowledge that visitors can never reach.",
  },
  {
    title: "Admin panel",
    description:
      "Services, documents, policy updates, conversations, and complaints — managed on our domain, not yours.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="landing-page">
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy reveal-up">
              <span className="eyebrow">AI service websites</span>
              <h1>
                Your Organization Deserve&apos;s a better way to server your customers{" "}
          
              </h1>
              <p>
                Pick a template style, customize it for your brand, upload your
                documents, and go live on your own hosted site — with a public
                assistant, a private staff assistant, and a dashboard included.
              </p>
              <div className="hero-actions">
                <Link href="/templates" className="button button-primary">
                  Browse templates <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href={HOPE_AID_DEMO.siteHref}
                  className="button button-secondary"
                >
                  Open a live site
                </Link>
              </div>
              <div className="hero-note">
                <span aria-hidden="true" />
                Live example below runs on mock data
              </div>
            </div>

            <div className="hero-embed-wrap reveal-up delay-1">
              <SiteEmbed site={HOPE_AID_DEMO} />
            </div>
          </div>
        </section>

        <section className="section section-soft" id="templates">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Template gallery</span>
                <h2>Choose your Template.</h2>
              </div>
              <p>
                Every style ships the same stack — public site, dual RAG,
                dashboard. {PUBLISHED_DEMOS.length} are running as live sites
                you can open; {DESIGN_TEMPLATES.length} are design previews you
                can request.
              </p>
            </div>
            <div className="gallery-grid">
              {TEMPLATE_CATALOG.map((item) => (
                <TemplateCard item={item} key={item.id} />
              ))}
            </div>
            <p className="template-gallery-foot">
              <Link href="/templates">Compare all templates →</Link>
            </p>
          </div>
        </section>

        <section className="section" id="live-proof">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Live sites</span>
                <h2>One template. Four organizations.</h2>
              </div>
              <p>
                Switch between mock organizations to see how far branding,
                wording, and content change. Everything you click happens on
                their site — Agafari only provides it.
              </p>
            </div>

            <LiveSiteSwitcher />
          </div>
        </section>

        <section className="section section-soft" id="features">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">What ships</span>
                <h2>Website, dual RAG, dashboard</h2>
              </div>
              <p>
                Whatever style you choose, this is what your organization
                receives — with your data instead of mock content.
              </p>
            </div>
            <div className="outcome-grid outcome-grid-four">
              {outcomes.map((item) => (
                <article className="outcome-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="how-it-works">
          <div className="container">
            <div className="centered-head">
              <span className="eyebrow">How it works</span>
              <h2>From style to hosted site</h2>
              <p>
                Your visitors never need Agafari. They use the site we host for
                you.
              </p>
            </div>
            <ol className="process-track">
              {steps.map((step, index) => (
                <li className="process-step" key={step.number}>
                  <span className="process-number">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  {index < steps.length - 1 ? (
                    <span className="process-arrow" aria-hidden="true">
                      ↓
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section section-soft" id="pricing">
          <div className="container pricing-strip">
            <div>
              <span className="eyebrow">Pricing</span>
              <h2>Explore free. Subscribe when you launch.</h2>
              <p>
                Browse styles and open the live example any time. When you start
                building, you get your own hosted site with your branding and
                documents.
              </p>
            </div>
            <div className="pricing-card">
              <strong>Organization plan</strong>
              <ul className="feature-list">
                <li>Hosted company website</li>
                <li>Public + private RAG</li>
                <li>Admin dashboard</li>
                <li>Template of your choice</li>
              </ul>
              <Link href="/partner" className="button button-primary">
                Get started
              </Link>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="container">
            <div className="cta-panel">
              <div>
                <h2>Create your AI website today</h2>
                <p>
                  Choose a style, open the live example, then launch your own
                  organization site.
                </p>
                <div className="cta-actions">
                  <Link href="/partner" className="button button-primary">
                    Start building
                  </Link>
                  <Link href="/templates" className="button button-secondary">
                    Browse templates
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
