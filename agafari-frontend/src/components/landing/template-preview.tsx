import type { CSSProperties } from "react";
import type { TemplateCatalogItem } from "@/lib/templates-catalog";

/**
 * Decorative mockup of a template's layout. Internals are sized in container
 * query units so the same markup reads well in a card or a full-width detail
 * view.
 */
export function TemplatePreview({
  template,
}: {
  template: TemplateCatalogItem;
}) {
  const style = {
    "--tpl-accent": template.accent,
    "--tpl-soft": template.accentSoft,
  } as CSSProperties;

  return (
    <div
      className={`tpl-preview is-${template.surface}`}
      style={style}
      aria-hidden="true"
    >
      {renderVariant(template)}
    </div>
  );
}

function renderVariant(template: TemplateCatalogItem) {
  switch (template.variant) {
    case "editorial":
      return <Editorial template={template} />;
    case "booking":
      return <Booking template={template} />;
    case "portal":
      return <Portal template={template} />;
    case "columns":
      return <Columns template={template} />;
    case "support":
      return <Support template={template} />;
    default:
      return <Centered template={template} />;
  }
}

function Nav({ name, links = 3 }: { name: string; links?: number }) {
  return (
    <div className="tpl-nav">
      <span className="tpl-brand">{name}</span>
      <span className="tpl-nav-links">
        {Array.from({ length: links }).map((_, index) => (
          <i key={index} />
        ))}
      </span>
    </div>
  );
}

function Centered({ template }: { template: TemplateCatalogItem }) {
  return (
    <div className="tpl-shell">
      <Nav name={template.name} />
      <div className="tpl-center">
        <span className="tpl-eyebrow">Programs</span>
        <span className="tpl-title">Clear answers, before you ask twice</span>
        <div className="tpl-ask">
          <span />
          <b />
        </div>
      </div>
      <div className="tpl-cards">
        <div className="tpl-card">
          <i />
          <i />
        </div>
        <div className="tpl-card">
          <i />
          <i />
        </div>
        <div className="tpl-card">
          <i />
          <i />
        </div>
      </div>
    </div>
  );
}

function Editorial({ template }: { template: TemplateCatalogItem }) {
  return (
    <div className="tpl-shell">
      <Nav name={template.name} links={4} />
      <div className="tpl-split">
        <div className="tpl-split-main">
          <span className="tpl-eyebrow">Admissions open</span>
          <span className="tpl-title tpl-title-serif">
            Study here. Ask anything.
          </span>
          <span className="tpl-sub">
            Programmes, deadlines and fees in one place.
          </span>
          <div className="tpl-btn-row">
            <b className="tpl-btn" />
            <b className="tpl-btn is-ghost" />
          </div>
        </div>
        <div className="tpl-rail">
          <div className="tpl-panel">
            <i />
            <i />
          </div>
          <div className="tpl-panel">
            <i />
            <i />
          </div>
          <div className="tpl-panel is-accent">
            <i />
          </div>
        </div>
      </div>
    </div>
  );
}

function Booking({ template }: { template: TemplateCatalogItem }) {
  return (
    <div className="tpl-shell">
      <Nav name={template.name} />
      <div className="tpl-split is-even">
        <div className="tpl-split-main">
          <span className="tpl-eyebrow">Patient services</span>
          <span className="tpl-title">Prepare for your visit</span>
          <div className="tpl-checks">
            <span>
              <b />
              <i />
            </span>
            <span>
              <b />
              <i />
            </span>
            <span>
              <b />
              <i />
            </span>
          </div>
        </div>
        <div className="tpl-form">
          <i className="tpl-form-label" />
          <i className="tpl-field" />
          <i className="tpl-form-label" />
          <i className="tpl-field" />
          <b className="tpl-btn is-block" />
        </div>
      </div>
      <div className="tpl-chips">
        <i />
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

function Portal({ template }: { template: TemplateCatalogItem }) {
  return (
    <div className="tpl-shell is-flush">
      <div className="tpl-util">
        <i />
        <i />
        <span className="tpl-util-spacer" />
        <i />
      </div>
      <div className="tpl-shell-inner">
        <div className="tpl-nav">
          <span className="tpl-seal" />
          <span className="tpl-brand">{template.name}</span>
          <span className="tpl-nav-links">
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className="tpl-notice">
          <b />
          <i />
        </div>
        <div className="tpl-dense">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="tpl-dense-item" key={index}>
              <b />
              <i />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Columns({ template }: { template: TemplateCatalogItem }) {
  return (
    <div className="tpl-shell">
      <div className="tpl-nav">
        <span className="tpl-brand tpl-brand-serif">{template.name}</span>
        <span className="tpl-nav-links">
          <i />
          <i />
        </span>
      </div>
      <span className="tpl-title tpl-title-serif tpl-title-sm">
        Guidance, with the paperwork beside it
      </span>
      <div className="tpl-cols">
        <div className="tpl-rows">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="tpl-row" key={index}>
              <b />
              <i />
            </div>
          ))}
        </div>
        <div className="tpl-accordion">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="tpl-accordion-item" key={index}>
              <i />
              <b>+</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Support({ template }: { template: TemplateCatalogItem }) {
  return (
    <div className="tpl-shell">
      <div className="tpl-nav">
        <span className="tpl-brand">{template.name}</span>
        <span className="tpl-status-dot" />
        <span className="tpl-status-text">All systems normal</span>
      </div>
      <div className="tpl-status-rows">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="tpl-status-row" key={index}>
            <i />
            <b />
          </div>
        ))}
      </div>
      <div className="tpl-chat">
        <div className="tpl-bubble is-me" />
        <div className="tpl-bubble is-ai">
          <i />
          <i />
        </div>
        <div className="tpl-composer">
          <i />
          <b />
        </div>
      </div>
    </div>
  );
}
