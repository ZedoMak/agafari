"use client";

import { useState } from "react";
import { ClarityChat } from "@/components/clarity/clarity-chat";
import { useSite } from "@/components/clarity/site-context";
import type { Service } from "@/lib/types";

export function PublicAssistant({
  services,
  initialServiceId,
  initialQuestion,
}: {
  services: Service[];
  initialServiceId?: string;
  initialQuestion?: string;
}) {
  const { organization, terminology } = useSite();
  const [serviceId, setServiceId] = useState(
    initialServiceId && services.some((item) => item.id === initialServiceId)
      ? initialServiceId
      : services[0].id,
  );
  const service = services.find((item) => item.id === serviceId) ?? services[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {services.length > 1 && (
        <label
          className="c-field"
          style={{ maxWidth: "420px" }}
          htmlFor="assistant-service"
        >
          <span>Which {terminology.singularLower} is your question about?</span>
          <select
            id="assistant-service"
            className="c-select"
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
          >
            {services.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
      )}

      <ClarityChat
        key={service.id}
        mode={{ kind: "public", serviceId: service.id }}
        title={`${organization.name} assistant`}
        subtitle={service.title}
        scopeLabel="Public sources"
        placeholder={`Ask about ${service.title}…`}
        welcomeTitle={`Ask about ${service.title}`}
        welcomeBody={`Answers are written from ${organization.name}'s approved public documents, and every answer shows the sources it used.`}
        suggestions={[
          "Who is eligible?",
          "What documents are required?",
          "How do I apply?",
        ]}
        organizationName={organization.name}
        initialQuestion={service.id === serviceId ? initialQuestion : undefined}
      />
    </div>
  );
}
