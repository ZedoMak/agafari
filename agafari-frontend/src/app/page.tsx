import Link from "next/link";
import { HeroStack } from "@/components/landing/hero-stack";
import { ProductDemo } from "@/components/landing/product-demo";
import { TemplatePreview } from "@/components/landing/template-preview";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { TEMPLATE_CATALOG } from "@/lib/templates-catalog";

const steps = [
  {
    number: "01",
    title: "Choose a template",
    description:
      "Pick a professional starting point built for education, healthcare, government, NGOs, and more.",
  },
  {
    number: "02",
    title: "Customize branding",
    description:
      "Add your logo, colors, fonts, and homepage content—no engineering sprint required.",
  },
  {
    number: "03",
    title: "Upload documents",
    description:
      "Connect your knowledge base. Approve what the AI can use publicly vs internally.",
  },
  {
    number: "04",
    title: "Launch your AI website",
    description:
      "Go live with a public site, dashboard, and RAG assistant on a dedicated hosted site.",
  },
];

const outcomes = [
  {
    title: "Professional website",
    description: "A beautiful, responsive public site for your services and programs.",
  },
  {
    title: "AI assistant",
    description: "RAG-powered chat trained on the documents you approve.",
  },
  {
    title: "Powerful dashboard",
    description: "Manage services, documents, branding, and AI from one workspace.",
  },
  {
    title: "Custom branding",
    description: "Logo, colors, terminology, and layout that match your organization.",
  },
  {
    title: "Knowledge base",
    description: "Upload PDFs, guides, and policies—control public vs internal visibility.",
  },
  {
    title: "Analytics",
    description: "See questions, gaps, and engagement so your team knows what to improve.",
  },
];

const customizeItems = [
  "Change colors",
  "Upload logo",
  "Choose fonts",
  "Edit homepage",
  "Add pages",
  "Configure AI assistant",
  "Manage services",
  "No coding required",
];

