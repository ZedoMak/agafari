"use client";

import { useState } from "react";
import { ClarityChat } from "@/components/clarity/clarity-chat";
import { useSite } from "@/components/clarity/site-context";
import { useWorkspace } from "@/components/clarity/workspace-shell";
import { PageIntro } from "@/components/clarity/workspace-ui";
import { getOrganizationServices } from "@/lib/api";
import { useAsync } from "@/lib/clarity/use-async";

export default function AssistantPage() {
  const { token } = useWorkspace();
  const { organization, terminology } = useSite();
  const [serviceId, setServiceId] = useState("");
  const [department, setDepartment] = useState("");
  const services = useAsync(
    () => getOrganizationServices(organization.slug),
    [organization.slug],
  );

  if (!organization.features.employee_assistant) {
    return (
      <>
        <PageIntro
          title="Internal assistant"
          description="This feature is switched off for your organization."
        />
        <div className="c-empty">
          <h3>The internal assistant is disabled</h3>
          <p>
            Turn on the employee assistant feature flag for {organization.name} to
            let staff ask questions across internal documents.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageIntro
        title="Internal assistant"
        description="Answers here draw on approved internal documents as well as everything published publicly. Never share internal answers outside the team."
      />

      <div className="c-panel">
        <div className="c-panel-body">
          <div className="c-form-grid">
            <label className="c-field">
              <span>Focus on a {terminology.singularLower} (optional)</span>
              <select
                className="c-select"
                value={serviceId}
                onChange={(event) => setServiceId(event.target.value)}
              >
                <option value="">Everything we know</option>
                {(services.data ?? []).map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="c-field">
              <span>Your team (optional)</span>
              <input
                className="c-input"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                placeholder="Operations, Finance, Field…"
                maxLength={100}
              />
              <small className="c-field-help">
                Recorded with the conversation so leads can see which teams need
                better documentation.
              </small>
            </label>
          </div>
        </div>
      </div>

      <ClarityChat
        key={`${serviceId}-${department}`}
        mode={{
          kind: "internal",
          token,
          serviceId: serviceId || null,
          department: department || null,
        }}
        title="Internal assistant"
        subtitle={`${organization.name} staff only`}
        scopeLabel="Internal + public"
        placeholder="Ask about a policy, procedure, or programme…"
        welcomeTitle="Ask anything your documents cover"
        welcomeBody="Internal SOPs, approvals, and policies are included alongside published material. Every answer cites the document it came from."
        suggestions={[
          "What is the travel approval process?",
          "Which documents do field staff need?",
          "Summarise the latest programme guidance",
        ]}
        organizationName={organization.name}
      />
    </>
  );
}
