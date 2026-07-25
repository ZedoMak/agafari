import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublicChat } from "@/components/public-chat";
import { askPublicAssistant, sendAnswerFeedback } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  askPublicAssistant: vi.fn(),
  sendAnswerFeedback: vi.fn(),
}));

describe("PublicChat", () => {
  beforeEach(() => {
    vi.mocked(askPublicAssistant).mockResolvedValue({
      conversation_id: "conversation-1",
      message_id: "message-1",
      reply: "Applications are reviewed within 20 working days.",
      answer_status: "ANSWERED",
      citations: [
        {
          source_id: "source-1",
          title: "Community Grant Public Guide",
          url: "https://example.org/guide",
          section: null,
        },
      ],
    });
    vi.mocked(sendAnswerFeedback).mockResolvedValue({
      id: "message-1",
      feedback: "HELPFUL",
    });
  });

  it("renders a grounded answer, citation, and feedback state", async () => {
    render(
      <PublicChat
        serviceId="service-1"
        serviceTitle="Community Grant"
        organizationName="Hope Aid"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Who is eligible?" }));

    expect(await screen.findByText("Verified answer")).toBeInTheDocument();
    expect(
      screen.getByText("Applications are reviewed within 20 working days."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Community Grant Public Guide" }),
    ).toHaveAttribute("href", "https://example.org/guide");

    fireEvent.click(screen.getByRole("button", { name: "Mark answer helpful" }));
    await waitFor(() =>
      expect(screen.getByText("Thanks for the feedback.")).toBeInTheDocument(),
    );
    expect(sendAnswerFeedback).toHaveBeenCalledWith("message-1", "HELPFUL");
  });
});
