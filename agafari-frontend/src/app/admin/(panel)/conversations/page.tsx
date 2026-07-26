"use client";

import { useMemo, useState } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import {
  EmptyPanel,
  ErrorPanel,
  LoadingRows,
  PageIntro,
  StatusBadge,
  relativeTime,
} from "@/components/clarity/workspace-ui";
import { listConversations } from "@/lib/clarity/client";
import type { ConversationRecord } from "@/lib/clarity/types";
import { useAsync } from "@/lib/clarity/use-async";

type Scope = "ALL" | "PUBLIC" | "INTERNAL";

function firstQuestion(conversation: ConversationRecord) {
  return (
    conversation.messages.find((message) => message.role === "user")?.content ??
    "Conversation with no question recorded"
  );
}

/** A conversation is worth attention when the assistant could not ground an answer. */
function needsAttention(conversation: ConversationRecord) {
  return conversation.messages.some(
    (message) =>
      message.answer_status === "UNANSWERED" ||
      message.answer_status === "LOW_CONFIDENCE" ||
      message.feedback === "NOT_HELPFUL",
  );
}

export default function ConversationsPage() {
  const { token } = useAdmin();
  const [scope, setScope] = useState<Scope>("ALL");
  const [onlyGaps, setOnlyGaps] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const conversations = useAsync(
    () => listConversations(token, scope === "ALL" ? undefined : scope),
    [token, scope],
  );

  const visible = useMemo(() => {
    const list = conversations.data ?? [];
    const needle = query.trim().toLowerCase();
    return list.filter((conversation) => {
      if (onlyGaps && !needsAttention(conversation)) return false;
      if (!needle) return true;
      return conversation.messages.some((message) =>
        message.content.toLowerCase().includes(needle),
      );
    });
  }, [conversations.data, onlyGaps, query]);

  // Falling back to the first row keeps a conversation on screen when filters
  // change, without an effect that re-renders on every list update.
  const selected = visible.find((item) => item.id === selectedId) ?? visible[0] ?? null;
  const gapCount = (conversations.data ?? []).filter(needsAttention).length;

  return (
    <>
      <PageIntro
        title="Conversations"
        description="Every exchange with your assistant, on the public site and from your staff. Read the ones it could not answer — each is a gap in your documents."
        actions={
          <div className="c-tabs" role="tablist" aria-label="Conversation scope">
            {(["ALL", "PUBLIC", "INTERNAL"] as const).map((value) => (
              <button
                key={value}
                role="tab"
                aria-selected={scope === value}
                onClick={() => setScope(value)}
              >
                {value === "ALL" ? "All" : value === "PUBLIC" ? "Visitors" : "Staff"}
              </button>
            ))}
          </div>
        }
      />

      <div className="admin-toolbar">
        <input
          className="c-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search what people asked"
          aria-label="Search conversations"
        />
        <label className="c-checkbox">
          <input
            type="checkbox"
            checked={onlyGaps}
            onChange={(event) => setOnlyGaps(event.target.checked)}
          />
          <span>Only unanswered or unhelpful ({gapCount})</span>
        </label>
      </div>

      {conversations.loading && !conversations.data ? (
        <LoadingRows count={4} />
      ) : conversations.error ? (
        <ErrorPanel message={conversations.error} onRetry={conversations.reload} />
      ) : visible.length === 0 ? (
        <EmptyPanel
          title="Nothing to show"
          body="Every question asked on your site or by your staff is recorded here."
        />
      ) : (
        <div className="admin-log">
          <div className="admin-log-list">
            {visible.map((conversation) => (
              <button
                type="button"
                className="admin-log-item"
                key={conversation.id}
                aria-pressed={conversation.id === selectedId}
                onClick={() => setSelectedId(conversation.id)}
              >
                <strong>{firstQuestion(conversation)}</strong>
                <span>
                  <span>{conversation.scope === "PUBLIC" ? "Visitor" : "Staff"}</span>
                  <span>{relativeTime(conversation.updated_at)}</span>
                  {needsAttention(conversation) && <span>Needs attention</span>}
                </span>
              </button>
            ))}
          </div>

          <div className="admin-transcript">
            {selected ? (
              <>
                <div className="admin-turn-meta">
                  <StatusBadge value={selected.scope} />
                  {selected.department && (
                    <span className="c-badge">{selected.department}</span>
                  )}
                  <span>{relativeTime(selected.updated_at)}</span>
                </div>

                {selected.messages.map((message) => (
                  <div className="admin-turn" data-role={message.role} key={message.id}>
                    <div className="admin-turn-meta">
                      <b>{message.role === "user" ? "Question" : "Answer"}</b>
                      {message.answer_status && (
                        <StatusBadge value={message.answer_status} />
                      )}
                      {message.feedback && (
                        <span className="c-badge">
                          {message.feedback === "HELPFUL"
                            ? "Marked helpful"
                            : "Marked not helpful"}
                        </span>
                      )}
                    </div>
                    <p>{message.content}</p>
                    {message.citations?.length > 0 && (
                      <div className="admin-cites">
                        {message.citations.map((citation, index) => (
                          <span
                            className="c-badge"
                            key={`${citation.source_id ?? "source"}-${index}`}
                          >
                            {citation.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <EmptyPanel
                title="Select a conversation"
                body="Pick one on the left to read the full exchange and the documents it cited."
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
