"use client";

import { FormEvent, useState } from "react";

export function PartnerForm() {
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [sector, setSector] = useState("");
  const [challenge, setChallenge] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const subject = encodeURIComponent(`Agafari pilot request — ${organization}`);
    const body = encodeURIComponent(
      `Name: ${name}\nOrganization: ${organization}\nSector: ${sector}\n\nWhat we want to improve:\n${challenge}`,
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
          <option>Other</option>
        </select>
      </label>
      <label className="field">
        <span>What information or support problem do you want to improve?</span>
        <textarea
          value={challenge}
          onChange={(event) => setChallenge(event.target.value)}
          required
          minLength={20}
          placeholder="Tell us what people or employees repeatedly struggle to find."
        />
      </label>
      <p className="field-help">
        Submitting opens your email client with this information. Agafari does
        not yet store partnership requests through the website.
      </p>
      <button className="button button-brand" type="submit">
        Prepare pilot request
      </button>
    </form>
  );
}
