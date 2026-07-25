"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { askPublicAssistant, sendAnswerFeedback } from "@/lib/api";
import type { AnswerStatus, ChatTurn } from "@/lib/types";

const stateLabels: Record<AnswerStatus, string> = {
  ANSWERED: "Verified answer",
  LOW_CONFIDENCE: "Limited information",
  UNANSWERED: "No verified answer",
  ERROR: "Assistant unavailable",
};

export function PublicChat({
  serviceId,
  serviceTitle,
  organizationName,
}: {
  serviceId: string;
  serviceTitle: string;
  organizationName: string;
}) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState<Record<string, string>>({});
  const bodyRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Who is eligible?",
    "What documents are required?",
    "How long does the process take?",
  ];

  useEffect(() => {
    bodyRef.current?.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turns, loading]);

  async function submitMessage(message: string) {
    const cleanMessage = message.trim();
    if (!cleanMessage || loading) return;
    const userTurn: ChatTurn = {
      id: crypto.randomUUID(),
      role: "user",
      content: cleanMessage,
    };
    setTurns((current) => [...current, userTurn]);
    setInput("");
    setLoading(true);
    try {
      const answer = await askPublicAssistant(
        serviceId,
        cleanMessage,
        conversationId,
      );
      setConversationId(answer.conversation_id);
      setTurns((current) => [
        ...current,
        {
          id: answer.message_id,
          messageId: answer.message_id,
          role: "assistant",
          content: answer.reply,
          status: answer.answer_status,
          citations: answer.citations,
        },
      ]);
    } catch (error) {
      setTurns((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "The assistant is temporarily unavailable.",
          status: "ERROR",
          citations: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void submitMessage(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitMessage(input);
    }
  }

  async function handleFeedback(
    messageId: string,
    feedback: "HELPFUL" | "NOT_HELPFUL",
  ) {
    setFeedbackSent((current) => ({ ...current, [messageId]: feedback }));
    try {
      await sendAnswerFeedback(messageId, feedback);
    } catch {
      setFeedbackSent((current) => {
        const next = { ...current };
        delete next[messageId];
        return next;
      });
    }
  }

  return (
    <section className="chat-shell" aria-label={`Ask about ${serviceTitle}`}>
      <div className="chat-header">
        <div className="chat-title">
          <span className="assistant-mark" aria-hidden="true">
            A
          </span>
          <div>
            <strong>Agafari assistant</strong>
            <span>Answers from {organizationName}&apos;s public knowledge</span>
          </div>
        </div>
        <span className="chat-verified">
          <i aria-hidden="true" />
          Public sources only
        </span>
      </div>

      <div className="chat-body" ref={bodyRef} aria-live="polite">
        {turns.length === 0 ? (
          <div className="chat-welcome">
            <span className="assistant-mark" aria-hidden="true">
              A
            </span>
            <h2>What would you like to know?</h2>
            <p>
              Ask about eligibility, requirements, timing, or how this service
              works. Answers use approved public information.
            </p>
            <div className="suggestion-list">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => void submitMessage(suggestion)}
                  disabled={loading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat-turns">
            {turns.map((turn) => (
              <article className={`chat-turn ${turn.role}`} key={turn.id}>
                <div className="chat-bubble">
                  {turn.role === "assistant" && turn.status && (
                    <span
                      className={`answer-state ${
                        turn.status === "LOW_CONFIDENCE"
                          ? "low"
                          : turn.status.toLowerCase()
                      }`}
                    >
                      {stateLabels[turn.status]}
                    </span>
                  )}
                  <div>{turn.content}</div>
                </div>

                {turn.citations && turn.citations.length > 0 && (
                  <div className="citation-list" aria-label="Sources">
                    {turn.citations.map((citation, index) =>
                      citation.url ? (
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noreferrer"
                          className="citation"
                          key={`${citation.source_id}-${index}`}
                        >
                          <span className="citation-icon" aria-hidden="true">
                            ↗
                          </span>
                          {citation.title}
                        </a>
                      ) : (
                        <span
                          className="citation"
                          key={`${citation.source_id}-${index}`}
                        >
                          <span className="citation-icon" aria-hidden="true">
                            §
                          </span>
                          {citation.title}
                        </span>
                      ),
                    )}
                  </div>
                )}

                {turn.role === "assistant" &&
                  turn.messageId &&
                  turn.status !== "ERROR" && (
                    <div className="answer-feedback">
                      {feedbackSent[turn.messageId] ? (
                        <span>Thanks for the feedback.</span>
                      ) : (
                        <>
                          <span>Was this helpful?</span>
                          <button
                            aria-label="Mark answer helpful"
                            onClick={() =>
                              void handleFeedback(turn.messageId!, "HELPFUL")
                            }
                          >
                            Yes
                          </button>
                          <button
                            aria-label="Mark answer not helpful"
                            onClick={() =>
                              void handleFeedback(
                                turn.messageId!,
                                "NOT_HELPFUL",
                              )
                            }
                          >
                            No
                          </button>
                        </>
                      )}
                    </div>
                  )}
              </article>
            ))}
            {loading && (
              <div className="typing" aria-label="Agafari is generating an answer">
                <i />
                <i />
                <i />
              </div>
            )}
          </div>
        )}
      </div>

      <form className="chat-composer" onSubmit={handleSubmit}>
        <div className="composer-inner">
          <textarea
            rows={1}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${serviceTitle}…`}
            aria-label={`Ask a question about ${serviceTitle}`}
            maxLength={4000}
            disabled={loading}
          />
          <button
            className="send-button"
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send question"
          >
            ↑
          </button>
        </div>
        <p className="chat-disclaimer">
          AI can make mistakes. Verify important decisions using the cited
          source or contact {organizationName}.
        </p>
      </form>
    </section>
  );
}
