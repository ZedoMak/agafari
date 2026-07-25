"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { askInternalAssistant } from "@/lib/clarity/client";
import { askPublicAssistant, sendAnswerFeedback } from "@/lib/api";
import type { AnswerStatus, ChatTurn } from "@/lib/types";

const STATE_LABEL: Record<AnswerStatus, string> = {
  ANSWERED: "Grounded answer",
  LOW_CONFIDENCE: "Partial information",
  UNANSWERED: "No approved source",
  ERROR: "Assistant unavailable",
};

const STATE_CLASS: Record<AnswerStatus, string> = {
  ANSWERED: "answered",
  LOW_CONFIDENCE: "low",
  UNANSWERED: "unanswered",
  ERROR: "error",
};

export type ChatMode =
  | { kind: "public"; serviceId: string }
  | { kind: "internal"; token: string; serviceId?: string | null; department?: string | null };

export function ClarityChat({
  mode,
  title,
  subtitle,
  scopeLabel,
  placeholder,
  welcomeTitle,
  welcomeBody,
  suggestions,
  organizationName,
  initialQuestion,
}: {
  mode: ChatMode;
  title: string;
  subtitle: string;
  scopeLabel: string;
  placeholder: string;
  welcomeTitle: string;
  welcomeBody: string;
  suggestions: string[];
  organizationName: string;
  initialQuestion?: string;
}) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const bodyRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const askedInitial = useRef(false);
  const pending = useRef(false);

  useEffect(() => {
    bodyRef.current?.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turns, loading]);

  async function submitMessage(message: string) {
    const question = message.trim();
    if (!question || pending.current) return;
    pending.current = true;
    setTurns((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content: question },
    ]);
    setInput("");
    setLoading(true);
    try {
      const answer =
        mode.kind === "public"
          ? await askPublicAssistant(mode.serviceId, question, conversationId)
          : await askInternalAssistant(mode.token, {
              message: question,
              conversationId,
              serviceId: mode.serviceId,
              department: mode.department,
            });
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
      pending.current = false;
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initialQuestion || askedInitial.current) return;
    askedInitial.current = true;
    void submitMessage(initialQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once for a deep-linked question
  }, [initialQuestion]);

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

  async function rateAnswer(messageId: string, value: "HELPFUL" | "NOT_HELPFUL") {
    setFeedback((current) => ({ ...current, [messageId]: value }));
    try {
      await sendAnswerFeedback(messageId, value);
    } catch {
      setFeedback((current) => {
        const next = { ...current };
        delete next[messageId];
        return next;
      });
    }
  }

  return (
    <section className="c-chat" aria-label={title}>
      <div className="c-chat-head">
        <span className="c-brand-mark" aria-hidden="true">
          AI
        </span>
        <span className="c-chat-head-text">
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </span>
        <span className="c-badge c-badge-brand c-badge-dot c-chat-scope">
          {scopeLabel}
        </span>
      </div>

      <div className="c-chat-body" ref={bodyRef} aria-live="polite">
        {turns.length === 0 && !loading ? (
          <div className="c-chat-welcome">
            <h3>{welcomeTitle}</h3>
            <p>{welcomeBody}</p>
            <div className="c-hero-suggestions">
              {suggestions.map((suggestion) => (
                <button
                  type="button"
                  className="c-chip"
                  key={suggestion}
                  onClick={() => void submitMessage(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="c-chat-turns">
            {turns.map((turn) => (
              <article className={`c-turn ${turn.role}`} key={turn.id}>
                <div className="c-bubble">
                  {turn.role === "assistant" && turn.status && (
                    <span className={`c-answer-state ${STATE_CLASS[turn.status]}`}>
                      {STATE_LABEL[turn.status]}
                    </span>
                  )}
                  <div>{turn.content}</div>
                </div>

                {turn.citations && turn.citations.length > 0 && (
                  <div className="c-citations">
                    <span className="c-citations-label">Sources</span>
                    {turn.citations.map((citation, index) =>
                      citation.url ? (
                        <a
                          className="c-citation"
                          href={citation.url}
                          target="_blank"
                          rel="noreferrer"
                          key={`${citation.source_id ?? "source"}-${index}`}
                        >
                          <i aria-hidden="true">↗</i>
                          {citation.title}
                        </a>
                      ) : (
                        <span
                          className="c-citation"
                          key={`${citation.source_id ?? "source"}-${index}`}
                        >
                          <i aria-hidden="true">§</i>
                          {citation.title}
                        </span>
                      ),
                    )}
                  </div>
                )}

                {turn.role === "assistant" &&
                  turn.messageId &&
                  turn.status !== "ERROR" && (
                    <div className="c-feedback">
                      {feedback[turn.messageId] ? (
                        <span>Thank you — noted for this team.</span>
                      ) : (
                        <>
                          <span>Was this helpful?</span>
                          <button
                            type="button"
                            onClick={() => void rateAnswer(turn.messageId!, "HELPFUL")}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void rateAnswer(turn.messageId!, "NOT_HELPFUL")
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
              <div className="c-typing" role="status" aria-label="Generating an answer">
                <i />
                <i />
                <i />
              </div>
            )}
          </div>
        )}
      </div>

      <form className="c-composer" onSubmit={handleSubmit}>
        <div className="c-composer-inner">
          <textarea
            ref={composerRef}
            rows={1}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label={placeholder}
            maxLength={4000}
          />
          <button
            className="c-send"
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send question"
          >
            ↑
          </button>
        </div>
        <p className="c-disclaimer">
          AI can make mistakes. Check the cited source or contact{" "}
          {organizationName} before acting on important decisions.
        </p>
      </form>
    </section>
  );
}
