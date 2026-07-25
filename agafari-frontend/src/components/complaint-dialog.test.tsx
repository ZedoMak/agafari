import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ComplaintButton } from "@/components/complaint-dialog";
import { submitComplaint } from "@/lib/api";
import type { Organization, Service } from "@/lib/types";

vi.mock("@/lib/api", () => ({
  submitComplaint: vi.fn(),
}));

const organization: Organization = {
  id: "org-1",
  slug: "hope-aid",
  name: "Hope Aid",
  short_code: "HA",
  sector: "NGO",
  logo_url: null,
  description: "Demo organization",
  theme: { primary: "#126b50", accent: "#12B76A" },
  terminology: {
    service_singular: "Program",
    service_plural: "Programs",
  },
  features: {
    public_chat: true,
    complaints: true,
    employee_assistant: true,
    insights: true,
  },
  contact: {},
};

const service: Service = {
  id: "service-1",
  title: "Community Grant",
  slug: "community-grant",
  category: "Livelihoods",
  organization_code: "HA",
  summary: "A community grant.",
  processing_time: "20 working days",
  verification_status: "VERIFIED",
  last_verified_at: "2026-07-25T00:00:00Z",
};

describe("ComplaintButton", () => {
  it("validates detail and shows a private submission reference", async () => {
    vi.mocked(submitComplaint).mockResolvedValue({
      id: "complaint-123",
      status: "NEW",
      created_at: "2026-07-25T00:00:00Z",
    });
    render(
      <ComplaintButton
        organization={organization}
        services={[service]}
        defaultServiceId={service.id}
        label="Share feedback"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Share feedback" }));
    const description = screen.getByPlaceholderText(
      "Describe the issue, what you expected, and any helpful context.",
    );
    fireEvent.change(description, { target: { value: "short" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit privately" }));
    expect(
      await screen.findByText("Please provide at least 10 characters of detail."),
    ).toBeInTheDocument();

    fireEvent.change(description, {
      target: {
        value: "I submitted the application but received no status update.",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit privately" }));
    expect(await screen.findByText("Thank you for speaking up")).toBeInTheDocument();
    expect(screen.getByText("Reference: complaint-123")).toBeInTheDocument();
  });
});