const trustOrgs = [
  "Government Agencies",
  "Universities",
  "Hospitals",
  "NGOs",
  "Municipalities",
  "Companies",
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="landing-page">
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy reveal-up">
              <span className="eyebrow">AI digital service websites</span>
              <h1>
                Launch your AI-powered organization website{" "}
                <em>in minutes</em>
              </h1>
              <p>
                Choose a professional template, customize branding, upload your
                knowledge base, and go live with a public site, admin dashboard,
                and RAG assistant—Shopify-simple for organizational websites.
              </p>
              <div className="hero-actions">
                <Link href="/partner" className="button button-primary">
                  Start building <span aria-hidden="true">→</span>
                </Link>
                <Link href="#templates" className="button button-secondary">
                  View templates
                </Link>
              </div>
              <div className="hero-note">
                <span aria-hidden="true" />
                Template · Dashboard · AI included
              </div>
            </div>
            <HeroStack />
          </div>
        </section>

        <section className="section section-soft" id="templates">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Template showcase</span>
                <h2>Pick a site. Make it yours.</h2>
              </div>
              <p>
                Browse professionally designed templates—then preview or start
                building. This is the product.
              </p>
            </div>
            <div className="template-showcase">
              {TEMPLATE_CATALOG.map((template) => (
                <article className="showcase-card" key={template.id} id={template.id}>
                  <TemplatePreview template={template} />
                  <div className="showcase-card-body">
                    <div className="showcase-card-meta">
                      <span className="sector-badge">{template.category}</span>
                      {template.live ? (
                        <span className="live-pill">Live demo</span>
                      ) : null}
                    </div>
                    <h3>{template.name}</h3>
                    <p>{template.description}</p>
                    <div className="template-card-actions">
                      <Link
                        href={template.previewHref}
                        className="button button-secondary button-small"
                      >
                        Preview
                      </Link>
                      <Link
                        href={template.useHref}
                        className="button button-primary button-small"
                      >
                        Use template
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <p className="template-gallery-foot">
              <Link href="/templates">Open full template gallery →</Link>
            </p>
          </div>
        </section>

        <section className="section" id="how-it-works">
          <div className="container">
            <div className="centered-head">
              <span className="eyebrow">How it works</span>
              <h2>From template to live AI website</h2>
              <p>
                Four clear steps. No custom platform build. No separate AI
                project.
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

        <section className="section section-soft" id="features">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">What you get</span>
                <h2>Outcomes, not checkbox features</h2>
              </div>
              <p>
                Everything ships with your template so your organization can
                publish services and answer questions with confidence.
              </p>
            </div>
            <div className="outcome-grid">
              {outcomes.map((item) => (
                <article className="outcome-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="demo">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Interactive demo</span>
                <h2>See the product, not a pitch deck</h2>
              </div>
              <p>
                Switch between website, dashboard, AI, and templates. Hover and
                click—this is what you launch.
              </p>
            </div>
            <ProductDemo />
          </div>
        </section>

        <section className="section section-soft" id="why">
          <div className="container">
            <div className="centered-head">
              <span className="eyebrow">Why Agafari</span>
              <h2>Stop rebuilding what should be a product</h2>
            </div>
            <div className="compare-grid">
              <article className="compare-card compare-old">
                <h3>Traditional development</h3>
                <ul>
                  <li>
                    <span aria-hidden="true">✕</span> Months of build time
                  </li>
                  <li>
                    <span aria-hidden="true">✕</span> Expensive custom work
                  </li>
                  <li>
                    <span aria-hidden="true">✕</span> Developers required
                  </li>
                  <li>
                    <span aria-hidden="true">✕</span> AI bolted on separately
                  </li>
                </ul>
              </article>
              <article className="compare-card compare-new">
                <h3>Agafari</h3>
                <ul>
                  <li>
                    <span aria-hidden="true">✓</span> Minutes to start
                  </li>
                  <li>
                    <span aria-hidden="true">✓</span> Ready-made templates
                  </li>
                  <li>
                    <span aria-hidden="true">✓</span> AI included
                  </li>
                  <li>
                    <span aria-hidden="true">✓</span> Dashboard included
                  </li>
                  <li>
                    <span aria-hidden="true">✓</span> Fully customizable
                  </li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="customize">
          <div className="container customize-layout">
            <div>
              <span className="eyebrow">Customization</span>
              <h2>Your brand. Your knowledge. Your site.</h2>
              <p>
                Every generated site is yours to shape. Update look and feel,
                structure pages, and configure the assistant—without writing
                code.
              </p>
              <Link href="/partner" className="button button-primary">
                Start building
              </Link>
            </div>
            <ul className="customize-grid">
              {customizeItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section section-soft" id="trust">
          <div className="container">
            <div className="centered-head">
              <span className="eyebrow">Built for organizations</span>
              <h2>Trusted across sectors</h2>
              <p>
                Designed for teams that need clear public information and an AI
                layer they control.
              </p>
            </div>
            <div className="trust-logo-row" aria-label="Organization types">
              {trustOrgs.map((org) => (
                <div className="trust-logo" key={org}>
                  {org}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="pricing">
          <div className="container pricing-strip">
            <div>
              <span className="eyebrow">Pricing</span>
              <h2>Start building. Subscribe when you launch.</h2>
              <p>
                Explore templates and demos free. When you&apos;re ready, subscribe
                to host your organization&apos;s AI website.
              </p>
            </div>
            <div className="pricing-card">
              <strong>Organization plan</strong>
              <ul className="feature-list">
                <li>Hosted public website</li>
                <li>Admin dashboard</li>
                <li>RAG AI assistant</li>
                <li>Template + branding controls</li>
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
                  Choose a template, customize it, and launch a digital service
                  portal your organization can run.
                </p>
                <div className="cta-actions">
                  <Link href="/partner" className="button button-primary">
                    Start building
                  </Link>
                  <Link href="#templates" className="button button-secondary">
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
