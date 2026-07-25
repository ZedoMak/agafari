"use client";

import { useState } from "react";
import Link from "next/link";
import { TEMPLATE_CATALOG } from "@/lib/templates-catalog";
import { TemplatePreview } from "./template-preview";

const tabs = [
  { id: "site", label: "Website" },
  { id: "dashboard", label: "Dashboard" },
  { id: "ai", label: "AI assistant" },
  { id: "templates", label: "Templates" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ProductDemo() {
  const [tab, setTab] = useState<TabId>("site");
  const [templateIndex, setTemplateIndex] = useState(0);
  const activeTemplate = TEMPLATE_CATALOG[templateIndex];

  return (
    <div className="product-demo">
      <div className="product-demo-tabs" role="tablist" aria-label="Product demo">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={tab === item.id ? "is-active" : undefined}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="product-demo-panel" role="tabpanel">
        {tab === "site" && (
          <div className="demo-panel-site">
            <div className="browser-chrome">
              <span />
              <span />
              <span />
              <em>northwind.agafari.com</em>
            </div>
            <div className="demo-panel-site-body">
              <div className="hs-nav">
                <b>Northwind Services</b>
                <span>Programs</span>
                <span>Contact</span>
              </div>
              <div className="hs-hero">
                <small>Your public site</small>
                <strong>A digital service portal your visitors understand</strong>
                <p>
                  Professional pages, service catalog, and grounded AI—hosted for
                  your organization.
                </p>
                <Link href="/partner" className="button button-brand button-small">
                  Start building
                </Link>
              </div>
            </div>
          </div>
        )}

        {tab === "dashboard" && (
          <div className="demo-panel-dash">
            <aside>
              <b>Agafari</b>
              <span className="is-on">Overview</span>
              <span>Services</span>
              <span>Documents</span>
              <span>AI settings</span>
              <span>Analytics</span>
            </aside>
            <div className="demo-panel-dash-main">
              <h3>Admin dashboard</h3>
              <p>Manage content, approvals, branding, and AI from one place.</p>
              <div className="demo-stat-row">
                <div>
                  <strong>128</strong>
                  <span>Questions this week</span>
                </div>
                <div>
                  <strong>94%</strong>
                  <span>Answered with sources</span>
                </div>
                <div>
                  <strong>12</strong>
                  <span>Docs approved</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "ai" && (
          <div className="demo-panel-ai">
            <div className="demo-ai-thread">
              <div className="hs-bubble user">
                How long does passport renewal take?
              </div>
              <div className="hs-bubble bot">
                Standard renewals are typically completed within 10 working days
                when documents are complete.
                <small>↗ Renewal public guide</small>
              </div>
              <div className="hs-bubble user">Can I submit online?</div>
              <div className="hs-bubble bot">
                Yes—online intake is available for eligible renewals. Bring
                originals to your appointment.
                <small>↗ Digital intake FAQ</small>
              </div>
            </div>
            <p className="demo-ai-note">
              RAG answers cite documents you approve. Public and internal
              knowledge stay separated.
            </p>
          </div>
        )}

        {tab === "templates" && (
          <div className="demo-panel-templates">
            <div className="demo-template-switcher">
              {TEMPLATE_CATALOG.slice(0, 5).map((template, index) => (
                <button
                  key={template.id}
                  type="button"
                  className={index === templateIndex ? "is-active" : undefined}
                  onClick={() => setTemplateIndex(index)}
                >
                  {template.category}
                </button>
              ))}
            </div>
            <div className="demo-template-stage">
              <TemplatePreview template={activeTemplate} />
              <div className="demo-template-meta">
                <span className="sector-badge">{activeTemplate.category}</span>
                <h3>{activeTemplate.name}</h3>
                <p>{activeTemplate.description}</p>
                <div className="template-card-actions">
                  <Link
                    href={activeTemplate.previewHref}
                    className="button button-secondary button-small"
                  >
                    Preview
                  </Link>
                  <Link
                    href={activeTemplate.useHref}
                    className="button button-primary button-small"
                  >
                    Use template
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
