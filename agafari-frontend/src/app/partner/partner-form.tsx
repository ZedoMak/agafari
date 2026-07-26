"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TEMPLATE_CATALOG } from "@/lib/templates-catalog";

export function PartnerForm() {
  const searchParams = useSearchParams();
  const initialTemplate = searchParams.get("template") ?? "clarity";
  const known = TEMPLATE_CATALOG.some((item) => item.id === initialTemplate);
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [sector, setSector] = useState("");
  const [template, setTemplate] = useState(
    known ? initialTemplate : "clarity",
  );
  const [notes, setNotes] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const subject = encodeURIComponent(
      `Agafari template — ${organization} (${template})`,
    );
    const body = encodeURIComponent(
      `Name: ${name}\nCompany: ${organization}\nSector: ${sector}\nTemplate: ${template}\n\nNotes:\n${notes}`,
    );
    window.location.href = `mailto:hello@agafari.com?subject=${subject}&body=${body}`;
  }

  return (
    <form className="partner-form form-body" onSubmit={handleSubmit}>
      <div className="form-row">
        <label className="field">
          <span>Your name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Organization</span>
          <input
            value={organization}
            onChange={(event) => setOrganization(event.target.value)}
            required
          />
        </label>
      </div>
      <label className="field">
        <span>Template</span>
        <select
          value={template}
          onChange={(event) => setTemplate(event.target.value)}
          required
        >
          {TEMPLATE_CATALOG.map((item) => (
            <option value={item.id} key={item.id}>
              {item.name}
              {item.status === "live" ? "" : " (design preview)"}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Sector</span>
        <select
          value={sector}
          onChange={(event) => setSector(event.target.value)}
          required
        >
          <option value="">Select a sector</option>
          <option>NGO</option>
          <option>Education</option>
          <option>Financial services</option>
          <option>Healthcare</option>
          <option>Telecom</option>
          <option>Public services</option>
          <option>Government</option>
          <option>Other</option>
        </select>
      </label>
      <label className="field">
        <span>Anything we should know before we set up your site?</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          minLength={10}
          required
          placeholder="e.g. We want Clarity for our foundation; deploy like the Hope Aid mock demo."
        />
      </label>
      <p className="field-help">
        Preview the mock Clarity site at /sites/hope-aid first if you want. This
        form starts a Get Started conversation—checkout is not wired yet.
      </p>
      <button className="button button-brand" type="submit">
        Start building
      </button>
    </form>
  );
}
