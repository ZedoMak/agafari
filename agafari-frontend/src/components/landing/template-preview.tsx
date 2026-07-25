import type { CSSProperties } from "react";
import type { TemplateCatalogItem } from "@/lib/templates-catalog";

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
    <div className="tpl-preview" style={style} aria-hidden="true">
      <div className="tpl-preview-chrome">
        <span />
        <span />
        <span />
        <em>{template.name.toLowerCase()}.agafari.com</em>
      </div>
      <div className="tpl-preview-body">
        <div className="tpl-preview-nav">
          <b>{template.name}</b>
          <span />
          <span />
          <span />
        </div>
        <div className="tpl-preview-hero">
          <small>{template.category}</small>
          <strong>Services people can understand</strong>
          <p>Ask about requirements, timelines, and next steps.</p>
        </div>
        <div className="tpl-preview-cards">
          <div />
          <div />
          <div />
        </div>
        <div className="tpl-preview-chat">
          <span>AI assistant</span>
          <div />
        </div>
      </div>
    </div>
  );
}
